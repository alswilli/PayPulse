import { Injectable } from '@angular/core';
import { Account } from '../shared/account';
import { Transaction } from '../shared/transaction';

import { Observable, Subject } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { ProcessHTTPMsgService } from './process-httpmsg.service';

interface GetAccountsResponse {
  success: string;
  numAccounts: number;
  accountsData: Account[];
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  // categoriesSub: Subject<{}> = new Subject<{}>();

  constructor(private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService) { 
      // this.getTransactionCategories()
      //   .subscribe(categories => {
      //     console.log(categories);
      //     var categs = {};
      //     for (let row of categories) {
      //       var i = 0;
      //       var currStr = "";
      //       var curr = categs;
      //       while (i < row.hierarchy.length) {
      //         currStr = row.hierarchy[i];
      //         // if (currStr !== "") {
      //         //   currStr = currStr + "." + row.hierarchy[i];
      //         // }
      //         // else {
      //         //   currStr = row.hierarchy[i];
      //         // }
      //         if (currStr in curr) {
      //           curr = curr[currStr];
      //         }
      //         else {
      //           curr[currStr] = {};
      //           curr = curr[currStr];
      //         }
      //         i += 1;
      //       }
      //     }
      //     console.log(categs)
      //     this.categoriesSub.next(categs);
      //   });
    }

  // getCategoriesSub(): Observable<{}> {
  //   return this.categoriesSub.asObservable();
  // }

  addAccount(plaidEventData: Object) {
    return this.http.post<Account>(baseURL + 'plaid/accounts/add', plaidEventData);
    // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  deleteAccount(accountId: string) {
    return this.http.delete(baseURL + 'plaid/accounts/' + accountId);
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getAccounts() {
    return this.http.get<GetAccountsResponse>(baseURL + 'plaid/accounts');
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getCurrentAccount() {
    return this.http.get(baseURL + 'plaid/accounts?current=true');
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  // updateCurrentAccount(cancelId: string, assignId: string) {
  //   return this.http.put(baseURL + 'plaid/accounts/' + cancelId, {current: false})
  //     // .pipe(catchError(this.processHTTPMsgService.handleError));
  //     .pipe( switchMap(res => {
  //       console.log("Cancelled account: ", res)
  //       return this.http.put(baseURL + 'plaid/accounts/' + assignId, {current: true})
  //     }), map(res2 => {
  //       console.log("Added account: ", res2);
  //       return res2; 
  //     }),
  //       catchError(this.processHTTPMsgService.handleError));
  // }
  updateCurrentAccount(accountId: string, update: object) {
    return this.http.put(baseURL + 'plaid/accounts/' + accountId, update);
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getTransactions(accountId: string, postsPerPage: number, currentPage: number, subAccount: string, subAccountId: string) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}&subAccount=${subAccount}&subAccountId=${subAccountId}`;
    return this.http.get<{transactions: Transaction[], maxTransactions: number}>(baseURL + 'plaid/accounts/transactions/' + accountId + queryParams);
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getRecentTransactions(accountId: string) {
    return this.http.get<Transaction[]>(baseURL + 'plaid/accounts/transactions/'  + accountId + '?recentTransactions=true');
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getBudgetTransactions(accountId: string, days: number) {
    const queryParams = `&days=${days}`;
    return this.http.get<Transaction[]>(baseURL + 'plaid/accounts/transactions/'  + accountId + '?budgetTransactions=true' + queryParams);
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getTransactionCategories() {
    console.log("getting here");
    return this.http.get<any[]>(baseURL + 'plaid/accounts/categories');
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }
}
