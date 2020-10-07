import { of } from 'rxjs';
import { TRANSACTIONS } from '../shared/transactions';
import { BUDGETS } from '../shared/budgets';

export class BudgetServiceStub {

  getBudgets() {
    return of(BUDGETS)
  }

  addBudget(budgetData: Object) {
    
  }

  updateBudget(budgetId: string, update: object) {
    
  }

  deleteBudget(budgetId: string) {
    
  }
}