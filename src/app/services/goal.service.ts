import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { Goal } from '../shared/goal';
import { UserGoal } from '../shared/usergoal';
import { Observable, forkJoin, of } from 'rxjs';
import { AuthService } from './auth.service';
import { AccountService } from './account.service';
import { BudgetService } from './budget.service';
import { BindingType } from '@angular/compiler';
import { map, mergeMap } from 'rxjs/operators';
import { Router } from "@angular/router";
import { TransactionService } from './transaction.service';
import { Budget } from '../shared/budget';
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
  budgets: Budget[];
  totalBudgetAmount: number;
  pairs: any;

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

  checkAndUpdateUserGoals(accountIds, allGoals, allUserGoals) {
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
    for (let accountId in accountIds) {
      accountsItemStatus.push(null)
    }

    return this.budgetService.getBudgets()
      .pipe( mergeMap(budgets => {
        console.log("11111111")
        this.budgets = budgets;
        var oldDate = new Date(JSON.parse(localStorage.getItem('JWT'))["lastUpdated"])
        var currDate = new Date();
        // var currDate = new Date("2020-12-21T01:14:54.483Z"); 
        if (oldDate != null && oldDate.getMonth() != currDate.getMonth() && budgets.length > 0) {
          // Time to update
          console.log("passed")

          // Step 1: Gather total number of months to check + total Budget amount
          var oldYear = oldDate.getFullYear();
          var oldMonth = oldDate.getMonth()+1;
          var currYear = currDate.getFullYear();
          var currMonth = currDate.getMonth()+1;
          var remainderMonths = 0
          if (currMonth > oldMonth) {
            remainderMonths = (currMonth - oldMonth);
          }
          else {
            remainderMonths = currMonth + (12 - oldMonth);
          }
          var numMonthsAhead = (currYear - oldYear)*12 + remainderMonths;
          // var totalBudgetAmount = 0;
          // for (let budget of budgets) {
          //   totalBudgetAmount = totalBudgetAmount + Number(budget.amount);
          // }

          console.log("Number of Months ahead: ", numMonthsAhead)
          
          // Step 2: Convert them to pairs (total number of days, days behind current date) + get highest budget categories
          this.pairs = [];
          var i = 0
          var days = this.dates[oldMonth][1]
          var subdays = 0; 
          var currentMonth = currMonth;
          while (i != numMonthsAhead) {
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
          var mainBudgets = {}
          for (let budget of budgets) {
            if (budget.category in mainBudgets) {
              var level = 3;
              if (budget.mainCategory == budget.category) {
                level = 1
              }
              else if (budget.mainCategory == budget.category2) {
                level = 2
              }
              if (mainBudgets[budget.category] == level) {
                mainBudgets[budget.category] += Number(budget.amount)
              }
              else if (mainBudgets[budget.category] < level) {
                mainBudgets[budget.category] = Number(budget.amount)
              }
            }
            else {
              mainBudgets[budget.category] = Number(budget.amount)
            }
          }
          this.totalBudgetAmount = 0
          for (let key of Object.keys(mainBudgets)) {
            this.totalBudgetAmount += mainBudgets[key]
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
        var index = 0;
        var accountsIndex = 0;
        var monthlyTotal = 0
        for (let transactions of transactionsDataArray) {
          console.log("inside transactions loop")
          if (accountsIndex < accountIds.length) {
            // Per month
            for (let budget of this.budgets) {
              var mainCategory = budget.mainCategory;
              var total = 0;
              for (let transaction of transactions) {
                for (let category of transaction.category) {
                  if (category === mainCategory) {
                    total += transaction.amount;
                    break;
                  }
                }
              }
              monthlyTotal += total;
            }
            accountsIndex += 1
            if (accountsIndex < accountIds.length) {
              continue
            }
          }
          console.log("Monthly Total: ", monthlyTotal)

          // BUDGET MANAGER MONTHLY GOALS
          if (monthlyTotal < this.totalBudgetAmount) {
            var fullGoalName = "Budget Manager - " + this.pairs[index][0]
            for (let goal of allGoals) {
              console.log(goal.goalName, fullGoalName)
              if (goal.goalName == fullGoalName) {
                for (let usergoal of allUserGoals) {
                  if (usergoal.goalId == goal._id) {
                    var retObj = {}
                    if (usergoal.goalProgress == 0) {
                      retObj['done'] = "Done"
                    }
                    else {
                      retObj['done'] = "Already Done"
                      retObj["numTimesAchieved"] = usergoal.numTimesAchieved+1 //needs to be years since last achieved
                    }
                    usergoalObservables.push(this.updateUserGoal(usergoal._id, retObj))
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
          index += 1
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
        if (dataArray == "item invalid") {
          return of(accountsItemStatus)
        }
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
          }
        }
        // this.authService.storeUserGoalsDetails({usergoals: allUserGoals});
        // return this.authService.update()
        // return of(null)
        return of(accountsItemStatus)
      }))  
  }

  updateUserGoal(usergoalId: string, usergoalinfo: object) {
    return this.http.put(baseURL + 'usergoals/' + usergoalId, usergoalinfo);
  }

}
