import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { AuthService } from '../services/auth.service';
import {AccountService} from '../services/account.service';
import {Account} from '../shared/account';
declare var FB: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @ViewChild('loginform') loginFormDirective;

  loginForm: FormGroup;
  errMess: string;

  constructor(private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private accountService: AccountService,
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
                this.authService.storeUserAccountsDetails({currentAccount: currAccount, accounts: res.accountsData, ids: accountIds});
                this.router.navigate(['/home']);
              }, 
              error => {
                console.log(error);
                this.errMess = error;
              });
            }
          else {
            console.log(res)
            console.log("Get Accounts method from account service was not a success")
          }
        },
        error => {
          console.log(error);
          this.errMess = error;
        });
      }
      else {
        console.log(res)
        console.log("Login method from auth service was not a success")
      }
    },
    error => {
      console.log(error);
      this.errMess = error;
    });

    // if (user.email && user.password) {
    //   // [routerLink]="['/dishdetail', dish.id]"
    //   this.router.navigate(['/home']);
    // }
    this.loginFormDirective.resetForm();
    this.loginForm.reset({
      email: '',
      password: ''
    });
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
                    // this.router.navigate(['/home']);
                    // this._ngZone.run(() => this.router.navigate(['/home']));
                    // Need to check the accounts array on the user object. Can store in localStorage once got
                    // if (res.numAccounts == 0) {
                    //   this._ngZone.run(() => this.router.navigate(['/linkAccount']));
                    // }
                    // else {
                    //   var accountIds = [];
                    //   for (let account of res.accountsData) {
                    //     console.log(account);
                    //     accountIds.push(account._id);
                    //   }
                    //   console.log(accountIds)
                    //   this.accountService.getCurrentAccount().subscribe(currAccount => {
                    //     this.authService.storeUserAccountsDetails({currentAccount: currAccount, accounts: res.accountsData, ids: accountIds});
                    //     this._ngZone.run(() => this.router.navigate(['/home']));
                    //   }, 
                    //   error => {
                    //     console.log(error);
                    //     this.errMess = error;
                    //   });
                    // }
                      var accountIds = [];
                      for (let account of res.accountsData) {
                        console.log(account);
                        accountIds.push(account._id);
                      }
                      console.log(accountIds)
                      this.accountService.getCurrentAccount().subscribe(currAccount => {
                        this.authService.storeUserAccountsDetails({currentAccount: currAccount, accounts: res.accountsData, ids: accountIds});
                        this._ngZone.run(() => this.router.navigate(['/home']));
                      }, 
                      error => {
                        console.log(error);
                        this.errMess = error;
                      });
                  }
                  else {
                    console.log(res)
                    console.log("Get Accounts method from account service was not a success")
                  }
                },
                error => {
                  console.log(error);
                  this.errMess = error;
                });
              }
              else {
                console.log(res)
                console.log("Login method via facebook from auth service was not a success")
              }
            },
            error => {
              console.log(error);
              this.errMess = error;
            });
           }
           else
           {
           console.log('User login failed');
         }
      });
  }

}
