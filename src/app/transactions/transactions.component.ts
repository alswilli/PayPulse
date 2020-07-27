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
  postsPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 25, 100];
  isLoading = false;

  // actualPaginator: MatPaginator;
  // @ViewChild(MatPaginator)
  // set paginator(value: MatPaginator) {
  //   this.actualPaginator = value;
  // }

  @ViewChild(MatPaginator, {read: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.isLoading = true;
    console.log("ngInit");

    this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
    console.log(this.userAccountsDetails)
    this.currentAccountId = this.userAccountsDetails.currentAccount[0]._id; 
    console.log(this.currentAccountId);
    // Now get the currentAccount transactions
    this.accountService.getTransactions(this.currentAccountId, this.postsPerPage, this.currentPage)
    .subscribe(res => {
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
    this.currentPage = pageData.pageIndex+1;
    this.postsPerPage = pageData.pageSize;
    this.accountService.getTransactions(this.currentAccountId, this.postsPerPage, this.currentPage)
      .subscribe(res => {
        console.log(res)
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
        console.log("Data Source: ", this.dataSource);

        this.dataSource.data = parsedTransactions;

        // this.table.renderRows();
        // this.dataSource.paginator = this.actualPaginator;
        console.log("Data Source: ", this.dataSource);
        // this.dataSource.sort = this.sort;
      },
        errmess => this.errMess = <any>errmess);
  }

  sortData(event) {
    console.log(event);
  }

}

