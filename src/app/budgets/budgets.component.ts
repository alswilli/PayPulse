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
  totalBudget = 0;
  totalBudgetedExpenses = 0;
  budgetSets = new Object();

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

        var parents = []
        var bestIndex = 3;
        for (let pieBudget of this.pieData) {
          console.log(pieBudget)
          if (pieBudget.category === budget.category) {
            if (pieBudget.category3 !== "") {
              if (bestIndex == 3) {
                parents.push(pieBudget);
              }
            }
            else if (pieBudget.category2 !== "" && pieBudget.category3 === "" && pieBudget.total > 0) {
              if (bestIndex == 3) {
                parents = [];
                bestIndex = 2;
              }
              if (bestIndex == 2) {
                parents.push(pieBudget);
              }
            }
            else if (budget.category !== "" && budget.category2 === "" && budget.total > 0) {
              if (bestIndex >= 2) {
                parents = [];
                bestIndex = 1;
              }
              parents.push(pieBudget);
            }
          }
        }

        var newBudgetIndex = 3
        if (budget.mainCategory === budget.category2) {
          newBudgetIndex = 2;
        }
        else if (budget.mainCategory === budget.category) {
          newBudgetIndex = 1;
        }

        var sameLevel = false;
        var sameLevelTotal = 0;
        console.log(bestIndex, newBudgetIndex)
        if (newBudgetIndex === bestIndex) {
          sameLevel = true;
          for (let pbudget of parents) {
            sameLevelTotal += pbudget.total;
          }
        }


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

        if (total > 0) {
          if (parentPresent){
            // Update current value
            if (sameLevel) {
              console.log("SAME LEVEL");
              this.pieData[parentIndex].total += budget.total;
              // this.pieData[parentIndex].amount += Number(budget.amount);
              this.pieChartService.sendNewPieDataEvent(this.pieData);
            }
            else {
              if (parentTotal < budget.total) {
                this.pieData[parentIndex].total = budget.total;
                // this.pieData[parentIndex].total = Number(budget.amount);
                this.pieChartService.sendNewPieDataEvent(this.pieData);
              }
            }
          }
          else {
            this.pieData.push({mainCategory: budget.category, category: budget.category, 
              category2: budget.category2, category3: budget.category3, total: budget.total});
              // amount: Number(budget.amount)});
            this.pieChartService.sendNewPieDataEvent(this.pieData);
          }
        }

  


        // // Add to graph
        // if (total > 0) {
        //   if (parentPresent){
        //     // Update current value
        //     if (parentTotal < budget.total) {
        //       this.pieData[parentIndex].total = budget.total;
        //     }
        //   }
        //   else if (budget.category === budget.mainCategory || !parentPresent) {
        //     this.pieData.push({mainCategory: budget.category, total: budget.total});
        //   }
        //   this.pieChartService.sendNewPieDataEvent(this.pieData);
        // }
      }
      console.log(this.budgets)
      this.isLoading = false;
      // this.categoriesLoading = false;
      for (let dataVal of this.pieData) {
        this.totalBudgetedExpenses += dataVal.total;
        // this.totalBudget += Number(dataVal.amount); DOESN'T WORK FOR ZERO Totals
      }

      this.budgetSets = new Object();
      for (let budget of this.budgets) {
        var currIndex = 4;
        if (budget.category3 !== "") {
          if (currIndex == 4) {
            currIndex = 3;
          }
        }
        else if (budget.category2 !== "" && budget.category3 === "") {
          if (currIndex >= 3) {
            currIndex = 2;
          }
        }
        else if (budget.category !== "" && budget.category2 === "") {
          if (currIndex >= 2) {
            currIndex = 1;
          }
        }
        // Now figure out what to do with it
        if (budget.category in this.budgetSets) {
          if (currIndex === this.budgetSets[budget.category][1]) {
            this.budgetSets[budget.category][0] += Number(budget.amount);
          }
          else if (currIndex < this.budgetSets[budget.category][1]) {
            this.budgetSets[budget.category] = [Number(budget.amount), currIndex];
          }
        }
        else {
          this.budgetSets[budget.category] = [Number(budget.amount), currIndex];
        }
      }

      // var i = 0;
      // while (i < budgetSets.keys().length) {

      // }
      for (let key in this.budgetSets) {
        this.totalBudget += this.budgetSets[key][0];
      }
      console.log(this.budgetSets)
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
        var bestIndex = 4;
        for (let budget of this.budgets) {
          if (budget.category === result.category) {
            if (budget.category3 !== "") {
              if (bestIndex == 4) {
                bestIndex = 3;
              }
              if (bestIndex == 3) {
                parents.push(budget);
              }
            }
            else if (budget.category2 !== "" && budget.category3 === "" && budget.total > 0) {
              if (bestIndex >= 3) {
                parents = [];
                bestIndex = 2;
              }
              if (bestIndex == 2) {
                parents.push(budget);
              }
            }
            else if (budget.category !== "" && budget.category2 === "" && budget.total > 0) {
              if (bestIndex >= 2) {
                parents = [];
                bestIndex = 1;
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
        }
        for (let pbudget of parents) {
          sameLevelTotal += pbudget.total;
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
              console.log("SAME LEVEL");
              console.log(bestIndex)
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
            this.pieData.push({mainCategory: result.category, category: result.category, 
              category2: result.category2, category3: result.category3, total: result.total});
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
        var bestIndex = 4;
        for (let budget of this.budgets) {
          if (budget.category === result.category) {
            if (budget.category3 !== "") {
              if (bestIndex == 4) {
                bestIndex = 3;
              }
              if (bestIndex == 3) {
                parents.push(budget);
              }
            }
            else if (budget.category2 !== "" && budget.category3 === "" && budget.total > 0) {
              if (bestIndex >= 3) {
                parents = [];
                bestIndex = 2;
              }
              if (bestIndex == 2) {
                parents.push(budget);
              }
            }
            else if (budget.category !== "" && budget.category2 === "" && budget.total > 0) {
              if (bestIndex >= 2) {
                parents = [];
                bestIndex = 1;
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
        }
        for (let pbudget of parents) {
          sameLevelTotal += pbudget.total;
        }

        console.log(this.pieData)
        // Only delete from graph if no other budgets with same parent present
        var parentPresent = false;
        var parentTotal = 0;
        var parentIndex = null;
        console.log(result.category)
        console.log("Budgets: ", this.budgets)
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
              console.log("PARENT PRESENT")
              if (sameLevel) {
                console.log("SAME LEVEL");
                console.log(bestIndex)
                console.log(dataVal, result.total)
                // dataVal.total -= result.total;
                dataVal.total -= result.total //Math.ceil(num * 100) / 100; 
                var strTotal = dataVal.total.toString();
                var containsDecimal = false;
                for (let num of strTotal) {
                  if (num === ".") {
                    containsDecimal = true;
                    break;
                  }
                }
                var count = 0; 
                if (containsDecimal) {
                  while (strTotal[count] !== ".") {
                    count += 1;
                  }
                  count += 3;
                  dataVal.total = Number(strTotal.substring(0, count));
                }
                if (dataVal.total === 0) {
                  const indexPie = this.pieData.indexOf(dataVal, 0);
                  this.pieData.splice(indexPie, 1);
                  this.pieChartService.sendNewPieDataEvent(this.pieData);
                }
                else {
                  this.pieChartService.sendNewPieDataEvent(this.pieData);
                }
              }
              else {
                // if (dataVal.total !== parentTotal) {
                //   dataVal.total = parentTotal;
                //   this.pieChartService.sendNewPieDataEvent(this.pieData);
                // }
                if (dataVal.total !== sameLevelTotal) {
                  console.log(parents)
                  console.log(bestIndex, newBudgetIndex);
                  if (sameLevelTotal > 0) {
                    console.log("A")
                    dataVal.total = sameLevelTotal;
                    this.pieChartService.sendNewPieDataEvent(this.pieData);
                  }
                  else {
                    console.log("B")
                    const indexPie = this.pieData.indexOf(dataVal, 0);
                    this.pieData.splice(indexPie, 1);
                    this.pieChartService.sendNewPieDataEvent(this.pieData);
                  }
                }
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
        var oldTotal = 0;
        // var oldBudget = null;

        for (let budget of this.budgets) {
          if (budget._id === currBudget._id) {
            oldCategory = budget.category;
            oldTotal = budget.total;
            // oldBudget = budget;
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

        // New category
        var parents = []
        var bestIndex = 4;
        for (let budget of this.budgets) {
          if (budget.category === result.category) {
            if (budget.category3 !== "") {
              if (bestIndex == 4) {
                bestIndex = 3;
              }
              if (bestIndex == 3) {
                parents.push(budget);
              }
            }
            else if (budget.category2 !== "" && budget.category3 === "" && budget.total > 0) {
              if (bestIndex >= 3) {
                parents = [];
                bestIndex = 2;
              }
              if (bestIndex == 2) {
                parents.push(budget);
              }
            }
            else if (budget.category !== "" && budget.category2 === "" && budget.total > 0) {
              if (bestIndex >= 2) {
                parents = [];
                bestIndex = 1;
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
        }
        for (let pbudget of parents) {
          sameLevelTotal += pbudget.total;
        }

        // Old Category
        var oldparents = []
        var oldbestIndex = 4;
        for (let budget of this.budgets) {
          if (budget.category === oldCategory) {
            if (budget.category3 !== "") {
              if (oldbestIndex == 4) {
                oldbestIndex = 3;
              }
              if (oldbestIndex == 3) {
                oldparents.push(budget);
              }
            }
            else if (budget.category2 !== "" && budget.category3 === "" && budget.total > 0) {
              if (oldbestIndex >= 3) {
                oldparents = [];
                oldbestIndex = 2;
              }
              if (oldbestIndex == 2) {
                oldparents.push(budget);
              }
            }
            else if (budget.category !== "" && budget.category2 === "" && budget.total > 0) {
              if (oldbestIndex >= 2) {
                oldparents = [];
                oldbestIndex = 1;
              }
              oldparents.push(budget);
            }
          }
        }

        // var oldnewBudgetIndex = 3
        // if (result.mainCategory === result.category2) {
        //   oldnewBudgetIndex = 2;
        // }
        // else if (result.mainCategory === result.category) {
        //   oldnewBudgetIndex = 1;
        // }

        // var oldsameLevel = false;
        // var oldsameLevelTotal = 0;
        // if (oldnewBudgetIndex === oldbestIndex) {
        //   oldsameLevel = true;
        // }
        var oldsameLevelTotal = 0;
        for (let pbudget of oldparents) {
          oldsameLevelTotal += pbudget.total;
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
        var dataChanged = false;
        if (newCategory) {
          console.log("New Category")
          console.log(this.pieData)
          console.log(oldCategory)
          if (oldTotal > 0) {
            dataChanged = true;
          }
          
          // Handle deletion first
          for (let dataVal of this.pieData) {
            if (dataVal.mainCategory === oldCategory) {
              console.log("Found pie data")
              // Check if old category is still present in list
              if (parentPresent) {
                // if (dataVal.total !== parentTotal) {
                //   if (parentTotal > 0) {
                //     console.log("A");
                //     dataVal.total = parentTotal;
                console.log(parents)
                if (dataVal.total !== oldsameLevelTotal) {
                  if (oldsameLevelTotal > 0) {
                    console.log("A");
                    dataVal.total = oldsameLevelTotal;
                    // this.pieChartService.sendNewPieDataEvent(this.pieData);
                  }  
                  else {
                    console.log("Old Same Level total: ", oldsameLevelTotal)
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
                // if (sameLevel) {
                //   console.log("SAME LEVEL");
                //   console.log(newBudgetIndex, bestIndex)
                //   console.log(parents)
                //   dataVal.total += result.total;
                //   // dataVal.total = sameLevelTotal;
                // }
                // else {
                //   if (dataVal.total < result.total) { //parentTotal is best for new category, including changed
                //     console.log("E");
                //     dataVal.total = result.total;
                //     console.log(this.pieData)
                //     dataChanged = true;
                //     // this.pieChartService.sendNewPieDataEvent(this.pieData);
                //   }
                // }
                if (dataVal.total < sameLevelTotal) { //parentTotal is best for new category, including changed
                  console.log("E");
                  dataVal.total = sameLevelTotal;
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
              this.pieData.push({mainCategory: result.category, category: result.category, 
                category2: result.category2, category3: result.category3, total: result.total})
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
              // if (dataVal.total !== parentTotal) {
              //   if (parentTotal > 0) {
              //     dataVal.total = parentTotal;
              //     this.pieChartService.sendNewPieDataEvent(this.pieData);
              //   }  
              if (dataVal.total !== sameLevelTotal) {
                if (sameLevelTotal > 0) {
                  dataVal.total = sameLevelTotal;
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
              this.pieData.push({mainCategory: result.category, category: result.category, 
                category2: result.category2, category3: result.category3, total: result.total})
              this.pieChartService.sendNewPieDataEvent(this.pieData);
            }
          }
        } 
      
        // Close dialogue ref
        editBudgetRef.close();
      });
  }
}
