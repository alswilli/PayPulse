import { Component, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MajorComponent } from '../shared/majorComponent';
import { MAJORS } from '../shared/majorComponents';
import {TransactionService} from '../services/transaction.service';
import {Transaction} from '../shared/transaction';
import {AccountService} from '../services/account.service';
import {Account} from '../shared/account';
import { MatSelectionList, MatSelectionListChange, MatListOption } from '@angular/material';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { switchMap, flatMap, mergeMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
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
  currentAccount: Account;
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
    private fb: FormBuilder) { }

  ngOnChanges(changes: SimpleChanges) {
    console.log("CHANGE: ", changes)
  }

  ngOnInit() {
    this.isLoading = true;
    this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
    console.log(this.userAccountsDetails)
    this.currentAccountId = this.userAccountsDetails.currentAccount[0]._id; // will have to change later to get selectedAccount
    this.currentAccountName = this.userAccountsDetails.currentAccount[0].institutionName;
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

    this.selectionList.selectionChange.subscribe((s: MatSelectionListChange) => {          
      this.selectionList.deselectAll();
      console.log(s);
      s.option.selected = true;
    });

    // this.listValue = ["SOMETHING3", "SOMETHING4"];
    for (let account of this.userAccountsDetails.accounts) {
      console.log(this.listValue);
      this.listValue.push(account.institutionName);
    }
    this.preSelection.push(this.currentAccountName)
    console.log(this.listValue);
    console.log(this.preSelection);
    // this.clientForm = this.fb.group({
    //   myOtherControl: new FormControl(this.preSelection),
    // });
  }

  onAccountChanged(accountName) {
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
    // Need to change current attributes on backend and the getCurrentAccount()
    this.accountService.updateCurrentAccount(this.currentAccountId, nextId)
      .pipe(
        mergeMap((newCurrentAccount) => {
          return this.accountService.getAccounts(); // gets more info
        }),
        mergeMap((accounts) => {
          this.accounts = accounts;
          this.userAccountsIds = [];
          for (let account of accounts.accountsData) {
            console.log(account);
            this.userAccountsIds.push(account._id);
          }
          console.log(this.userAccountsIds)
          return this.accountService.getCurrentAccount();
        })
        // mergeMap((currAccount) => {
        //   this.authService.storeUserAccountsDetails({currentAccount: currAccount, accounts: this.accounts.accountsData, ids: this.userAccountsIds});
        // })
        // catchError((error) => {
        //   console.log(error);
        //   // handle the error accordingly.
        // })
      )
      .subscribe(currAccount => {
        this.authService.storeUserAccountsDetails({currentAccount: currAccount, accounts: this.accounts.accountsData, ids: this.userAccountsIds});
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

  onRemoveAccountClicked() {
    var element = document.getElementById("removeAccountButton");
    this.removeAccounts = !this.removeAccounts;
    if (this.removeAccounts) {
      element.innerText = "Cancel"
    }
    else {
      element.innerText = "Remove Account"
    }
  }

  onDeleteIconClicked(accountName) {
    console.log(accountName);
  }
}
