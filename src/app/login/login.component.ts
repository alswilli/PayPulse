import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { AuthService } from '../services/auth.service';
import { AccountService } from '../services/account.service';
import { Account } from '../shared/account';
import { GoalService } from '../services/goal.service';
import { mergeMap } from 'rxjs/operators';
import { Goal } from '../shared/goal';
import { UserGoal } from '../shared/usergoal';
import { Observable, forkJoin } from 'rxjs';

declare var FB: any;

interface UserGoalResponse {
  message: string;
  usergoals: UserGoal[];
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @ViewChild('loginform') loginFormDirective;

  loginForm: FormGroup;
  errMess: string;
  allGoals: Goal[];
  allUserGoals: UserGoal[];
  currAccountId: any;
  userId: any;
  everyAllUserGoals: any;
  accountIds: any;

  constructor(private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private accountService: AccountService,
    private goalService: GoalService,
    private _ngZone: NgZone) { 
    this.createForm();
  }

  formErrors = {
    'username': '',
    'password': '',
  };

  validationMessages = {
    'username': {
      'required':      'Username is required.',
    },
    'password': {
      'required':      'Password is required.'
    },
  };

  ngOnInit() {
    (window as any).fbAsyncInit = function() {
      FB.init({
        appId      : '366144767681380',
        cookies    : true,
        xfbml      : true,
        version    : 'v2.10'
      });
      FB.AppEvents.logPageView();
    };

    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "https://connect.facebook.net/en_US/sdk.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
  }

