import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { Goal } from '../shared/goal';
import { UserGoal } from '../shared/usergoal';
import { Observable, forkJoin, of } from 'rxjs';
import { AuthService } from './auth.service';
import { AccountService } from './account.service';
import { BudgetService } from './budget.service';
import { BindingType, IfStmt } from '@angular/compiler';
import { map, mergeMap } from 'rxjs/operators';
import { Router } from "@angular/router";
import { TransactionService } from './transaction.service';
import { Budget } from '../shared/budget';
import { GoalData } from '../shared/goaldata';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/forkJoin';

interface GoalResponse {
  message: string;
  goals: Goal[];
}

interface UserGoalResponse {
  message: string;
  usergoals: UserGoal[];
}

interface GoalDataResponse {
  message: string;
  goaldata: GoalData;
}

@Injectable({
  providedIn: 'root'
})
export class GoalService {

  dates = {
    1:["January", 31],
    2:["February", 28],
    3:["March", 31],
    4:["April", 30],
    5:["May", 31],
    6:["June", 30],
    7:["July", 31],
    8:["August", 31],
    9:["September", 30],
    10:["October", 31],
    11:["November", 30],
    12:["December", 31]
  }
  reverseDates = {
    "January":1,
    "February":2,
    "March":3,
    "April":4,
    "May":5,
    "June":6,
    "July":7,
    "August":8,
    "September":9,
    "October":10,
    "November":11,
    "December":12
  }
  budgets: Budget[];
  totalBudgetAmount: number = 0;
  pairs: any;
  numMonthsAhead: number;
  untrackedTransactions: any[];
  transactionIds = {};
  mainBudgets = {}

  constructor(private http: HttpClient,
    private authService: AuthService,
    private accountService: AccountService,
    private budgetService: BudgetService,
    private router: Router,
    private _ngZone: NgZone) { }

  getGoals() {
    return this.http.get<GoalResponse>(baseURL + 'goals');
  }

  addGoal(name: string, description: string, image: File) {
    const goalData = new FormData();
    goalData.append("name", name);
    goalData.append("description", description);
    goalData.append("image", image, name);
    return this.http.post<GoalResponse>(baseURL + 'goals', goalData);
  }

  getUserGoals(userId: string) {
    console.log('get')
    return this.http.get<UserGoalResponse>(baseURL + 'usergoals/' + userId);
  }

  addUserGoal(userGoalData: Object, userId: string) {
    console.log("adding user goals")
    return this.http.post<UserGoalResponse>(baseURL + 'usergoals/' + userId, userGoalData);
  }

  addUserGoals(userGoalDatas, userId) {
    console.log("adding multiple user goals")
    console.log(userGoalDatas)
    let addObservables: Observable<any>[] = [];
    for (let userGoalData of userGoalDatas) {
      addObservables.push(this.addUserGoal(userGoalData, userId))
    }
    if (addObservables.length == 0) {
      return of(null)
    }
    return forkJoin(addObservables)
  }

  updateMainBudgets(budgets) {
    this.mainBudgets = {}
    for (let budget of budgets) {
      if (budget.category in this.mainBudgets) {
        var level = 3;
        if (budget.mainCategory == budget.category) {
          level = 1
        }
        else if (budget.mainCategory == budget.category2) {
          level = 2
        }
        if (this.mainBudgets[budget.category] == level) {
          this.mainBudgets[budget.category] = this.roundNumber(this.mainBudgets[budget.category] + Number(budget.amount), 2)
          // mainBudgets[budget.category] += Number(budget.amount)
        }
        else if (this.mainBudgets[budget.category] < level) {
          this.mainBudgets[budget.category] = Number(budget.amount)
        }
      }
      else {
        this.mainBudgets[budget.category] = Number(budget.amount)
      }
    }
  }

