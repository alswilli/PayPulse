import { Component, OnInit } from '@angular/core';
import { MajorComponent } from '../shared/majorComponent';
import { MAJORS } from '../shared/majorComponents';
import {TransactionService} from '../services/transaction.service';
import {Transaction} from '../shared/transaction';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  majorComponents: MajorComponent[] = MAJORS;
  recentTransactions: Transaction[];
  errMess: string;

  constructor(private transactionService: TransactionService) { }

  ngOnInit() {
    this.transactionService.getRecentTransactions()
      .subscribe(transactions => {
        this.recentTransactions = transactions
        this.recentTransactions.forEach(element => {
          console.log(element);
        });
      },
        errmess => this.errMess = <any>errmess);
  }

}
