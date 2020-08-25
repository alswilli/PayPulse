import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion, MatDialog } from '@angular/material';
import { AddBudgetComponent } from './add-budget/add-budget.component';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss']
})
export class BudgetsComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('addbudgetform') createAccountFormDirective;

  budgets: string[];
  categories: any;
  isLoading = true;

  constructor(public dialog: MatDialog,
    private accountService: AccountService) {
  }

  ngOnInit() {
    this.budgets = [];
    this.accountService.getTransactionCategories()
        .subscribe(categories => {
          console.log(categories);
          this.categories = {};
          for (let row of categories) {
            var i = 0;
            var currStr = "";
            var curr = this.categories;
            while (i < row.hierarchy.length) {
              currStr = row.hierarchy[i];
              // if (currStr !== "") {
              //   currStr = currStr + "." + row.hierarchy[i];
              // }
              // else {
              //   currStr = row.hierarchy[i];
              // }
              if (currStr in curr) {
                curr = curr[currStr];
              }
              else {
                curr[currStr] = {};
                curr = curr[currStr];
              }
              i += 1;
            }
          }
          console.log(this.categories);
          this.isLoading = false;
          // this.categoriesLoading = false;
        });
  }

  onAddBudgetClicked() {
    const addBudgetRef = this.dialog.open(AddBudgetComponent, {data: {categories: this.categories}});
    addBudgetRef.componentInstance.onAdd
      .subscribe(result => {
        console.log(result);
        this.budgets.push(result);
        // Close dialogue ref
        addBudgetRef.close();
      });
    }
  }
