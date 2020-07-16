import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {TransactionService} from '../services/transaction.service';
import {Transaction} from '../shared/transaction';
import { LoginComponent } from '../login/login.component';

export interface TransactionData {
  amount: string;
  transactionName: string;
  category: string;
  date: string;
}

/** Constants used to fill up our data base. */
const COLORS: string[] = [
  'maroon', 'red', 'orange', 'yellow', 'olive', 'green', 'purple', 'fuchsia', 'lime', 'teal',
  'aqua', 'blue', 'navy', 'black', 'gray'
];
const NAMES: string[] = [
  'Maia', 'Asher', 'Olivia', 'Atticus', 'Amelia', 'Jack', 'Charlotte', 'Theodore', 'Isla', 'Oliver',
  'Isabella', 'Jasper', 'Cora', 'Levi', 'Violet', 'Arthur', 'Mia', 'Thomas', 'Elizabeth'
];

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

  displayedColumns: string[] = ['amount', 'transactionName', 'category', 'date'];
  dataSource: MatTableDataSource<TransactionData>;
  transactions: Transaction[];
  errMess: string
  totalPosts: number;
  postsPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 25, 100];
  isLoading = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private transactionService: TransactionService) {
    // Create 100 users
    // const users = Array.from({length: 100}, (_, k) => createNewUser(k + 1));
    // const parsedTransactions = [];
    // for (let entry of this.transactions) {
    //   const newTransaction = {
    //     amount: entry.amount,
    //     transactionName: entry.transactionName,
    //     category: entry.category,
    //     date: entry.date
    //   };
    //   parsedTransactions.push(newTransaction);
    // }

    // // Assign the data to the data source for the table to render
    // // this.dataSource = new MatTableDataSource(users);
    // this.dataSource = new MatTableDataSource(parsedTransactions);
  }

  ngOnInit() {
    this.isLoading = true;
    console.log("ngInit");
    this.transactionService.getTransactions(this.postsPerPage, this.currentPage)
      .subscribe(res => {
        this.isLoading = false;
        this.transactions = res.transactions;
        this.totalPosts = res.maxTransactions;
        for (let entry of this.transactions) {
          console.log(entry);
        }
        const parsedTransactions = [];
        for (let entry of this.transactions) {
          const newTransaction = {
            amount: entry.amount,
            transactionName: entry.transactionName,
            category: entry.category,
            date: entry.date
          };
          parsedTransactions.push(newTransaction);
        }
        console.log("Parsed transactions: "+ parsedTransactions);

        // Assign the data to the data source for the table to render
        // this.dataSource = new MatTableDataSource(users);
        this.dataSource = new MatTableDataSource(parsedTransactions);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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
    this.transactionService.getTransactions(this.postsPerPage, this.currentPage)
      .subscribe(res => {
        this.isLoading = false;
        this.transactions = res.transactions;
        this.totalPosts = res.maxTransactions;
        for (let entry of this.transactions) {
          console.log(entry);
        }
        const parsedTransactions = [];
        for (let entry of this.transactions) {
          const newTransaction = {
            amount: entry.amount,
            transactionName: entry.transactionName,
            category: entry.category,
            date: entry.date
          };
          parsedTransactions.push(newTransaction);
        }
        console.log("Parsed transactions: "+ parsedTransactions);

        // Assign the data to the data source for the table to render
        // this.dataSource = new MatTableDataSource(users);
        this.dataSource = new MatTableDataSource(parsedTransactions);
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
      },
        errmess => this.errMess = <any>errmess);
  }

}

function createNewUser(amount: number): TransactionData {
  const name = NAMES[Math.round(Math.random() * (NAMES.length - 1))] + ' ' +
      NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) + '.';

  return {
    amount: amount.toString(),
    transactionName: name,
    category: Math.round(Math.random() * 100).toString(),
    date: COLORS[Math.round(Math.random() * (COLORS.length - 1))]
  };
}
