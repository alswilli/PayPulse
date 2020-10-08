import { of } from 'rxjs';
import { TRANSACTIONS } from '../shared/transactions';
import { BUDGETS, ADDEDBUDGETS } from '../shared/budgets';

export class BudgetServiceStub {

  getBudgets() {
    return of(BUDGETS)
  }

  addBudget(budgetData: Object) {
    return of(ADDEDBUDGETS)
  }

  updateBudget(budgetId: string, update: object) {
    
  }

  deleteBudget(budgetId: string) {
    
  }
}