import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion, MatDialog } from '@angular/material';
import { AddBudgetComponent } from './add-budget/add-budget.component';
import { AccountService } from '../services/account.service';
import { mergeMap } from 'rxjs/operators';
import { BudgetService } from '../services/budget.service';
import { Budget } from '../shared/budget';
import { DeleteBudgetComponent } from './delete-budget/delete-budget.component';
import { Transaction } from '../shared/transaction';
import { PieChartService } from '../services/pie-chart.service';
import { CodegenComponentFactoryResolver } from '@angular/core/src/linker/component_factory_resolver';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss']
})
export class BudgetsComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('addbudgetform') createAccountFormDirective;

  budgets: Budget[];
  categories: any;
  isLoading = true;
  userAccountsDetails: any;
  currentAccountId: string;
  days = 30;
  transactions: any[];
  pieData: any[];

  constructor(public dialog: MatDialog,
    private accountService: AccountService,
    private budgetService: BudgetService,
    private pieChartService: PieChartService) {
  }

  ngOnInit() {
    this.budgets = [];
    this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
    this.currentAccountId = this.userAccountsDetails.currentAccount[0]._id;
    this.accountService.getTransactionCategories()
      .pipe(
        mergeMap((categories) => {
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
          return this.budgetService.getBudgets()
      }),
      mergeMap(budgets => {
        console.log("made it");
        this.budgets = budgets;
        return this.accountService.getBudgetTransactions(this.currentAccountId, this.days);
      })
    )
    .subscribe(transactions => {
      this.transactions = transactions;
      console.log(this.transactions);
      this.pieData = [];

      for (let budget of this.budgets) {
        var mainCategory = budget.mainCategory;
        var total = 0;
        for (let transaction of this.transactions) {
          for (let category of transaction.category) {
            if (category === mainCategory) {
              total += transaction.amount;
              break;
            }
          }
        }
        budget.total = total;
        if (total > 0) {
          this.pieData.push({mainCategory: budget.mainCategory, total: budget.total});
        }
      }
      console.log(this.budgets)
      this.isLoading = false;
      // this.categoriesLoading = false;
    });
  }

  onAddBudgetClicked() {
    const addBudgetRef = this.dialog.open(AddBudgetComponent, {data: {categories: this.categories, edit: false}});
    addBudgetRef.componentInstance.onAdd
      .subscribe(result => {
        console.log(result);
        var total = 0;
        for (let transaction of this.transactions) {
          for (let category of transaction.category) {
            if (category === result.mainCategory) {
              total += transaction.amount;
              break;
            }
          }
        }
        result.total = total;
        if (total > 0) {
          this.pieData.push({mainCategory: result.mainCategory, total: result.total});
          console.log("PIE DATA UPDATED");
          console.log(this.pieData);
          this.pieChartService.sendNewPieDataEvent(this.pieData);
        }
        this.budgets.push(result);
        // Close dialogue ref
        addBudgetRef.close();
      });
  }

  onDeleteBudgetClicked(currBudget) {
    console.log(currBudget);
    const deleteBudgetRef = this.dialog.open(DeleteBudgetComponent, {data: {budget: currBudget}});
    deleteBudgetRef.componentInstance.onDelete
      .subscribe(result => {
        console.log(result);
        const index = this.budgets.indexOf(currBudget, 0);
        if (index > -1) {
          this.budgets.splice(index, 1);
        }
        var currPieBudget = {mainCategory: currBudget.mainCategory, total: currBudget.total}
        console.log(currPieBudget)
        console.log(this.pieData)
        const indexPie = this.pieData.indexOf(currPieBudget, 0);
        if (index > -1) {
          console.log("Found pie data")
          this.pieData.splice(indexPie, 1);
        }
        this.pieChartService.sendNewPieDataEvent(this.pieData);
        // Close dialogue ref
        deleteBudgetRef.close();
      });
  }

  onEditBudgetClicked(currBudget) {
    console.log(currBudget);
    const editBudgetRef = this.dialog.open(AddBudgetComponent, {data: {categories: this.categories, edit: true, budget: currBudget}});
    editBudgetRef.componentInstance.onEdit
      .subscribe(result => {
        console.log(result);
        for (let budget of this.budgets) {
          if (budget._id === currBudget._id) {
            budget.mainCategory = result.mainCategory;
            budget.category = result.category;
            budget.category2 = result.category2;
            budget.category3 = result.category3;
            budget.amount = result.amount;
            break;
          }
        }
        // Close dialogue ref
        editBudgetRef.close();
      });
  }
}