  createForm() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required] ],
      password: ['', [Validators.required] ]
    });

    this.loginForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now

  }

  onValueChanged(data?: any) {
    if (!this.loginForm) { return; }
    const form = this.loginForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    // this.feedback = this.feedbackForm.value;
    console.log("User logging in: ", this.loginForm.value);
    var user = this.loginForm.value;
    this.authService.logIn(user).subscribe(res => {
      if (res.success) {
        this.accountService.getAccounts().subscribe(res => {
          if (res.success) {
              var accountIds = [];
              for (let account of res.accountsData) {
                console.log(account);
                accountIds.push(account._id);
              }
              console.log(accountIds)
              this.accountService.getCurrentAccount().subscribe(currAccount => {
                if (currAccount != null) {
                  this.currAccountId = currAccount[0]._id;
                }
                this.authService.storeUserAccountsDetails({currentAccount: currAccount, accounts: res.accountsData, ids: accountIds});
                this.goalService.getGoals()
                .pipe(
                  mergeMap((goalResponse) => {
                    this.allGoals = goalResponse.goals;
                    return this.goalService.getUserGoals()
                  }),
                  mergeMap((usergoalResponse) => {
                    this.allUserGoals = usergoalResponse.usergoals;
                    let observables: Observable<any>[] = [];
                    for (let goal of this.allGoals) {
                      var found = false;
                      for (let usergoal of this.allUserGoals) {
                        if (usergoal.goalId == goal._id) {
                          found = true;
                          break;
                        }
                      }
                      var userId = JSON.parse(localStorage.getItem('JWT'))["userId"];
                      console.log(userId)
                      if (!found) {
                        const userGoalData = {
                          userId: userId,
                          goalId: goal._id,
                        }
                        observables.push(this.goalService.addUserGoal(userGoalData))
                      }
                    }
                    // return this.goalService.addUserGoal(userGoalData)
                    if (observables.length == 0) {
                      var retVal =  this.goalService.checkAndUpdateUserGoals(this.currAccountId, this.allGoals, this.allUserGoals)
                      console.log("BACK")
                      return retVal
                    }
                    forkJoin(observables)
                        .subscribe(dataArray => {
                            // All observables in `observables` array have resolved and `dataArray` is an array of result of each observable
                            console.log("In fork join")
                            for (let usergoal of dataArray[1]) {
                              this.allUserGoals.push(usergoal);
                            }
                            return this.goalService.checkAndUpdateUserGoals(this.currAccountId, this.allGoals, this.allUserGoals)
                        });
                  }),
                )
                .subscribe(checkResponse => {
                  // this.router.navigate(['/home']);
                });
              });
            }
        });
      }
    });

    // this.loginFormDirective.resetForm();
    // this.loginForm.reset({
    //   email: '',
    //   password: ''
    // });
  }

  facebookLogin(){
    console.log("submit login to facebook");
    // FB.login();
    FB.login((response)=>
        {
          console.log('submitLogin',response);
          if (response.authResponse)
          {
            //login success
            //login success code here
            //redirect to home page
            this.authService.logInFacebook(response.authResponse).subscribe(res => {
              if (res.success) {
                this.accountService.getAccounts().subscribe(res => {
                  if (res.success) {
                    this.accountService.getAccounts().subscribe(res => {
                      if (res.success) {
                          this.accountIds = [];
                          for (let account of res.accountsData) {
                            console.log(account);
                            this.accountIds.push(account._id);
                          }
                          console.log(this.accountIds)
                          this.accountService.getCurrentAccount()
                          .pipe(
                            mergeMap(currAccount => {
                                console.log(currAccount)
                                if (currAccount != null) {
                                  this.currAccountId = currAccount[0]._id;
                                }
                                // this.authService.storeUserAccountsDetails({currentAccount: currAccount, accounts: res.accountsData, ids: accountIds});
                                return this.goalService.getGoals()
                            }),
                            mergeMap(goalResponse => {
                                this.allGoals = goalResponse.goals;
                                let accountObservables: Observable<UserGoalResponse>[] = [];
                                this.userId = JSON.parse(localStorage.getItem('JWT'))["userId"];
                                console.log(this.userId)
                                for (let account of res.accountsData) {
                                  accountObservables.push(this.goalService.getUserGoals()) // update to have accountId
                                }
                                if (accountObservables.length == 0) {
                                  console.log("no accounts")
                                  return null
                                  // this._ngZone.run(() => this.router.navigate(['/home']));
                                }
                                else {
                                  return forkJoin(accountObservables)
                                }
                            }),
                            mergeMap(usergoalResponse => {
                                if (usergoalResponse == null) {
                                  return null
                                }
                                let goalObservables: Observable<any>[] = [];
                                this.everyAllUserGoals = usergoalResponse;
                                for (let userGoals of usergoalResponse) {
                                  this.allUserGoals = userGoals.usergoals;
                                  var userGoalDatas = []
                                  for (let goal of this.allGoals) {
                                    var found = false;
                                    for (let usergoal of this.allUserGoals) {
                                      if (usergoal.goalId == goal._id) {
                                        found = true;
                                        break;
                                      }
                                    }
                                    if (!found) {
                                      const userGoalData = {
                                        userId: this.userId,
                                        goalId: goal._id,
                                      }
                                      userGoalDatas.push(userGoalData)
                                    }
                                  }
                                  // if (userGoalDatas.length > 0) {
                                  //   goalObservables.push(this.goalService.addUserGoals(userGoalDatas))  // need to know which account
                                  // }
                                  goalObservables.push(this.goalService.addUserGoals(userGoalDatas))  // need to know which account and may be issue if empty
                                }
                                if (goalObservables.length == 0) {
                                  console.log("no user goals added")
                                  return null
                                }
                                else{
                                  return forkJoin(goalObservables)
                                }
                            }),
                            mergeMap(addedGoalsResponse => {
                                if (addedGoalsResponse == null) {
                                  return null
                                }
                                var index = 0
                                let finalUpdateObservables: Observable<any>[] = [];
                                for (let allUserGoals of this.everyAllUserGoals) {
                                  if (addedGoalsResponse[index] != null) { // need to return null if empty inside addUserGoals
                                    for (let usergoal of addedGoalsResponse[index]) {
                                      allUserGoals.push(usergoal);
                                    }
                                    finalUpdateObservables.push(this.goalService.checkAndUpdateUserGoals(this.accountIds[index], this.allGoals, allUserGoals))
                                  }
                                  index += 1
                                }
                                return forkJoin(finalUpdateObservables)
                            })       
                          )
                          .subscribe(res => {
                            console.log("made it to the end")
                            this._ngZone.run(() => this.router.navigate(['/home']));
                          })
                      }
                    });
                  }
                });
              }              
            });
          }
      });
  }

}
