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
  typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];

  clientForm: FormGroup;
  listValue: any = [];
  preSelection = [];

  constructor(private transactionService: TransactionService,
    private accountService: AccountService,
    private authService: AuthService,
    public dialog: MatDialog,
    private fb: FormBuilder) { }

  // ngOnChanges(changes: SimpleChanges) {
  //   console.log("CHANGE: ", changes)
  // }

  ngOnInit() {
    this.isLoading = true;
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
      // Now get the currentAccount transactions
      this.accountService.getRecentTransactions(this.currentAccountId)
        .subscribe(transactions => {
          this.isLoading = false;
          this.recentTransactions = transactions // ^still need for one above, and change service return type not actually a transaction object -> need to filter backend
          this.recentTransactions.forEach(element => {
            console.log(element);
          });
        },
          errmess => this.errMess = <any>errmess
      );

      this.selectionList.selectionChange.subscribe((s: MatSelectionListChange) => {     
        console.log("yup")
        this.selectionList.deselectAll();
        console.log(s);
        s.option.selected = true;
      });

      // this.listValue = ["SOMETHING3", "SOMETHING4"];
      
      this.preSelection.push(this.currentAccountName)
      console.log(this.preSelection);
      // this.clientForm = this.fb.group({
      //   myOtherControl: new FormControl(this.preSelection),
      // });
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
        // .pipe(
        //   // DON'T NEED TO DO THIS -> can just update localStorage
        //   mergeMap((newCurrentAccount) => {
        //     return this.accountService.getAccounts(); // gets more info
        //   }),
        //   mergeMap((accounts) => {
        //     this.accounts = accounts;
        //     this.userAccountsIds = [];
        //     for (let account of accounts.accountsData) {
        //       console.log(account);
        //       this.userAccountsIds.push(account._id);
        //     }
        //     console.log(this.userAccountsIds)
        //     return this.accountService.getCurrentAccount();
        //   })
        //   // mergeMap((currAccount) => {
        //   //   this.authService.storeUserAccountsDetails({currentAccount: currAccount, accounts: this.accounts.accountsData, ids: this.userAccountsIds});
        //   // })
        //   // catchError((error) => {
        //   //   console.log(error);
        //   //   // handle the error accordingly.
        //   // })
        // )
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
          var userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details')); // needs to be setItem instead
          console.log(userAccountsDetails)
          this.currentAccountId = userAccountsDetails.currentAccount[0]._id; // will have to change later to get selectedAccount
          this.currentAccountName = userAccountsDetails.currentAccount[0].institutionName;
          console.log(this.currentAccountId); 
          // Now get the currentAccount transactions
          this.accountService.getRecentTransactions(this.currentAccountId)
            .subscribe(transactions => {
              this.isLoading = false;
              this.recentTransactions = transactions // ^still need for one above, and change service return type not actually a transaction object -> need to filter backend
              this.recentTransactions.forEach(element => {
                console.log(element);
              });
            },
              errmess => this.errMess = <any>errmess
          );

          this.preSelection = [];// need to delete and then add
          this.preSelection.push(this.currentAccountName)  
          console.log(this.listValue);
          console.log(this.preSelection);
        },
          errmess => this.errMess = <any>errmess
      );
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
            var userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details')); // needs to be setItem instead
            console.log(userAccountsDetails)
            this.currentAccountId = userAccountsDetails.currentAccount[0]._id; // will have to change later to get selectedAccount
            this.currentAccountName = userAccountsDetails.currentAccount[0].institutionName;
            console.log(this.currentAccountId); 
            this.preSelection = [];// need to delete and then add
            this.preSelection.push(this.currentAccountName)  
            // Now get the currentAccount transactions
            this.accountService.getRecentTransactions(this.currentAccountId)
              .subscribe(transactions => {
                this.isLoading = false;
                this.recentTransactions = transactions // ^still need for one above, and change service return type not actually a transaction object -> need to filter backend
                this.recentTransactions.forEach(element => {
                  console.log(element);
                });
              },
                errmess => this.errMess = <any>errmess
              );
            },
            errmess => this.errMess = <any>errmess
            );
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
        }
    });
  }
}
