import { Component, OnInit } from '@angular/core';
import {AccountService} from '../services/account.service';
import { AuthService } from '../services/auth.service';
import {Account} from '../shared/account';
import { Router } from "@angular/router";


@Component({
  selector: 'app-link-account',
  templateUrl: './link-account.component.html',
  styleUrls: ['./link-account.component.scss']
})
export class LinkAccountComponent implements OnInit {

  // accounts: Account[];
  errMess: string;

  constructor(private accountService: AccountService,
    private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
  }

  onPlaidSuccess(event) {
    // Send the public token to your server so you can do the token exchange.
    console.log("Plaid success event: " + JSON.stringify(event));
    this.accountService.addAccount(event).subscribe(res => {
      if (res) {
        console.log("Successfully added account!")
        this.accountService.getAccounts().subscribe(getRes => {
          if (getRes.success) {
            // this.router.navigate(['/home']);
            // this._ngZone.run(() => this.router.navigate(['/home']));
            // Need to check the accounts array on the user object. Can store in localStorage once got
            var accountIds = [];
            for (let account of getRes.accountsData) {
              console.log(account);
              accountIds.push(account._id);
            }
            console.log(accountIds)
            this.accountService.getCurrentAccount().subscribe(currAccount => {
              this.authService.storeUserAccountsDetails({currentAccount: currAccount, accounts: getRes.accountsData, ids: accountIds});
              this.router.navigate(['/home']);
              }, 
              error => {
                console.log(error);
                this.errMess = error;
              }
            );
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
        // var accountIds = [];
        // accountIds.push(res._id);
        // console.log(accountIds)
        // this.accountService.getCurrentAccount().subscribe(currAccount => {
        //   this.authService.storeUserAccountsDetails({currentAccount: currAccount, accounts: [res], ids: accountIds});
        //   this.router.navigate(['/home']);
        // }, 
        // error => {
        //   console.log(error);
        //   this.errMess = error;
        // });
      }
      else {
        console.log(res)
        console.log("addAccount() method from account service was not a success")
      }
    },
    error => {
      console.log(error);
      this.errMess = error;
    });
  }

  onPlaidExit(event) {
    // Get errors or exit reason.
    console.log("Plaid exit event: " + event);
  }

  onPlaidEvent(event) {
    // Log events so you can have insight into how your users are using plaid link.
    console.log("Plaid event: " + event);
  }

  onPlaidLoad(event) {
    // Do something when the iframe loads.
    console.log("Plaid load event: " + event);
  }

  onPlaidClick(event) {
    // Do something when the button is clicked.
    console.log("Plaid click event: " + event);
  }

}
