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
import { basename } from 'path';

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
        // If (new budget is parent OR parent not on graph yet) OR parent is present but lesser value
        var parentPresent = false;
        var parentTotal = 0;
        var parentIndex = null;
        for (let pieBudget of this.pieData) {
          if (pieBudget.mainCategory === budget.category) {
            parentPresent = true;
            parentTotal = pieBudget.total;
            parentIndex = this.pieData.indexOf(pieBudget, 0);
            break;
          }
        }
        // Add to graph
        if (total > 0) {
          if (parentPresent){
            // Update current value
            if (parentTotal < budget.total) {
              this.pieData[parentIndex].total = budget.total;
            }
          }
          else if (budget.category === budget.mainCategory || !parentPresent) {
            this.pieData.push({mainCategory: budget.category, total: budget.total});
          }
          this.pieChartService.sendNewPieDataEvent(this.pieData);
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

        var parents = []
        var bestIndex = 3;
        for (let budget of this.budgets) {
          if (budget.category === result.category) {
            if (budget.category3 !== "") {
              if (bestIndex == 3) {
                parents.push(budget);
              }
            }
            else if (budget.category2 !== "" && budget.category3 === "") {
              if (bestIndex == 3) {
                parents = [];
              }
              if (bestIndex == 2) {
                parents.push(budget);
              }
            }
            else {
              if (bestIndex >= 2) {
                parents = [];
              }
              parents.push(budget);
            }
          }
        }

        var newBudgetIndex = 3
        if (result.mainCategory === result.category2) {
          newBudgetIndex = 2;
        }
        else if (result.mainCategory === result.category) {
          newBudgetIndex = 1;
        }

        var sameLevel = false;
        var sameLevelTotal = 0;
        if (newBudgetIndex === bestIndex) {
          sameLevel = true;
          for (let budget of parents) {
            sameLevelTotal += budget.total;
          }
        }

        // If new budget is parent (and not already present) OR parent not on graph yet
        var parentPresent = false;
        var parentTotal = 0;
        var parentIndex = null;
        console.log(result.category)
        for (let pieBudget of this.pieData) {
          if (pieBudget.mainCategory === result.category) {
            parentPresent = true;
            parentTotal = pieBudget.total;
            parentIndex = this.pieData.indexOf(pieBudget, 0);
            break;
          }
        }
        console.log(parentPresent)
        console.log(parentTotal)
        console.log(parentIndex)
        // Add to graph
        if (total > 0) {
          if (parentPresent){
            // Update current value
            if (sameLevel) {
              this.pieData[parentIndex].total += result.total;
              this.pieChartService.sendNewPieDataEvent(this.pieData);
            }
            else {
              if (parentTotal < result.total) {
                this.pieData[parentIndex].total = result.total;
                this.pieChartService.sendNewPieDataEvent(this.pieData);
              }
            }
          }
          else {
            this.pieData.push({mainCategory: result.category, total: result.total});
            this.pieChartService.sendNewPieDataEvent(this.pieData);
          }
        }
        // Add to list
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
        // Only delete from graph if no other budgets with same parent present
        var parentPresent = false;
        var parentTotal = 0;
        var parentIndex = null;
        console.log(result.category)
        for (let budget of this.budgets) {
          if (budget.category === currBudget.category) {
            parentPresent = true;
            if (parentTotal < budget.total) {
              parentTotal = budget.total;
              parentIndex = this.budgets.indexOf(budget, 0);
            }
          }
        }
        for (let dataVal of this.pieData) {
          if (dataVal.mainCategory === currBudget.category) {
            console.log("Found pie data")
            if (parentPresent) {
              // const indexPie = this.pieData.indexOf(dataVal, 0);
              // this.pieData.splice(indexPie, 1);
              if (dataVal.total !== parentTotal) {
                dataVal.total = parentTotal;
                this.pieChartService.sendNewPieDataEvent(this.pieData);
              }
            }
            else {
              const indexPie = this.pieData.indexOf(dataVal, 0);
              this.pieData.splice(indexPie, 1);
              this.pieChartService.sendNewPieDataEvent(this.pieData);
            }
            break;
          }
        }
        // const indexPie = this.pieData.indexOf(currPieBudget, 0);
        // if (indexPie > -1) {
        //   console.log("Found pie data")
        //   this.pieData.splice(indexPie, 1);
        //   this.pieChartService.sendNewPieDataEvent(this.pieData);
        // }
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

        var newParentPresent = false;
        console.log(result.category)
        for (let budget of this.budgets) {
          if (budget.category === result.category) {
            if (budget.total > 0) {
              newParentPresent = true;
            }
            break;
          }
        }

        var newCategory = true;
        var oldCategory = null;

        for (let budget of this.budgets) {
          if (budget._id === currBudget._id) {
            oldCategory = budget.category;
            if (budget.category === result.category) {
              newCategory = false;
            }
            budget.mainCategory = result.mainCategory;
            budget.category = result.category;
            budget.category2 = result.category2;
            budget.category3 = result.category3;
            budget.amount = result.amount;
            budget.total = result.total
            break;
          }
        }

        // Only delete from graph if no other budgets with same parent present in list
        var parentPresent = false;
        var parentTotal = 0;
        var parentIndex = null;
        console.log(result.category)
        for (let budget of this.budgets) {
          if (budget.category === oldCategory) {
            parentPresent = true;
            if (parentTotal < budget.total) {
              parentTotal = budget.total;
              parentIndex = this.budgets.indexOf(budget, 0);
            }
          }
        }

        // Simply delete and push if it's a brand new category. Otherwise, handle cases of overwriting
        if (newCategory) {
          console.log("New Category")
          console.log(this.pieData)
          console.log(oldCategory)
          var dataChanged = true;
          // Handle deletion first
          for (let dataVal of this.pieData) {
            if (dataVal.mainCategory === oldCategory) {
              console.log("Found pie data")
              // Check if old category is still present in list
              if (parentPresent) {
                if (dataVal.total !== parentTotal) {
                  if (parentTotal > 0) {
                    console.log("A");
                    dataVal.total = parentTotal;
                    // this.pieChartService.sendNewPieDataEvent(this.pieData);
                  }  
                  else {
                    console.log("B");
                    const indexPie = this.pieData.indexOf(dataVal, 0);
                    this.pieData.splice(indexPie, 1);
                    // this.pieChartService.sendNewPieDataEvent(this.pieData);
                  }
                }
                else {
                  console.log("C");
                  dataChanged = false;
                }
              }
              else { 
                console.log("D");
                const indexPie = this.pieData.indexOf(dataVal, 0);
                this.pieData.splice(indexPie, 1);
                // this.pieChartService.sendNewPieDataEvent(this.pieData);
              }
              break;
            }
          }
          console.log(newParentPresent);
          console.log(result)
          console.log(result.total)
          console.log(this.pieData)
          // Now handle push
          if (newParentPresent) { // Parent already was present for new category
            for (let dataVal of this.pieData) {
              if (dataVal.mainCategory === result.category) {
                if (dataVal.total < result.total) { //parentTotal is best for new category, including changed
                  console.log("E");
                  dataVal.total = result.total;
                  console.log(this.pieData)
                  dataChanged = true;
                  // this.pieChartService.sendNewPieDataEvent(this.pieData);
                }
                break;
              } 
            }
          }
          else {
            if (result.total > 0) {
              console.log("F");
              dataChanged = true;
              this.pieData.push({mainCategory: result.category, total: result.total})
              // this.pieChartService.sendNewPieDataEvent(this.pieData);
            }
          }
          if (dataChanged) {
            console.log("G");
            this.pieChartService.sendNewPieDataEvent(this.pieData);
          }
        }
        // If not a new category 
        else {
          console.log("Same Category")
          var notPresent = true;
          for (let dataVal of this.pieData) {
            if (dataVal.mainCategory === oldCategory) {
              notPresent = false;
              console.log("Found pie data")
              if (dataVal.total !== parentTotal) {
                if (parentTotal > 0) {
                  dataVal.total = parentTotal;
                  this.pieChartService.sendNewPieDataEvent(this.pieData);
                }  
                else {
                  const indexPie = this.pieData.indexOf(dataVal, 0);
                  this.pieData.splice(indexPie, 1);
                  this.pieChartService.sendNewPieDataEvent(this.pieData);
                }
              }
              break;
            }
          }
          if (notPresent) {
            if (result.total > 0) {
              this.pieData.push({mainCategory: result.category, total: result.total})
              this.pieChartService.sendNewPieDataEvent(this.pieData);
            }
          }
        } 
      
        // Close dialogue ref
        editBudgetRef.close();
      });
  }
}
