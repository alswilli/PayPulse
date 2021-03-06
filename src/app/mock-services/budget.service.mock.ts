import { of } from 'rxjs';
import { TRANSACTIONS } from '../shared/transactions';
import { BUDGETS, ADDEDBUDGETS } from '../shared/budgets';
import { Budget } from '../shared/budget';

export class BudgetServiceStub {

  getBudgets() {
    return of(BUDGETS)
  }

  addBudget(budgetData) {
    //   console.log("ID: ", budgetData[0])
    //   console.log("PRE: ", budgetData[1])
      console.log(budgetData)
    // return of(ADDEDBUDGETS)
    var newBudget: Budget = {
        _id : "",
      userId : "",
      mainCategory : budgetData.mainCategory,
      category : budgetData.category,
      category2 : budgetData.category2,
      category3 : budgetData.category3,
      amount : budgetData.amount,
      total : 0
    }
    console.log("NEW BUDGET: ", newBudget)
    return of(newBudget)
  }

  updateBudget(budgetId: string, budgetData) {
    console.log("ID: ", budgetId)
    var editedBudget: Budget = {
        _id : budgetId,
      userId : "",
      mainCategory : budgetData.mainCategory,
      category : budgetData.category,
      category2 : budgetData.category2,
      category3 : budgetData.category3,
      amount : budgetData.amount,
      total : 0
    }
    console.log("EDITED BUDGET: ", editedBudget)
    return of(editedBudget)
  }

  deleteBudget(budgetId: string, budget) {
    return of(budget);
  }
}