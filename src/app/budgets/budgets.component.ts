import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatAccordion, MatDialog, MatSelect, MatSelectChange } from '@angular/material';
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
  @ViewChild('to') matSelectTo: MatSelect;
  @ViewChild('from') matSelectFrom: MatSelect;

  budgets: Budget[];
  categories: any;
  isLoading: boolean;
  userAccountsDetails: any;
  currentAccountId: string;
  days: number;
  subdays: number;
  transactions: any[];
  pieData: any[];
  totalBudget = 0;
  totalBudgetedExpenses = 0;
  budgetSets = new Object();
  fromMonths = [];
  toMonths = [];
  totalMonthsActive: number;
  currentFromMonth: string;
  currentToMonth: string;
  // dataEmpty = true;
  dates = {
    "01":["January", 31],
    "02":["February", 28],
    "03":["March", 31],
    "04":["April", 30],
    "05":["May", 31],
    "06":["June", 30],
    "07":["July", 31],
    "08":["August", 31],
    "09":["September", 30],
    "10":["October", 31],
    "11":["November", 30],
    "12":["December", 31]
  }
  datesAlt = {
    "January":["01", 31],
    "February":["02", 28],
    "March":["03", 31],
    "April":["04", 30],
    "May":["05", 31],
    "June":["06", 30],
    "July":["07", 31],
    "August":["08", 31],
    "September":["09", 30],
    "October":["10", 31],
    "November":["11", 30],
    "December":["12", 31]
  }

  constructor(public dialog: MatDialog,
    private accountService: AccountService,
    private budgetService: BudgetService,
    private pieChartService: PieChartService) {
  }

  ngOnInit() {
    this.budgets = [];
    this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
    this.currentAccountId = this.userAccountsDetails.currentAccount[0]._id;

    var today = new Date();
    var currMonth = today.getMonth() + 1;
    var currYear = today.getFullYear();
    this.currentFromMonth = this.dates[String(currMonth).padStart(2, '0')][0] + " " + String(currYear);
    this.currentToMonth = "Present"

    this.toMonths = [this.currentToMonth];
    this.fromMonths.push(this.currentFromMonth);

    var i = 0;
    while (i < 23) {
      currMonth -= 1;
      if (currMonth === 0) {
        currMonth = 12;
      }
      if (currMonth === 12) {
        currYear -= 1;
      }
      this.fromMonths.push(this.dates[String(currMonth).padStart(2, '0')][0] + " " + String(currYear));
      i += 1
    }

    this.matSelectFrom.value = this.currentFromMonth;
    this.matSelectTo.value = this.currentToMonth;
    this.totalMonthsActive = 1;

    this.isLoading = true;

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
        console.log(this.budgets)
        var today = new Date();

        this.days = today.getDate()-1;
        this.subdays = 0;
        // var currDay = today.getDate();
        // var currMonth = today.getMonth() + 1;
        // var currYear = today.getFullYear();
        // currDay = 1;

        // var dd = String(currDay).padStart(2, '0');
        // var mm = String(currMonth).padStart(2, '0'); 
        // var yyyy = String(currYear);
        // this.days = yyyy + '-' + mm + '-' + dd;
        console.log("Days: ", this.days);
        return this.accountService.getBudgetTransactions(this.currentAccountId, this.days, this.subdays);
      })
    )
    .subscribe(transactions => {
      this.transactions = transactions;
      this.onGetTransactions();

      // FROM SIDE
      this.matSelectFrom.selectionChange.subscribe((s: MatSelectChange) => {   
        console.log(s); 
        this.isLoading = true;

        var i = 0;
        while (this.fromMonths[i] !== s.value) {
          i += 1
        } 
        console.log(this.fromMonths.slice(0, i))
        var j = 0;
        this.toMonths = ["Present"];
        while (j < i) {
          this.toMonths.push(this.fromMonths[j]);
          j += 1;
        }
        var monthPresent = false;
        for (let month of this.toMonths) {
          if (month === this.currentToMonth) {
            monthPresent = true;
            break;
          }
        }
        if (!monthPresent) {
          this.currentToMonth = "Present";
          this.matSelectTo.value = this.currentToMonth;
          this.subdays = 0;
        }
        this.currentFromMonth = s.value;

        this.totalMonthsActive = 0;
        while (j >= 0 && this.fromMonths[j] !== this.currentToMonth) {
          this.totalMonthsActive += 1;
          j -= 1;
        }
        
        // this.fromMonths = this.fromMonths.slice(i, this.fromMonths.length);

        this.days = 0;
        var i = 0;
        while (this.toMonths[i] !== this.currentToMonth) {
          i += 1
        }
        if (this.currentToMonth === "Present") {
          var today = new Date();
          this.days += today.getDate()-1;
        }
        i += 1
        console.log(this.days)

        var today = new Date();
        var currMonth = today.getMonth() + 1;
        while (i < this.toMonths.length) {
          if (this.dates[String(currMonth).padStart(2, '0')][0] !== this.toMonths[i].split(" ")[0]) {
            this.days += this.datesAlt[this.toMonths[i].split(" ")[0]][1];
          }
          // this.days += this.datesAlt[this.toMonths[i].split(" ")[0]][1];
          console.log(this.days)
          i += 1
        }
        if (this.dates[String(currMonth).padStart(2, '0')][0] !== this.currentFromMonth.split(" ")[0]) {
          console.log("Added current fromMonth (not real)")
          this.days += this.datesAlt[this.currentFromMonth.split(" ")[0]][1];
        }

        console.log("NUM DAYS: ", this.days)

        this.accountService.getBudgetTransactions(this.currentAccountId, this.days, this.subdays)
          .subscribe(transactions => {
            this.transactions = transactions;
            this.onGetTransactions();
        });
      });
      // TO SIDE
      this.matSelectTo.selectionChange.subscribe((s: MatSelectChange) => {   
        console.log(s); 
        this.currentToMonth = s.value; 
        this.isLoading = true;

        this.days = 0;
        this.subdays = 0;
        var today = new Date();
        var currMonth = today.getMonth() + 1;
        var i = 0;
        while (this.toMonths[i] !== this.currentToMonth) {
          if (this.toMonths[i] === "Present") {
            var today = new Date();
            this.subdays += today.getDate()-1;
          }
          else {
            if (this.dates[String(currMonth).padStart(2, '0')][0] !== this.toMonths[i].split(" ")[0]) {
              this.subdays += this.datesAlt[this.toMonths[i].split(" ")[0]][1];
            }
          }
          i += 1
        }
        if (this.currentToMonth === "Present") {
          var today = new Date();
          this.days += today.getDate()-1;
        }
        else if (this.dates[String(currMonth).padStart(2, '0')][0] !== this.currentToMonth.split(" ")[0]) {
          this.subdays += this.datesAlt[this.currentToMonth.split(" ")[0]][1];
        }
        i += 1
        console.log(this.days)

        while (i < this.toMonths.length) {
          if (this.dates[String(currMonth).padStart(2, '0')][0] !== this.toMonths[i].split(" ")[0]) {
            this.days += this.datesAlt[this.toMonths[i].split(" ")[0]][1];
          }
          // this.days += this.datesAlt[this.toMonths[i].split(" ")[0]][1];
          console.log(this.days)
          i += 1
        }
        if (this.dates[String(currMonth).padStart(2, '0')][0] !== this.currentFromMonth.split(" ")[0]) {
          console.log("Added current fromMonth (not real)")
          this.days += this.datesAlt[this.currentFromMonth.split(" ")[0]][1];
        }

        console.log("NUM DAYS: ", this.days)

        this.totalMonthsActive = 0;
        var j = this.fromMonths.indexOf(this.currentFromMonth, 0);
        while (j >= 0 && this.fromMonths[j] !== this.currentToMonth) {
          this.totalMonthsActive += 1;
          j -= 1;
        }

        this.accountService.getBudgetTransactions(this.currentAccountId, this.days, this.subdays)
          .subscribe(transactions => {
            this.transactions = transactions;
            this.onGetTransactions();
        });
      });
    });
  }

  // ngAfterViewInit() {
  //   this.matSelectTo.selectionChange.subscribe((s: MatSelectChange) => {   
  //     console.log(s);  
  //     // console.log("yup")
  //     // this.selectionList.deselectAll();
  //     // console.log(s);
  //     // s.option.selected = true;
  //   });
  //   this.matSelectFrom.selectionChange.subscribe((s: MatSelectChange) => {   
  //     console.log(s);  
  //     // console.log("yup")
  //     // this.selectionList.deselectAll();
  //     // console.log(s);
  //     // s.option.selected = true;
  //   });
  // }

  truncateVal(val) {
    console.log(val)
    var strVal = String(val);
    var i = 0;
    while (i < strVal.length) {
      if (strVal[i] == ".") {
        if (i+3 <= strVal.length) {
          i = i + 3;
        }
        else if (i+2 <= strVal.length) {
          i = i + 2;
        }
        break;  
      }
      i = i + 1
    }
    console.log(i)
    return Number(strVal.substring(0, i));
  }

  onGetTransactions() {
    console.log(this.transactions);
      this.pieData = [];
      // var entered = false;

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
        total = this.truncateVal(total);
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
          // entered = true;
          // this.dataEmpty = false;
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
      }

      // if (!entered) {
      //   this.dataEmpty = true;
      //   this.pieChartService.sendNewPieDataEvent(this.pieData);
      // }
      console.log(this.budgets)
      this.isLoading = false;
      // this.categoriesLoading = false;
      this.totalBudgetedExpenses = 0
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
      this.totalBudget = 0;
      for (let key in this.budgetSets) {
        this.totalBudget += this.budgetSets[key][0];
      }
      // this.totalBudget = this.totalBudget * this.totalMonthsActive;
      console.log(this.budgetSets)
  }

  onAddBudgetClicked() {
    const addBudgetRef = this.dialog.open(AddBudgetComponent, {data: {categories: this.categories, budgets: this.budgets, edit: false}});
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

        var currIndex = 4;
        if (result.category3 !== "") {
          if (currIndex == 4) {
            currIndex = 3;
          }
        }
        else if (result.category2 !== "" && result.category3 === "") {
          if (currIndex >= 3) {
            currIndex = 2;
          }
        }
        else if (result.category !== "" && result.category2 === "") {
          if (currIndex >= 2) {
            currIndex = 1;
          }
        }
        // Now figure out what to do with it
        if (result.category in this.budgetSets) {
          if (currIndex === this.budgetSets[result.category][1]) {
            this.budgetSets[result.category][0] += Number(result.amount);
          }
          else if (currIndex < this.budgetSets[result.category][1]) {
            this.budgetSets[result.category] = [Number(result.amount), currIndex];
          }
        }
        else {
          this.budgetSets[result.category] = [Number(result.amount), currIndex];
        }

        this.totalBudget = 0;
        for (let key in this.budgetSets) {
          this.totalBudget += this.budgetSets[key][0];
        }
        console.log(this.budgetSets)

        this.totalBudgetedExpenses = 0;
        for (let dataVal of this.pieData) {
          this.totalBudgetedExpenses += dataVal.total;
          // this.totalBudget += Number(dataVal.amount); DOESN'T WORK FOR ZERO Totals
        }

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
        var sameLevelAmount = 0;
        if (newBudgetIndex === bestIndex) {
          sameLevel = true;
        }
        for (let pbudget of parents) {
          sameLevelTotal += pbudget.total;
          sameLevelAmount += Number(pbudget.amount);
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

        var currIndex = 4;
        if (result.category3 !== "") {
          if (currIndex == 4) {
            currIndex = 3;
          }
        }
        else if (result.category2 !== "" && result.category3 === "") {
          if (currIndex >= 3) {
            currIndex = 2;
          }
        }
        else if (result.category !== "" && result.category2 === "") {
          if (currIndex >= 2) {
            currIndex = 1;
          }
        }
        // Now figure out what to do with it
        if (currIndex === this.budgetSets[result.category][1]) {
          if (this.budgetSets[result.category][0] === Number(result.amount)) {
            if (parents.length > 0) {
              this.budgetSets[result.category] = [sameLevelAmount, bestIndex];
            } 
            else {
              delete this.budgetSets[result.category];
            }
          }
          else {
            this.budgetSets[result.category][0] -= Number(result.amount)
          }
        }

        this.totalBudget = 0;
        for (let key in this.budgetSets) {
          this.totalBudget += this.budgetSets[key][0];
        }
        console.log(this.budgetSets)

        this.totalBudgetedExpenses = 0;
        for (let dataVal of this.pieData) {
          this.totalBudgetedExpenses += dataVal.total;
          // this.totalBudget += Number(dataVal.amount); DOESN'T WORK FOR ZERO Totals
        }

        // Close dialogue ref
        deleteBudgetRef.close();
      });
  }

  onEditBudgetClicked(currBudget) {
    console.log(currBudget);
    const editBudgetRef = this.dialog.open(AddBudgetComponent, {data: {categories: this.categories, budgets: this.budgets, edit: true, budget: currBudget}});
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
        var oldCategory2 = null;
        var oldCategory3 = null;
        var oldTotal = 0;
        var oldAmount = 0;
        // var oldBudget = null;

        for (let budget of this.budgets) {
          if (budget._id === currBudget._id) {
            oldCategory = budget.category;
            oldCategory2 = budget.category2;
            oldCategory3 = budget.category3;
            oldTotal = budget.total;
            oldAmount = Number(budget.amount);
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
        var sameLevelAmount = 0;
        if (newBudgetIndex === bestIndex) {
          sameLevel = true;
        }
        for (let pbudget of parents) {
          sameLevelTotal += pbudget.total;
          sameLevelAmount += Number(pbudget.amount);
        }

        // Old Category
        var oldparents = []
        var oldbestIndex = 4;
        for (let budget of this.budgets) {
          if (budget.category === oldCategory) {
            console.log("AHHHHHHHHHHHHHHHHHHHHHHHHHHHH: ", budget);
            if (budget.category3 !== "") {
              if (oldbestIndex == 4) {
                oldbestIndex = 3;
              }
              if (oldbestIndex == 3) {
                oldparents.push(budget);
              }
            }
            else if (budget.category2 !== "" && budget.category3 === "") {
              if (oldbestIndex >= 3) {
                oldparents = [];
                oldbestIndex = 2;
              }
              if (oldbestIndex == 2) {
                oldparents.push(budget);
              }
            }
            else if (budget.category !== "" && budget.category2 === "") {
              console.log("made it into there")
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
        var oldsameLevelAmount = 0;
        for (let pbudget of oldparents) {
          oldsameLevelTotal += pbudget.total;
          oldsameLevelAmount += Number(pbudget.amount);
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
        
        var currIndex = 4;
        if (result.category3 !== "") {
          if (currIndex == 4) {
            currIndex = 3;
          }
        }
        else if (result.category2 !== "" && result.category3 === "") {
          if (currIndex >= 3) {
            currIndex = 2;
          }
        }
        else if (result.category !== "" && result.category2 === "") {
          if (currIndex >= 2) {
            currIndex = 1;
          }
        }

        var oldcurrIndex = 4;
        if (oldCategory3 !== "") {
          if (oldcurrIndex == 4) {
            oldcurrIndex = 3;
          }
        }
        else if (oldCategory2 !== "" && oldCategory3 === "") {
          if (oldcurrIndex >= 3) {
            oldcurrIndex = 2;
          }
        }
        else if (oldCategory !== "" && oldCategory2 === "") {
          if (oldcurrIndex >= 2) {
            oldcurrIndex = 1;
          }
        }

        if (result.category !== oldCategory) { 
          // Figure out delete
          if (oldcurrIndex === this.budgetSets[oldCategory][1]) {
            if (this.budgetSets[oldCategory][0] === Number(oldAmount)) {
              if (oldparents.length > 0) {
                this.budgetSets[oldCategory] = [oldsameLevelAmount, oldbestIndex];
              } 
              else {
                delete this.budgetSets[oldCategory];
              } 
            }
            else {
              this.budgetSets[oldCategory][0] -= Number(oldAmount)
            }
          }
          // Figure out push
          if (result.category in this.budgetSets) {
            if (currIndex === this.budgetSets[result.category][1]) {
              this.budgetSets[result.category][0] += Number(result.amount);
            }
            else if (currIndex < this.budgetSets[result.category][1]) {
              this.budgetSets[result.category] = [Number(result.amount), currIndex];
            }
          }
          else {
            this.budgetSets[result.category] = [Number(result.amount), currIndex];
          }
        }
        else {
          // if (oldParents) {
          
          // }
          // else {

          // }
          console.log("using old amount")
          console.log(oldparents)
          this.budgetSets[oldCategory] = [Number(oldsameLevelAmount), oldbestIndex];
          // // Only changed amount
          // if (oldcurrIndex === currIndex) {
          //   if (oldcurrIndex === this.budgetSets[result.category][1]) {
          //     this.budgetSets[result.category][0] += Number(result.amount) - Number(oldAmount);
          //   }
          // }
          // else {
          //   // Delete
          //   if (oldcurrIndex === this.budgetSets[result.category][1]) {
          //     // this.budgetSets[oldCategory][0] -= Number(oldAmount);
          //     if (this.budgetSets[oldCategory][0] === Number(oldAmount)) {
          //       if (oldparents.length > 0) {
          //         this.budgetSets[oldCategory] = [Number(oldsameLevelAmount), oldbestIndex];
          //       }
          //     }
          //     else {
          //         delete this.budgetSets[oldCategory];
          //     }
          //   }
          //   // Push
          //   if (result in this.budgetSets) {
          //     if (currIndex === this.budgetSets[result.category][1]) {
          //       this.budgetSets[result.category][0] += Number(result.amount)
          //     }
          //   }
          //   else {
          //     this.budgetSets[result.category] = [Number(result.amount), currIndex];
          //   }
          // }
        }

        this.totalBudget = 0;
        for (let key in this.budgetSets) {
          this.totalBudget += this.budgetSets[key][0];
        }
        console.log(this.budgetSets)

        this.totalBudgetedExpenses = 0;
        for (let dataVal of this.pieData) {
          this.totalBudgetedExpenses += dataVal.total;
          // this.totalBudget += Number(dataVal.amount); DOESN'T WORK FOR ZERO Totals
        }
      
        console.log(oldparents)
        // Close dialogue ref
        editBudgetRef.close();
      });
  }
}
