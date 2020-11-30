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
  everyAllUserGoals = [];
  accountIds: any;
  accountsData: Account[];
  currentAccounts: Account[];

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
              this.accountsData = res.accountsData
              for (let account of res.accountsData) {
                console.log(account);
                this.accountIds.push(account._id);
              }
              console.log(this.accountIds)
              this.accountService.getCurrentAccounts()
              .pipe(
                mergeMap(currAccounts => {
                    console.log("AAAAAAAA")
                    console.log(currAccounts)
                    this.currentAccounts = []
                    if (currAccounts.length > 0) {
                      this.currentAccounts = currAccounts
                    }
                    console.log("BBBBBBBB")
                    return this.goalService.getGoals()
                }),
                mergeMap(goalResponse => {
                    console.log("CCCCCCCC")
                    this.allGoals = goalResponse.goals;
                    console.log(this.allGoals)
                    this.userId = JSON.parse(localStorage.getItem('JWT'))["userId"];
                    console.log(this.userId)
                    console.log("DDDDDDDD")
                    return this.goalService.getUserGoals(this.userId)
                }),
                mergeMap(usergoalResponse => {
                    console.log("EEEEEEEE")
                    console.log(usergoalResponse)
                    // for (let res of usergoalResponse) {
                    //   this.everyAllUserGoals.push(res.usergoals);
                    // }
                    this.allUserGoals = usergoalResponse.usergoals;
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
                    console.log(userGoalDatas)
                    console.log("FFFFFFFF")
                    return this.goalService.addUserGoals(userGoalDatas, this.userId)
                }),
                mergeMap(addedGoalsResponse => { // arrays of addUserGoal responses
                    console.log("GGGGGGGG")  
                    console.log(addedGoalsResponse)
                    if (addedGoalsResponse != null) { // need to return null if empty inside addUserGoals
                      console.log("added new goals (res not null)")
                      for (let usergoal of addedGoalsResponse) {
                        this.allUserGoals.push(usergoal.usergoals);
                      }
                    }
                    console.log("HHHHHHHH")
                    return this.goalService.checkAndUpdateUserGoals(this.accountIds, this.allGoals, this.allUserGoals)
                }),
                mergeMap(checkRes => {
                  console.log("IIIIIIII")
                  // if (checkRes == null) { // won't happen?
                  //   return of(null)
                  // }
                  var index = 0;
                  let itemValidObservables: Observable<any>[] = [];
                  var foundInvalid = false;
                  console.log(checkRes)
                  for (let res of checkRes) {
                    console.log(res)
                    if (res == "item invalid") { //item invalid
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
                    console.log(itemValidObservables)
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
                    index += 1
                  }
                }
                // for (let account of this.accountsData) {
                //   if (account.current == true) {
                //     // this.authService.storeUserGoalsDetails({usergoals: this.everyAllUserGoals[index]});
                //     this.currentAccount = account
                //   }
                // }
                this.authService.storeGoalsDetails({goals: this.allGoals, usergoals: this.allUserGoals});
                this.authService.storeUserAccountsDetails({currentAccounts: this.currentAccounts, accounts: this.accountsData, ids: this.accountIds});
                this.router.navigate(['/home']);
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
                      this.accountService.getCurrentAccounts()
                      .pipe(
                        mergeMap(currAccounts => {
                            console.log("AAAAAAAA")
                            console.log(currAccounts)
                            this.currentAccounts = []
                            if (currAccounts.length > 0) {
                              this.currentAccounts = currAccounts
                            }
                            console.log("BBBBBBBB")
                            return this.goalService.getGoals()
                        }),
                        mergeMap(goalResponse => {
                            console.log("CCCCCCCC")
                            this.allGoals = goalResponse.goals;
                            console.log(this.allGoals)
                            this.userId = JSON.parse(localStorage.getItem('JWT'))["userId"];
                            console.log(this.userId)
                            console.log("DDDDDDDD")
                            return this.goalService.getUserGoals(this.userId)
                        }),
                        mergeMap(usergoalResponse => {
                            console.log("EEEEEEEE")
                            console.log(usergoalResponse)
                            // for (let res of usergoalResponse) {
                            //   this.everyAllUserGoals.push(res.usergoals);
                            // }
                            this.allUserGoals = usergoalResponse.usergoals;
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
                            console.log(userGoalDatas)
                            console.log("FFFFFFFF")
                            return this.goalService.addUserGoals(userGoalDatas, this.userId)
                        }),
                        mergeMap(addedGoalsResponse => { // arrays of addUserGoal responses
                            console.log("GGGGGGGG")  
                            console.log(addedGoalsResponse)
                            if (addedGoalsResponse != null) { // need to return null if empty inside addUserGoals
                              console.log("added new goals (res not null)")
                              for (let usergoal of addedGoalsResponse) {
                                this.allUserGoals.push(usergoal.usergoals);
                              }
                            }
                            console.log("HHHHHHHH")
                            return this.goalService.checkAndUpdateUserGoals(this.accountIds, this.allGoals, this.allUserGoals)
                        }),
                        mergeMap(checkRes => {
                          console.log("IIIIIIII")
                          // if (checkRes == null) { // won't happen?
                          //   return of(null)
                          // }
                          var index = 0;
                          let itemValidObservables: Observable<any>[] = [];
                          var foundInvalid = false;
                          console.log(checkRes)
                          for (let res of checkRes) {
                            console.log(res)
                            if (res == "item invalid") { //item invalid
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
                            console.log(itemValidObservables)
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
                            index += 1
                          }
                        }
                        // for (let account of this.accountsData) {
                        //   if (account.current == true) {
                        //     // this.authService.storeUserGoalsDetails({usergoals: this.everyAllUserGoals[index]});
                        //     this.currentAccount = account
                        //   }
                        // }
                        this.authService.storeGoalsDetails({goals: this.allGoals, usergoals: this.allUserGoals});
                        this.authService.storeUserAccountsDetails({currentAccounts: this.currentAccounts, accounts: this.accountsData, ids: this.accountIds});
                        this._ngZone.run(() => this.router.navigate(['/home']));
                      })
                  }
                });
              }             
            }); //this._ngZone.run(() => this.router.navigate(['/home']));
          }
      });
  }

}
