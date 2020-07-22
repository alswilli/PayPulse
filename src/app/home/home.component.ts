import { Component, OnInit } from '@angular/core';
import { MajorComponent } from '../shared/majorComponent';
import { MAJORS } from '../shared/majorComponents';
import {TransactionService} from '../services/transaction.service';
import {Transaction} from '../shared/transaction';
import {AccountService} from '../services/account.service';
import {Account} from '../shared/account';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  majorComponents: MajorComponent[] = MAJORS;
  recentTransactions: Transaction[];
  userAccounts: Account[];
  currentAccount: Account;
  currentAccountId: string;
  currentAccountName: string;
  userAccountsIds: string[];
  errMess: string;
  isLoading = false;

  constructor(private transactionService: TransactionService,
    private accountService: AccountService) { }

  ngOnInit() {
    // this.accountService.getAccounts()
    //   .subscribe(res => {
    //     this.userAccounts = res.accountsData;
    //     this.currentAccount = this.userAccounts[0]; // will have to change later to get selectedAccount
    //     console.log(this.currentAccount);
    //     // Now get the currentAccount transactions
    //     this.accountService.getRecentTransactions(this.currentAccount._id)
    //       .subscribe(transactions => {
    //         this.recentTransactions = transactions // ^still need for one above, and change service return type not actually a transaction object -> need to filter backend
    //         this.recentTransactions.forEach(element => {
    //           console.log(element);
    //         });
    //       },
    //         errmess => this.errMess = <any>errmess);
    //   },
    //     errmess => this.errMess = <any>errmess);
    this.isLoading = true;
    var userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
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
        errmess => this.errMess = <any>errmess);
  }

}
