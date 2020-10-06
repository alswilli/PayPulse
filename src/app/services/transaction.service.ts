import { Injectable } from '@angular/core';
import { Transaction } from '../shared/transaction';

import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { ProcessHTTPMsgService } from './process-httpmsg.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService) { }

  getTransactions(postsPerPage: number, currentPage: number) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    return this.http.get<{transactions: any[], maxTransactions: number}>(baseURL + 'transactions' + queryParams)
      .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getTransaction(id: string): Observable<any> {
    return this.http.get<any>(baseURL + 'transactions/' + id)
      .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getRecentTransactions() {
    return this.http.get<any[]>(baseURL + 'transactions?recentTransactions=true')
      .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  // getTransactionIds(): Observable<number[] | any> {
  //   return this.getTransactions().pipe(map(transactions => transactions.map(transaction => transaction._id)))
  //     .pipe(catchError(error => error));
  // }
}