  checkAndUpdateUserGoals(accountIds, allGoals, allUserGoals, userGoalData) {
    /*
    If (prev date is same month and year as current date) {
      do nothing
    }
    Else {
      Check all the related goals and update progress bar accordingly.
      If all goal is flagged,
          - Check to see if it has already been achieved
    }

    return forkJoin(promises).pipe(
           map(data => this.getBest(data))
        );
    */

    var accountsItemStatus = []
    var didNotPass = false
    for (let accountId in accountIds) {
      accountsItemStatus.push(null)
    }

    return this.budgetService.getBudgets()
      .pipe( mergeMap(budgets => {
        console.log("11111111")
        this.budgets = budgets;
        console.log(budgets)
        var oldDate = new Date(JSON.parse(localStorage.getItem('JWT'))["lastUpdated"])
        var currDate = new Date();
        this.totalBudgetAmount = 0
        // var oldDate = new Date("2020-11-21T01:14:54.483Z");
        // var currDate = new Date("2020-12-11T01:14:54.483Z"); 
        console.log(oldDate)
        console.log(currDate)
        console.log(budgets.length)
        // Step 1: Gather total number of months to check + total Budget amount
        var oldYear = oldDate.getFullYear();
        var oldMonth = oldDate.getMonth()+1;
        var currYear = currDate.getFullYear();
        var currMonth = currDate.getMonth()+1;
        var remainderMonths = 0
        this.numMonthsAhead = 0
        if (currMonth > oldMonth) {
          remainderMonths = (currMonth - oldMonth);
          this.numMonthsAhead = (currYear - oldYear)*12 + remainderMonths;
        }
        else {
          remainderMonths = currMonth + (12 - oldMonth);
          this.numMonthsAhead = (currYear - oldYear - 1)*12 + remainderMonths;
        }
        
        // var totalBudgetAmount = 0;
        // for (let budget of budgets) {
        //   totalBudgetAmount = totalBudgetAmount + Number(budget.amount);
        // }

        console.log("Number of Months ahead: ", this.numMonthsAhead)
        if (this.numMonthsAhead > 0 && budgets.length > 0) {
          // Time to update
          console.log("passed")
          
          // Step 2: Convert them to pairs (total number of days, days behind current date) + get highest budget categories
          this.pairs = [];
          var i = 0
          var days = this.dates[oldMonth][1]
          var subdays = 0; 
          var currentMonth = currMonth;
          while (i != this.numMonthsAhead) {
            if (subdays == 0) {
              subdays = currDate.getDate() // num days elapsed in current month
            }
            else {
              subdays = subdays + this.dates[currentMonth][1]
            }
            currentMonth = currentMonth - 1;
            if (currentMonth == 0) {
              currentMonth = 12;
            }
            i = i + 1;
          }
          var currentMonthName = this.dates[currentMonth][0]
          while (i > 0) {
            this.pairs.push([currentMonthName, {days: days, subdays: subdays}])
            currentMonth = currentMonth + 1;
            if (currentMonth == 13) {
              currentMonth = 1;
            }
            days = this.dates[currentMonth][1];
            subdays = subdays - this.dates[currentMonth][1];
            currentMonthName = this.dates[currentMonth][0]
            i = i - 1;
          }
          this.mainBudgets = {}
          for (let budget of budgets) {
            if (budget.category in this.mainBudgets) {
              var level = 3;
              if (budget.mainCategory == budget.category) {
                level = 1
              }
              else if (budget.mainCategory == budget.category2) {
                level = 2
              }
              if (this.mainBudgets[budget.category] == level) {
                this.mainBudgets[budget.category] = this.roundNumber(this.mainBudgets[budget.category] + Number(budget.amount), 2)
                // mainBudgets[budget.category] += Number(budget.amount)
              }
              else if (this.mainBudgets[budget.category] < level) {
                this.mainBudgets[budget.category] = Number(budget.amount)
              }
            }
            else {
              this.mainBudgets[budget.category] = Number(budget.amount)
            }
          }
          this.totalBudgetAmount = 0
          for (let key of Object.keys(this.mainBudgets)) {
            this.totalBudgetAmount = this.roundNumber(this.totalBudgetAmount + this.mainBudgets[key], 2)
            // this.totalBudgetAmount += mainBudgets[key]
          }

          console.log("Pairs: ", this.pairs)
          console.log("Total Budget Amount: ", this.totalBudgetAmount)

          // Step 3: Check them and update user goals accordingly
          let transactionObservables: Observable<any>[] = [];
          for (let pair of this.pairs) {
            for (let accountId of accountIds) {
              transactionObservables.push(this.accountService.getBudgetTransactions(accountId, pair[1]['days'], pair[1]['subdays']))
            }
          }
          console.log("22222222")
          return forkJoin(transactionObservables)
        }
        else {
          console.log("did not pass")
          didNotPass = true
          let transactionObservables: Observable<any>[] = [];
          for (let accountId of accountIds) { // purely to check for invalid items
            transactionObservables.push(this.accountService.getBudgetTransactions(accountId, 30, 0))
          }
          if (transactionObservables.length == 0) {
            return of(null);
          }
          console.log("22222222empty")
          return forkJoin(transactionObservables)
        }
      }),
      mergeMap(transactionsDataArray => {
        console.log("33333333")
        if (transactionsDataArray == null) {
          return of(null)
        }
        console.log(transactionsDataArray)
        let usergoalObservables: Observable<any>[] = [];
        var accountsIndex = 0;
        var foundInvalid = false;
        for (let transactions of transactionsDataArray) {
          if (transactions.error) {
            console.log("invalid item for account")
            // var oldValues = JSON.parse(localStorage.getItem('User Accounts Details'));
            // oldValues.currentAccount[0].itemValid = false;
            // localStorage.setItem('User Accounts Details', JSON.stringify(oldValues));
            // return this._ngZone.run(() => this.router.navigate(['/home']));

            // return of("item invalid")
            accountsItemStatus[accountsIndex] = "item invalid"
            foundInvalid = true;
            accountsIndex += 1
            if (accountsIndex == accountIds.length) {
              accountsIndex = 0
            }
          }
        }
        if (foundInvalid) {
            return of("item invalid") // if no budget and no invalid accounts, will have monthlyBudget = 0
        }
        var pairsIndex = 0;
        var accountsIndex = 0;
        var monthlyTotal = 0
        var potentialMonthlyGoals = []
        var allMonthsId = null
        var threeRowId = null
        var sixRowId = null
        var nineRowId = null
        var oneYearRowId = null
        var budgetBusterId = null
        var expertBudgeteerId = null
        var threeRowIndex = null
        var sixRowIndex = null
        var nineRowIndex = null
        var oneYearRowIndex = null
        var budgetBusterIndex = null
        var expertBudgeteerIndex = null
        for (let goal of allGoals) {
          if (goal.goalName == "Budget Manager - All Months") {
            console.log("found all months")
            for (let ug of allUserGoals) {
              if (ug.goalId == goal._id) {
                allMonthsId = ug._id
                break
              }
            }
          }
          if (goal.goalName == "3 in a Row!") {
            console.log("found 3 in a row")
            var index = 0
            for (let ug of allUserGoals) {
              if (ug.goalId == goal._id) {
                threeRowId = ug._id
                threeRowIndex = index
                break
              }
              index += 1
            }
          }
          if (goal.goalName == "6 in a Row!") {
            console.log("found 6 in a row")
            var index = 0
            for (let ug of allUserGoals) {
              if (ug.goalId == goal._id) {
                sixRowId = ug._id
                sixRowIndex = index
                break
              }
              index += 1
            }
          }
          if (goal.goalName == "9 in a Row!") {
            console.log("found 9 in a row")
            var index = 0
            for (let ug of allUserGoals) {
              if (ug.goalId == goal._id) {
                nineRowId = ug._id
                nineRowIndex = index
                break
              }
              index += 1
            }
          }
          if (goal.goalName == "One Year Streak!") {
            console.log("found one year in a row")
            var index = 0
            for (let ug of allUserGoals) {
              if (ug.goalId == goal._id) {
                oneYearRowId = ug._id
                oneYearRowIndex = index
                break
              }
              index += 1
            }
          }
          if (goal.goalName == "Budget Buster") {
            console.log("found budget buster")
            var index = 0
            for (let ug of allUserGoals) {
              if (ug.goalId == goal._id) {
                budgetBusterId = ug._id
                budgetBusterIndex = index
                break
              }
              index += 1
            }
          }
          if (goal.goalName == "Expert Budgeteer") {
            console.log("found expert budgeteer")
            var index = 0
            for (let ug of allUserGoals) {
              if (ug.goalId == goal._id) {
                expertBudgeteerId = ug._id
                expertBudgeteerIndex = index
                break
              }
              index += 1
            }
          }
        }
        console.log("all months id: ", allMonthsId)
        console.log("3 in a row id: ", threeRowId)
        console.log("6 in a row id: ", sixRowId)
        console.log("9 in a row id: ", nineRowId)
        console.log("one year in a row id: ", oneYearRowId)
        console.log("budget buster id: ", budgetBusterId)
        console.log("expert budgeteer id: ", expertBudgeteerId)

        var allMonthsDone = true
        for (let month in userGoalData.allMonthsAchieved) {
          if (!userGoalData.allMonthsAchieved[month]) {
            allMonthsDone = false
            break
          }
        }

        this.updateMainBudgets(this.budgets)
        console.log(this.mainBudgets)
        
        for (let transactions of transactionsDataArray) {
          console.log("inside transactions loop")
          this.transactionIds = {}
          if (accountsIndex < accountIds.length) {
            // Per month
            for (let budget of this.budgets) {
              if (budget.mainCategory in this.mainBudgets) {
                var mainCategory = budget.mainCategory;
                var total = 0;
                for (let transaction of transactions) {
                  for (let category of transaction.category) {
                    if (category == mainCategory && transaction.amount >= 0) {
                      console.log(transaction)
                      this.transactionIds[transaction.transaction_id] = null
                      total = this.roundNumber(total + transaction.amount, 2)
                      // total += transaction.amount;
                      break;
                    }
                  }
                }
                monthlyTotal = this.roundNumber(monthlyTotal + total, 2)
                // monthlyTotal += total;
              }
            }
            accountsIndex += 1
            if (accountsIndex < accountIds.length) {
              continue
            }
          }
          console.log("Monthly Total: ", monthlyTotal)
          console.log("Total Budget Amount: ", this.totalBudgetAmount)

          this.untrackedTransactions = []
          for (let transaction of transactions) {
            if (!(transaction.transaction_id in this.transactionIds)) {
              if (transaction.amount >= 0) {
                this.untrackedTransactions.push(transaction)
              }
            }
          }

          if (this.numMonthsAhead > 0 && this.budgets.length > 0) {
            console.log("in expert budgeteer")
            if (this.untrackedTransactions.length == 0) {
              console.log("updating expert budgeteer")
              var retObj = {}
              if (allUserGoals[expertBudgeteerIndex].numTimesAchieved == 0) {
                retObj['done'] = "Done"
                retObj["numTimesAchieved"] = allUserGoals[expertBudgeteerIndex].numTimesAchieved+1
                usergoalObservables.push(this.updateUserGoal(expertBudgeteerId, retObj))
              }
              else if (allUserGoals[budgetBusterIndex].goalProgress == 100) {
                retObj['done'] = "Already Done"
                retObj["numTimesAchieved"] = allUserGoals[expertBudgeteerIndex].numTimesAchieved+1
                usergoalObservables.push(this.updateUserGoal(expertBudgeteerId, retObj))
              }
            } 
          }

          var currBudgetMargin = this.roundNumber(monthlyTotal - this.totalBudgetAmount, 2)
          // var currBudgetMargin = monthlyTotal - this.totalBudgetAmount

          if (this.numMonthsAhead > 0 && this.budgets.length > 0) {
            console.log("in budget buster")
            if (userGoalData.prevBudgetMargin != null && userGoalData.prevBudgetMargin > currBudgetMargin) {
              console.log("updating budget buster")
              var retObj = {}
              if (allUserGoals[budgetBusterIndex].goalProgress != 100) {
                retObj['done'] = "Done"
                retObj["numTimesAchieved"] = allUserGoals[budgetBusterIndex].numTimesAchieved+1
                usergoalObservables.push(this.updateUserGoal(budgetBusterId, retObj))
              }
              else if (allUserGoals[budgetBusterIndex].goalProgress == 100) {
                retObj['done'] = "Already Done"
                retObj["numTimesAchieved"] = allUserGoals[budgetBusterIndex].numTimesAchieved+1
                usergoalObservables.push(this.updateUserGoal(budgetBusterId, retObj))
              }
            }
            userGoalData.prevBudgetMargin = currBudgetMargin
          }

          var nextMonthVal = 0
          if (userGoalData.previousMonth != "") {
            // Get correct next val
            if (this.reverseDates[userGoalData.previousMonth] + 1 == 13) {
              nextMonthVal = 1
            }
            else {
              nextMonthVal = this.reverseDates[userGoalData.previousMonth] + 1
            }
            // Update monthsInARow
            if (monthlyTotal < this.totalBudgetAmount) {
              if (nextMonthVal == this.reverseDates[this.pairs[pairsIndex][0]]) {
                userGoalData.previousMonth = this.pairs[pairsIndex][0]
                userGoalData.monthsInARow += 1
              }
              else {
                userGoalData.previousMonth = this.pairs[pairsIndex][0]
                userGoalData.monthsInARow = 1
              }
            }
            else {
              if (this.numMonthsAhead > 0) {
                userGoalData.monthsInARow = 0
              }
            }
          }
          else {
            if (monthlyTotal < this.totalBudgetAmount) {
              userGoalData.previousMonth = this.pairs[pairsIndex][0]
              userGoalData.monthsInARow = 1
            }
            else {
              if (this.numMonthsAhead > 0) {
                userGoalData.monthsInARow = 0
              }
            }
          }

          if (userGoalData.monthsInARow == 0) {
            var retObj = {}
            retObj['done'] = "Not Done"
            retObj["goalProgression"] = 0
            if (allUserGoals[threeRowIndex].goalProgress != 100) {
              usergoalObservables.push(this.updateUserGoal(threeRowId, retObj))
            }
            if (allUserGoals[sixRowIndex].goalProgress != 100) {
              usergoalObservables.push(this.updateUserGoal(sixRowId, retObj))
            }
            if (allUserGoals[nineRowIndex].goalProgress != 100) {
              usergoalObservables.push(this.updateUserGoal(nineRowId, retObj))
            }
            if (allUserGoals[oneYearRowIndex].goalProgress != 100) {
              usergoalObservables.push(this.updateUserGoal(oneYearRowId, retObj))
            }
          }

          console.log("Updated Months in a Row: ", userGoalData.monthsInARow)

          // BUDGET MANAGER MONTHLY GOALS
          if (monthlyTotal < this.totalBudgetAmount) {
            var fullGoalName = "Budget Manager - " + this.pairs[pairsIndex][0]
          
            // Check for "In a Row" goals
            var retObj = {}
            if (userGoalData.monthsInARow == 3) {  // NOT EFFICIENT< SHOULD NOT ADD AS OBSERVABKE TILL ALL GOALS DONE
              retObj['done'] = "Done"
              retObj["numTimesAchieved"] = allUserGoals[threeRowIndex].numTimesAchieved + 1
              usergoalObservables.push(this.updateUserGoal(threeRowId, retObj))
            }
            else if (userGoalData.monthsInARow == 6) {
              retObj['done'] = "Done"
              retObj["numTimesAchieved"] = allUserGoals[sixRowIndex].numTimesAchieved + 1
              usergoalObservables.push(this.updateUserGoal(sixRowId, retObj))
            }
            else if (userGoalData.monthsInARow == 9) {
              retObj['done'] = "Done"
              retObj["numTimesAchieved"] = allUserGoals[nineRowIndex].numTimesAchieved + 1
              usergoalObservables.push(this.updateUserGoal(nineRowId, retObj))
            }
            else if (userGoalData.monthsInARow == 12) {
              retObj['done'] = "Done"
              retObj["numTimesAchieved"] = allUserGoals[oneYearRowIndex].numTimesAchieved + 1
              usergoalObservables.push(this.updateUserGoal(oneYearRowId, retObj))
            }

            if (userGoalData.monthsInARow > 0 && userGoalData.monthsInARow < 3) {
              if (allUserGoals[threeRowIndex].goalProgress != 100) {
                var retObj = {}
                retObj['done'] = "Not Done"
                retObj["goalProgression"] = this.roundNumber((userGoalData.monthsInARow / 3)*100, 2)
                usergoalObservables.push(this.updateUserGoal(threeRowId, retObj))
              }
              if (allUserGoals[sixRowIndex].goalProgress != 100) {
                var retObj = {}
                retObj['done'] = "Not Done"
                retObj["goalProgression"] = this.roundNumber((userGoalData.monthsInARow / 6)*100, 2)
                usergoalObservables.push(this.updateUserGoal(sixRowId, retObj))
              }
              if (allUserGoals[nineRowIndex].goalProgress != 100) {
                var retObj = {}
                retObj['done'] = "Not Done"
                retObj["goalProgression"] = this.roundNumber((userGoalData.monthsInARow / 9)*100, 2)
                usergoalObservables.push(this.updateUserGoal(nineRowId, retObj))
              }
              if (allUserGoals[oneYearRowIndex].goalProgress != 100) {
                var retObj = {}
                retObj['done'] = "Not Done"
                retObj["goalProgression"] = this.roundNumber((userGoalData.monthsInARow / 12)*100, 2)
                usergoalObservables.push(this.updateUserGoal(oneYearRowId, retObj))
              }
            }
            else if (userGoalData.monthsInARow > 0 && userGoalData.monthsInARow < 6) {
              if (allUserGoals[sixRowIndex].goalProgress != 100) {
                var retObj = {}
                retObj['done'] = "Not Done"
                retObj["goalProgression"] = this.roundNumber((userGoalData.monthsInARow / 6)*100, 2)
                usergoalObservables.push(this.updateUserGoal(sixRowId, retObj))
              }
              if (allUserGoals[nineRowIndex].goalProgress != 100) {
                var retObj = {}
                retObj['done'] = "Not Done"
                retObj["goalProgression"] = this.roundNumber((userGoalData.monthsInARow / 9)*100, 2)
                usergoalObservables.push(this.updateUserGoal(nineRowId, retObj))
              }
              if (allUserGoals[oneYearRowIndex].goalProgress != 100) {
                var retObj = {}
                retObj['done'] = "Not Done"
                retObj["goalProgression"] = this.roundNumber((userGoalData.monthsInARow / 12)*100, 2)
                usergoalObservables.push(this.updateUserGoal(oneYearRowId, retObj))
              }
            }
            else if (userGoalData.monthsInARow > 0 && userGoalData.monthsInARow < 9) {
              if (allUserGoals[nineRowIndex].goalProgress != 100) {
                var retObj = {}
                retObj['done'] = "Not Done"
                retObj["goalProgression"] = this.roundNumber((userGoalData.monthsInARow / 9)*100, 2)
                usergoalObservables.push(this.updateUserGoal(nineRowId, retObj))
              }
              if (allUserGoals[oneYearRowIndex].goalProgress != 100) {
                var retObj = {}
                retObj['done'] = "Not Done"
                retObj["goalProgression"] = this.roundNumber((userGoalData.monthsInARow / 12)*100, 2)
                usergoalObservables.push(this.updateUserGoal(oneYearRowId, retObj))
              }
            }
            else if (userGoalData.monthsInARow > 0 && userGoalData.monthsInARow < 12) {
              var retObj = {}
              retObj['done'] = "Not Done"
              retObj["goalProgression"] = this.roundNumber((userGoalData.monthsInARow / 12)*100, 2)
              if (allUserGoals[oneYearRowIndex].goalProgress != 100) {
                usergoalObservables.push(this.updateUserGoal(oneYearRowId, retObj))
              }
            }
          


            for (let goal of allGoals) {
              console.log(goal.goalName, fullGoalName)
              if (goal.goalName == fullGoalName) {
                for (let usergoal of allUserGoals) {
                  if (usergoal.goalId == goal._id) {
                    var retObj = {}
                    if (usergoal.goalProgress == 0) {
                      retObj['done'] = "Done"
                      retObj["numTimesAchieved"] = usergoal.numTimesAchieved+1
                    }
                    else {
                      retObj['done'] = "Already Done"
                      retObj["numTimesAchieved"] = usergoal.numTimesAchieved+1 //needs to be years since last achieved
                    }
                    var found = false
                    for (let obj of potentialMonthlyGoals) {
                      if (obj[0] == usergoal._id) {
                        obj[1]["numTimesAchieved"] += 1
                        found = true
                        console.log("found dup month")
                        break
                      }
                    }
                    if (!found) {
                      userGoalData.allMonthsAchieved[this.pairs[pairsIndex][0]] = true
                      potentialMonthlyGoals.push([usergoal._id, retObj])
                    }
                    break
                  }
                }
                break;
              }
            }
          }
          // need to check for more goals here
          accountsIndex = 0;
          monthlyTotal = 0
          pairsIndex += 1
        }

        if (!allMonthsDone) {
          var monthsCount = 0
          allMonthsDone = true
          for (let month in userGoalData.allMonthsAchieved) {
            if (!userGoalData.allMonthsAchieved[month]) {
              allMonthsDone = false
            }
            else {
              monthsCount += 1
            }
          }
          if (allMonthsDone) {
            var retObj = {}
            retObj['done'] = "Done"
            retObj["numTimesAchieved"] = 1
            usergoalObservables.push(this.updateUserGoal(allMonthsId, retObj))
          }
          else {
            var retObj = {}
            retObj['done'] = "Not Done"
            retObj["goalProgression"] = this.roundNumber((monthsCount / 12)*100, 2)
            usergoalObservables.push(this.updateUserGoal(allMonthsId, retObj))
          }
        }

        for (let obj of potentialMonthlyGoals) {
          usergoalObservables.push(this.updateUserGoal(obj[0], obj[1]))
        }
        // Step 4: Update local user goals
        if (usergoalObservables.length == 0) {
          console.log("no user goals progressed")
          return of(null)
        }
        else {
          console.log("44444444")
          return forkJoin(usergoalObservables)
        }
      }),
      mergeMap(dataArray => {
        console.log("55555555")
        console.log(dataArray)
        if (dataArray == "item invalid") {
          return of([accountsItemStatus, []])
        }
        var unlockedGoals = []
        if (dataArray != null) {
          console.log("In usergoals fork join")
          console.log(dataArray)
          for (let updatedUG of dataArray) {
            var j = 0;
            for (let ug of allUserGoals) {
              if (ug._id == updatedUG._id) {
                allUserGoals[j] = updatedUG;
                console.log(allUserGoals[j])
                break
              }
              j += 1
            }
            if (updatedUG.goalProgress == 100) {
              unlockedGoals.push(updatedUG) 
            }
          }
        }
        // this.authService.storeUserGoalsDetails({usergoals: allUserGoals});
        // return this.authService.update()
        // return of(null)
        return of([accountsItemStatus, unlockedGoals])
      }))  
  }

  roundNumber(number, decimals) {
    var newnumber = new Number(number+'').toFixed(parseInt(decimals));
    return parseFloat(newnumber); 
  }

  updateUserGoal(usergoalId: string, usergoalinfo: object) {
    return this.http.put<UserGoal>(baseURL + 'usergoals/' + usergoalId, usergoalinfo);
  }

  getGoalData(userId: string) {
    return this.http.post<GoalDataResponse>(baseURL + 'goals/goaldata/' + userId, null);
  }

  // addGoalData(userId: string) {
  //   return this.http.post<GoalDataResponse>(baseURL + 'goals/goaldata' + userId, null);
  // }

  updateGoalData(goaldata: GoalData) {
    return this.http.put<GoalData>(baseURL + 'goals/goaldata/' + goaldata._id, goaldata);
  }

}
