import { Component, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MajorComponent } from '../shared/majorComponent';
import { MAJORS } from '../shared/majorComponents';
import {TransactionService} from '../services/transaction.service';
import {Transaction} from '../shared/transaction';
import {AccountService} from '../services/account.service';
import {Account} from '../shared/account';
import { MatSelectionList, MatSelectionListChange, MatListOption, MatDialog } from '@angular/material';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { switchMap, flatMap, mergeMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { DeleteAccountComponent } from '../delete-account/delete-account.component';
import { ErrorComponent } from '../error/error.component';
// import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild(MatSelectionList) selectionList: MatSelectionList;

  majorComponents: MajorComponent[] = MAJORS;
  recentTransactions: Transaction[];
  parsedTransactions: Object[];
  userAccountsDetails: any;
  accounts: any;
  currentAccount: any;
  currentAccountOption: MatListOption;
  currentAccountId: string;
  currentAccountName: string;
  userAccountsIds: string[];
  errMess: string;
  isLoading = false;
  removeAccounts = false;
  firstLoad = false;
  fullLoad = false;

  clientForm: FormGroup;
  listValue: any = [];
  preSelection = [];

  constructor(private transactionService: TransactionService,
    private accountService: AccountService,
    private authService: AuthService,
    public dialog: MatDialog,
    private fb: FormBuilder) { }

  ngOnChanges(changes: SimpleChanges) {
    console.log("CHANGE: ", changes)
  }

  ngOnInit() {
    this.isLoading = true;
    // this.firstLoad = true;
    this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
    console.log(this.userAccountsDetails)

    for (let account of this.userAccountsDetails.accounts) {
      this.listValue.push(account.institutionName);
    }

    console.log("List Value: ", this.listValue);

    if (this.listValue.length > 0) {
      this.currentAccountId = this.userAccountsDetails.currentAccount[0]._id; // will have to change later to get selectedAccount
      this.currentAccountName = this.userAccountsDetails.currentAccount[0].institutionName;
      this.currentAccount = this.userAccountsDetails.currentAccount[0];
      this.accounts = this.userAccountsDetails.accounts;
      this.userAccountsIds = this.userAccountsDetails.ids
      console.log("Current Account Id: ", this.currentAccountId); 
      console.log("All Accounts: ", this.accounts);
      var today = new Date();
      var numDays = today.getDate() - 1;
      var subDays = 0;
      // Now get the currentAccount transactions
      this.accountService.getRecentTransactions(this.currentAccountId, numDays, subDays)
        .subscribe(transactions => {
          this.isLoading = false;
          // this.firstLoad = false;
          this.recentTransactions = transactions // ^still need for one above, and change service return type not actually a transaction object -> need to filter backend
          this.recentTransactions.forEach(element => {
            console.log(element);
          });
          var currAccountName;
          this.parsedTransactions = [];
          for (let entry of this.recentTransactions) {
            // Translate account_id to account name
            for (let account of this.userAccountsDetails.currentAccount) {
              for (let subAcc of account.subAccounts) {
                if (subAcc.account_id === entry.account_id) {
                  currAccountName = subAcc.name;
                  break;
                }
              }
            }
            const newTransaction = {
              amount: entry.amount,
              transactionName: entry.transactionName,
              category: entry.category,
              date: entry.date,
              accountName: currAccountName
            };
            this.parsedTransactions.push(newTransaction);
          }
          console.log("Parsed transactions: "+ this.parsedTransactions);
          this.selectionList.selectionChange.subscribe((s: MatSelectionListChange) => {     
            console.log("yup")
            this.selectionList.deselectAll();
            console.log(s);
            s.option.selected = true;
          });
        });

      // this.listValue = ["SOMETHING3", "SOMETHING4"];
      
      this.preSelection.push(this.currentAccountName)
      console.log(this.preSelection);
      // this.clientForm = this.fb.group({
      //   myOtherControl: new FormControl(this.preSelection),
      // });
    }
    else {
      // May need something here later
      this.isLoading = false;
      // this.firstLoad = false;
      this.selectionList.selectionChange.subscribe((s: MatSelectionListChange) => {     
        console.log("yup")
        this.selectionList.deselectAll();
        console.log(s);
        s.option.selected = true;
      });
    }
  }

  onAccountChanged(accountName) {
    if (!this.removeAccounts) {
      console.log(accountName);
      this.isLoading = true;
      var nextId;
      for (let account of this.userAccountsDetails.accounts) {
        console.log(account)
        if (account.institutionName === accountName) {
          nextId = account._id;
          break;
        } 
      }
      console.log("Next Id: ", nextId);
      // Need to change current attributes on backend 
      var update = {current: false};
      this.accountService.updateCurrentAccount(this.currentAccountId, update)
        .pipe(
          mergeMap((account) => {
            var update = {current: true};
            return this.accountService.updateCurrentAccount(nextId, update)
          })
        )
        .subscribe(account => {
          this.currentAccount = account;
          console.log(this.accounts);
          // Make old current account = false
          for (let account of this.accounts) {
            if (account.current === true) {
              account.current = false;
              console.log(account)
              break;
            } 
          }
          // Make new current account = true
          for (let account of this.accounts) {
            if (account.institutionName === this.currentAccount.institutionName) {
              account.current = true;
              console.log(account)
              break;
            } 
          }
          console.log("Updated accounts: ", this.accounts)
          this.authService.storeUserAccountsDetails({currentAccount: [this.currentAccount], accounts: this.accounts, ids: this.userAccountsIds});
          this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details')); // needs to be setItem instead
          console.log(this.userAccountsDetails)
          this.currentAccountId = this.userAccountsDetails.currentAccount[0]._id; // will have to change later to get selectedAccount
          this.currentAccountName = this.userAccountsDetails.currentAccount[0].institutionName;
          console.log(this.currentAccountId); 
          console.log(this.currentAccountName);
          var today = new Date();
          var numDays = today.getDate() - 1;
          var subDays = 0;
          // Now get the currentAccount transactions
          this.accountService.getRecentTransactions(this.currentAccountId, numDays, subDays)
            .subscribe(transactions => {
              this.isLoading = false;
              this.recentTransactions = transactions // ^still need for one above, and change service return type not actually a transaction object -> need to filter backend
              this.recentTransactions.forEach(element => {
                console.log(element);
              });
              var currAccountName;
              this.parsedTransactions = [];
              console.log("AHH: ", this.currentAccount)
              for (let entry of this.recentTransactions) {
                // Translate account_id to account name
                console.log(entry.account_id)
                for (let account of this.userAccountsDetails.currentAccount) { // this part needs to be different
                  console.log(account)
                  for (let subAcc of account.subAccounts) {
                    if (subAcc.account_id === entry.account_id) {
                      console.log("FOUND A MATCH")
                      currAccountName = subAcc.name;
                      break;
                    }
                  }
                }
                const newTransaction = {
                  amount: entry.amount,
                  transactionName: entry.transactionName,
                  category: entry.category,
                  date: entry.date,
                  accountName: currAccountName
                };
                this.parsedTransactions.push(newTransaction);
              }
              console.log("Parsed transactions: "+ this.parsedTransactions);
            });

          this.preSelection = [];// need to delete and then add
          this.preSelection.push(this.currentAccountName)  
          console.log(this.listValue);
          console.log(this.preSelection);
        });
    }
  }

  onAddedAccount() {
    this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
    console.log(this.userAccountsDetails)

    if (this.listValue.length === 0) {
      this.isLoading = true;
      this.fullLoad = false;

      for (let account of this.userAccountsDetails.accounts) {
        this.listValue.push(account.institutionName);
      }
  
      console.log("List Value: ", this.listValue);

      this.currentAccountId = this.userAccountsDetails.currentAccount[0]._id; // will have to change later to get selectedAccount
      this.currentAccountName = this.userAccountsDetails.currentAccount[0].institutionName;
      this.currentAccount = this.userAccountsDetails.currentAccount[0];
      this.accounts = this.userAccountsDetails.accounts;
      this.userAccountsIds = this.userAccountsDetails.ids
      console.log("Current Account Id: ", this.currentAccountId); 
      console.log("All Accounts: ", this.accounts);
      var today = new Date();
      var numDays = today.getDate() - 1;
      var subDays = 0;
      // Now get the currentAccount transactions
      this.accountService.getRecentTransactions(this.currentAccountId, numDays, subDays)
        .subscribe(transactions => {
          this.isLoading = false;
          this.firstLoad = false;
          this.recentTransactions = transactions // ^still need for one above, and change service return type not actually a transaction object -> need to filter backend
          this.recentTransactions.forEach(element => {
            console.log(element);
          });
          var currAccountName;
          this.parsedTransactions = [];
          for (let entry of this.recentTransactions) {
            // Translate account_id to account name
            for (let account of this.userAccountsDetails.currentAccount) {
              for (let subAcc of account.subAccounts) {
                if (subAcc.account_id === entry.account_id) {
                  currAccountName = subAcc.name;
                  break;
                }
              }
            }
            const newTransaction = {
              amount: entry.amount,
              transactionName: entry.transactionName,
              category: entry.category,
              date: entry.date,
              accountName: currAccountName
            };
            this.parsedTransactions.push(newTransaction);
          }
          console.log("Parsed transactions: "+ this.parsedTransactions);
        });

      // this.listValue = ["SOMETHING3", "SOMETHING4"];
      
      this.preSelection.push(this.currentAccountName)
      console.log(this.preSelection);
      // this.clientForm = this.fb.group({
      //   myOtherControl: new FormControl(this.preSelection),
      // });
    }
    else {
      this.listValue.push(this.userAccountsDetails.accounts[this.userAccountsDetails.accounts.length - 1].institutionName);
      this.firstLoad = false;
    }
  }

  onRemoveAccountClicked() {
    var element = document.getElementById("removeAccountButton");
    this.removeAccounts = !this.removeAccounts;
    if (this.removeAccounts) {
      element.innerText = "Cancel"
    }
    else {
      element.innerText = "Remove Accounts"
    }
  }

  onDeleteIconClicked(accountName) {
    console.log(accountName);
    const deleteAccountRef = this.dialog.open(DeleteAccountComponent, {data: {accountName: accountName, userAccountsDetails: this.userAccountsDetails}});
    deleteAccountRef.componentInstance.onDelete
      .subscribe(result => {
        console.log(result);
        // Delete account from listValue array 
        const index = this.listValue.indexOf(result.institutionName, 0);
        if (index > -1) {
          this.listValue.splice(index, 1);
        }
        // Close dialogue ref
        deleteAccountRef.close();

        // Update current account as needed (updates localStorage in the process)
        if (this.listValue.length > 0 && result.current) {
          // this.onAccountChanged(this.listValue[0]) // current becomes one at the top
          this.isLoading = true;
          var accountIndex = 0;
          for (let account of this.accounts) {
            if (account.institutionName === result.institutionName) {
              break;
            } 
            accountIndex++;
          } 
          // Delete old current from account local array
          if (accountIndex > -1) {
            this.accounts.splice(accountIndex, 1);
          }
          // Delete account from userAccountsIds array 
          const accountIdIndex = this.userAccountsIds.indexOf(result._id, 0);
          if (accountIdIndex > -1) {
            this.userAccountsIds.splice(accountIdIndex, 1);
          }
          // Get new account id
          var newAccountID = this.userAccountsIds[0];

          this.accountService.updateCurrentAccount(newAccountID, {current: true})
            .subscribe(account => {
            this.currentAccount = account;
            console.log(this.accounts);
            // Make new current account = true
            for (let account of this.accounts) {
              if (account.institutionName === this.currentAccount.institutionName) {
                account.current = true;
                console.log(account)
                break;
              } 
            }
            console.log("Updated accounts: ", this.accounts)
            this.authService.storeUserAccountsDetails({currentAccount: [this.currentAccount], accounts: this.accounts, ids: this.userAccountsIds});
            this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details')); // needs to be setItem instead
            console.log(this.userAccountsDetails)
            this.currentAccountId = this.userAccountsDetails.currentAccount[0]._id; // will have to change later to get selectedAccount
            this.currentAccountName = this.userAccountsDetails.currentAccount[0].institutionName;
            console.log(this.currentAccountId); 
            this.preSelection = [];// need to delete and then add
            this.preSelection.push(this.currentAccountName)  
            var today = new Date();
            var numDays = today.getDate() - 1;
            var subDays = 0;
            // Now get the currentAccount transactions
            this.accountService.getRecentTransactions(this.currentAccountId, numDays, subDays)
              .subscribe(transactions => {
                this.isLoading = false;
                this.recentTransactions = transactions // ^still need for one above, and change service return type not actually a transaction object -> need to filter backend
                this.recentTransactions.forEach(element => {
                  console.log(element);
                });
                var currAccountName;
                this.parsedTransactions = [];
                for (let entry of this.recentTransactions) {
                  // Translate account_id to account name
                  for (let account of this.userAccountsDetails.currentAccount) {
                    for (let subAcc of account.subAccounts) {
                      if (subAcc.account_id === entry.account_id) {
                        currAccountName = subAcc.name;
                        break;
                      }
                    }
                  }
                  const newTransaction = {
                    amount: entry.amount,
                    transactionName: entry.transactionName,
                    category: entry.category,
                    date: entry.date,
                    accountName: currAccountName
                  };
                  this.parsedTransactions.push(newTransaction);
                }
                console.log("Parsed transactions: "+ this.parsedTransactions);
              });
            });
        }
        else if (this.listValue.length > 0) {
          // Delete account from accounts array
          var accountIndex = 0;
          for (let account of this.accounts) {
            if (account.institutionName === result.institutionName) {
              break;
            } 
            accountIndex++;
          } 
          // const accountIndex = this.accounts.indexOf(result, 0);
          if (accountIndex > -1) {
            this.accounts.splice(accountIndex, 1);
          } 

          // Delete account from userAccountsIds array 
          const accountIdIndex = this.userAccountsIds.indexOf(result._id, 0);
          if (accountIdIndex > -1) {
            this.userAccountsIds.splice(accountIdIndex, 1);
          }
          console.log(this.accounts)
          console.log(this.userAccountsIds)
          this.authService.storeUserAccountsDetails({currentAccount: [this.currentAccount], accounts: this.accounts, ids: this.userAccountsIds});
          this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
          console.log(this.userAccountsDetails)
        }
        else if (this.listValue.length === 0) { 
          localStorage.setItem('User Accounts Details', JSON.stringify({currentAccount: [], accounts: [], ids: []}));
          this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
          // this.onRemoveAccountClicked();
          this.removeAccounts = !this.removeAccounts;
        }
    });
  }


  // PLAID FUNCTIONS
  onPlaidSuccess(event) {
    // Send the public token to your server so you can do the token exchange.
    console.log("Plaid success event: " + JSON.stringify(event));
    if (this.listValue.length > 0) {
      this.firstLoad = true;
    }
    else {
      this.fullLoad = true;
    }
    this.accountService.addAccount(event).subscribe(res => {
      if (res) {
        console.log("Successfully added account!")
        if (this.listValue.length === 0) {
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
                // this.router.navigate(['/home']);
                this.onAddedAccount();
                });
            }
            else {
              console.log(res)
              console.log("Get Accounts method from account service was not a success")
            }
          });
        }
        else { 
          // Append new account to accounts array
          this.accounts.push(res)
          // Append new account to userAccountsIds array 
          this.userAccountsIds.push(res._id)
          // Update local storage
          this.authService.storeUserAccountsDetails({currentAccount: [this.currentAccount], accounts: this.accounts, ids: this.userAccountsIds});
          this.onAddedAccount();
        }
      }
      else {
        console.log(res)
        console.log("addAccount() method from account service was not a success")
        this.firstLoad = false;
        this.fullLoad = false;
      }
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
