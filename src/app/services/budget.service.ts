import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProcessHTTPMsgService } from './process-httpmsg.service';
import { baseURL } from '../shared/baseurl';
import { Budget } from '../shared/budget';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  constructor(private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService) { }

  getBudgets() {
    return this.http.get<Budget[]>(baseURL + 'budgets');
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  addBudget(budgetData: Object) {
    return this.http.post<Budget>(baseURL + 'budgets', budgetData);
    // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  updateBudget(budgetId: string, update: object) {
    return this.http.put(baseURL + 'budgets/' + budgetId, update);
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  deleteBudget(budgetId: string) {
    return this.http.delete(baseURL + 'budgets/' + budgetId);
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }
}
