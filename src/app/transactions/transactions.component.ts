import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource, MatTable} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import {TransactionService} from '../services/transaction.service';
import {Transaction} from '../shared/transaction';
import { LoginComponent } from '../login/login.component';
import {AccountService} from '../services/account.service';
import {Account} from '../shared/account';
import {merge, Observable, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import { MatSelectionList, MatSelectionListChange } from '@angular/material';

export interface TransactionData {
  amount: string;
  transactionName: string;
  category: string;
  date: string;
}

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

  displayedColumns: string[] = ['accountName', 'amount', 'transactionName', 'category', 'date'];
  dataSource: MatTableDataSource<TransactionData>;
  transactions: Transaction[];
  accounts: Account[];
  errMess: string;
  totalPosts: number;
  userAccounts: Account[];
  userAccountsDetails;
  currentAccountId: string;
  postsPerPage = 10;
  currentPage = 1;
  adjustedPage: number;
  pageSizeOptions = [10, 25, 50, 100];
  isLoading = false;
  subAccount: string;
  subAccountId: string;
  subAccountsDict: any;
  balancesAvailableDict: any;
  balancesCurrentDict: any;


  listValue: any = [];
  preSelection = [];

  // actualPaginator: MatPaginator;
  // @ViewChild(MatPaginator)
  // set paginator(value: MatPaginator) {
  //   this.actualPaginator = value;
  // }

  @ViewChild(MatPaginator, {read: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatSelectionList) selectionList: MatSelectionList;

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.isLoading = true;
    console.log("ngInit");

    this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
    console.log(this.userAccountsDetails)
    this.currentAccountId = this.userAccountsDetails.currentAccount[0]._id; 
    console.log(this.currentAccountId);

    this.listValue.push('All');
    this.subAccount = 'All';
    this.subAccountId = null;
    this.subAccountsDict = {};
    this.subAccountsDict['All'] = null;
    this.balancesAvailableDict = {};
    this.balancesAvailableDict['All'] = null;
    this.balancesCurrentDict = {};
    this.balancesCurrentDict['All'] = 0;
    this.preSelection.push('All')
    console.log(this.preSelection);
    for (let account of this.userAccountsDetails.currentAccount) {
      for (let subAcc of account.subAccounts) {
        this.listValue.push(subAcc.name);
        // console.log(subAcc.name);
        // console.log(subAcc.account_id);
        // console.log(this.subAccountsDict);
        this.subAccountsDict[subAcc.name] = subAcc.account_id;
        this.balancesAvailableDict[subAcc.name] = subAcc.balances.available;
        this.balancesCurrentDict[subAcc.name] = subAcc.balances.current;
      }
    }

    // var totalAvailable = 0;
    var totalCurrent = 0;
    // console.log(this.balancesAvailableDict)
    // for (let key of this.balancesAvailableDict) {
    //   totalAvailable = totalAvailable + this.balancesAvailableDict[key];
    // }
    for (let key in this.balancesCurrentDict) {
      // console.log(this.balancesCurrentDict[key])
      totalCurrent = totalCurrent + this.balancesCurrentDict[key];
    }
    // console.log(totalAvailable);
    console.log(totalCurrent);
    this.balancesCurrentDict['All'] = totalCurrent;

    for (let key in this.balancesCurrentDict) {
      var currVal = String(this.balancesCurrentDict[key])
      var i = currVal.indexOf(".");
      if (i > -1 && i + 3 < currVal.length) {
        this.balancesCurrentDict[key] = Number(currVal.substring(0, i+3));
      }
    }

    console.log("List Value: ", this.listValue);
    console.log('Current Page: ', this.currentPage);
    this.adjustedPage = this.currentPage-1;
    // Now get the currentAccount transactions
    this.accountService.getTransactions(this.currentAccountId, this.postsPerPage, this.currentPage, this.subAccount, this.subAccountId)
    .subscribe(res => {
      console.log(res);
      this.isLoading = false;
      this.transactions = res.transactions;
      this.totalPosts = res.maxTransactions;
      for (let entry of this.transactions) {
        console.log(entry);
      }
      const parsedTransactions = [];
      var currAccountName;
      for (let entry of this.transactions) {
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
        parsedTransactions.push(newTransaction);
      }
      console.log("Parsed transactions: "+ parsedTransactions);

      // Assign the data to the data source for the table to render
      // this.dataSource = new MatTableDataSource(users);
      console.log("Paginator: ", this.paginator);
      this.dataSource = new MatTableDataSource(parsedTransactions);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      console.log("Data Source: ", this.dataSource);

      this.selectionList.selectionChange.subscribe((s: MatSelectionListChange) => {     
        console.log("yup")
        this.selectionList.deselectAll();
        console.log(s);
        s.option.selected = true;
      });
    },
      errmess => this.errMess = <any>errmess);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onChangedPage(pageData: PageEvent) {
    console.log(pageData);
    console.log("onChangedPage");
    this.isLoading = true;
    if (pageData) {
      this.currentPage = pageData.pageIndex+1;
      this.postsPerPage = pageData.pageSize;
    }
    this.accountService.getTransactions(this.currentAccountId, this.postsPerPage, this.currentPage, this.subAccount, this.subAccountId)
      .subscribe(res => {
        console.log(res)
        this.isLoading = false;
        this.adjustedPage = this.currentPage-1;
        this.transactions = res.transactions;
        this.totalPosts = res.maxTransactions;
        for (let entry of this.transactions) {
          console.log(entry);
        }
        const parsedTransactions = [];
        var currAccountName;
        for (let entry of this.transactions) {
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
          parsedTransactions.push(newTransaction);
        }
        console.log("Parsed transactions: "+ parsedTransactions);

        // Assign the data to the data source for the table to render
        // this.dataSource = new MatTableDataSource(users);
        console.log("Data Source: ", this.dataSource);

        this.dataSource.data = parsedTransactions;

        // this.table.renderRows();
        // this.dataSource.paginator = this.actualPaginator;
        console.log("Data Source: ", this.dataSource);
        // this.dataSource.sort = this.sort;
      },
        errmess => this.errMess = <any>errmess);
  }

  onSubAccountChanged(accountName) {
    console.log("Sub Account: ", accountName);
    this.subAccount = accountName;
    console.log(this.subAccountsDict);
    this.subAccountId = this.subAccountsDict[this.subAccount];
    console.log(this.subAccount);
    console.log(this.subAccountId);
    this.currentPage = 1;
    // this.dataSource.paginator.firstPage();

    this.onChangedPage(null)
  }

  sortData(event) {
    console.log(event);
  }

}

