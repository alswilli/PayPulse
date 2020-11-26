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
import { Observable, forkJoin, of } from 'rxjs';

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
  accountsData: Account[];
  currentAccount: Account;

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
            this.accountIds = [];
            for (let account of res.accountsData) {
              console.log(account);
              this.accountIds.push(account._id);
            }
            console.log(this.accountIds)
            this.accountService.getCurrentAccount()
            .pipe(
              mergeMap(currAccount => {
                  console.log("AAAAAAAA")
                  console.log(currAccount)
                  if (currAccount != null) {
                    this.currAccountId = currAccount[0]._id;
                  }
                  // this.authService.storeUserAccountsDetails({currentAccount: currAccount, accounts: res.accountsData, ids: accountIds});
                  console.log("BBBBBBBB")
                  return this.goalService.getGoals()
              }),
              mergeMap(goalResponse => {
                  console.log("CCCCCCCC")
                  this.allGoals = goalResponse.goals;
                  let accountObservables: Observable<UserGoalResponse>[] = [];
                  this.userId = JSON.parse(localStorage.getItem('JWT'))["userId"];
                  console.log(this.userId)
                  for (let account of res.accountsData) {
                    accountObservables.push(this.goalService.getUserGoals()) // update to have accountId
                  }
                  if (accountObservables.length == 0) {
                    console.log("no accounts")
                    return of(null)
                    // this._ngZone.run(() => this.router.navigate(['/home']));
                  }
                  else {
                    console.log("DDDDDDDD")
                    return forkJoin(accountObservables)
                  }
              }),
              mergeMap(usergoalResponse => {
                  console.log("EEEEEEEE")
                  if (usergoalResponse == null) {
                    return of(null)
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
                  console.log("FFFFFFFF")
                  return forkJoin(goalObservables)
              }),
              mergeMap(addedGoalsResponse => { // array with arrays of addUserGoal responses
                  console.log("GGGGGGGG")  
                  if (addedGoalsResponse == null) {
                    return of(null)
                  }
                  var index = 0
                  let finalUpdateObservables: Observable<any>[] = [];
                  for (let allUserGoals of this.everyAllUserGoals) {
                    if (addedGoalsResponse[index] != null) { // need to return null if empty inside addUserGoals
                      for (let usergoal of addedGoalsResponse[index]) {
                        allUserGoals.push(usergoal);
                      }
                    }
                    finalUpdateObservables.push(this.goalService.checkAndUpdateUserGoals(this.accountIds[index], this.allGoals, allUserGoals))
                    index += 1
                  }
                  console.log("HHHHHHHH")
                  return forkJoin(finalUpdateObservables)
              })       
            )
            .subscribe(res => {
              console.log("made it to the end")
              // this.authService.storeUserAccountsDetails({currentAccount: currAccount, accounts: res.accountsData, ids: accountIds});
              // this._ngZone.run(() => this.router.navigate(['/home']));
            })
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
                      this.accountIds = [];
                      this.accountsData = res.accountsData
                      for (let account of res.accountsData) {
                        console.log(account);
                        this.accountIds.push(account._id);
                      }
                      console.log(this.accountIds)
                      this.accountService.getCurrentAccount()
                      .pipe(
                        mergeMap(currAccount => {
                            console.log("AAAAAAAA")
                            console.log(currAccount)
                            this.currentAccount = currAccount
                            if (currAccount != null) {
                              this.currAccountId = currAccount[0]._id;
                            }
                            // this.authService.storeUserAccountsDetails({currentAccount: currAccount, accounts: res.accountsData, ids: accountIds});
                            console.log("BBBBBBBB")
                            return this.goalService.getGoals()
                        }),
                        mergeMap(goalResponse => {
                            console.log("CCCCCCCC")
                            this.allGoals = goalResponse.goals;
                            let accountObservables: Observable<UserGoalResponse>[] = [];
                            this.userId = JSON.parse(localStorage.getItem('JWT'))["userId"];
                            console.log(this.userId)
                            for (let account of res.accountsData) {
                              accountObservables.push(this.goalService.getUserGoals()) // update to have accountId
                            }
                            if (accountObservables.length == 0) {
                              console.log("no accounts")
                              return of(null)
                              // this._ngZone.run(() => this.router.navigate(['/home']));
                            }
                            else {
                              console.log("DDDDDDDD")
                              return forkJoin(accountObservables)
                            }
                        }),
                        mergeMap(usergoalResponse => {
                            console.log("EEEEEEEE")
                            if (usergoalResponse == null) {
                              return of(null)
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
                            console.log("FFFFFFFF")
                            return forkJoin(goalObservables)
                        }),
                        mergeMap(addedGoalsResponse => { // array with arrays of addUserGoal responses
                            console.log("GGGGGGGG")  
                            if (addedGoalsResponse == null) {
                              return of(null)
                            }
                            var index = 0
                            let finalUpdateObservables: Observable<any>[] = [];
                            for (let allUserGoals of this.everyAllUserGoals) {
                              if (addedGoalsResponse[index] != null) { // need to return null if empty inside addUserGoals
                                for (let usergoal of addedGoalsResponse[index]) {
                                  allUserGoals.push(usergoal);
                                }
                              }
                              finalUpdateObservables.push(this.goalService.checkAndUpdateUserGoals(this.accountIds[index], this.allGoals, allUserGoals))
                              index += 1
                            }
                            console.log("HHHHHHHH")
                            return forkJoin(finalUpdateObservables)
                        }),
                        mergeMap(checkRes => {
                          console.log("IIIIIIII")
                          var index = 0;
                          let itemValidObservables: Observable<any>[] = [];
                          var foundInvalid = false;
                          console.log(checkRes)
                          for (let res of checkRes) {
                            if (res != null && res == "item invalid") {
                              foundInvalid = true;
                              var update = {itemValid: false};
                              itemValidObservables.push(this.accountService.updateItemInvalidAccount(this.accountIds[index], update))
                            }
                            else {
                              itemValidObservables.push(of(null))
                            }
                          }
                          if (foundInvalid) {
                            console.log("JJJJJJJJ")
                            return forkJoin(itemValidObservables)
                          }
                          else {
                            return of(null)
                          } 
                        })
                      )
                      .subscribe(validRes => {
                        console.log("made it to the end")
                        if (validRes != null) {
                          var index = 0
                          for (let updatedAccount of validRes) {
                            if (updatedAccount != null) {
                              this.accountsData[index].itemValid = false;
                            }
                            if (this.accountsData[index].current == true) {
                              this.authService.storeUserGoalsDetails({usergoals: this.everyAllUserGoals[index]});
                              this.currentAccount = this.accountsData[index]
                            }
                            index += 1
                          }
                        }
                        this.authService.storeUserAccountsDetails({currentAccount: this.currentAccount, accounts: this.accountsData, ids: this.accountIds});
                        // this._ngZone.run(() => this.router.navigate(['/home']));
                      })
                  }
                });
              }              
            });
          }
      });
  }

}
