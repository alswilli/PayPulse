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

interface ItemTokenResponse {
  public_token: string;
  index: number;
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

  getItemLinkToken(userData: object) {
    return this.http.post<ItemTokenResponse>(baseURL + 'plaid/accounts/create_link_token', userData);
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getItemPublicToken(accountId: string, index: number) {
    const queryParams = `?index=${index}`
    return this.http.get<ItemTokenResponse>(baseURL + 'plaid/accounts/create_public_token/' + accountId + queryParams);
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getAccounts() {
    return this.http.get<GetAccountsResponse>(baseURL + 'plaid/accounts');
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getCurrentAccounts() {
    return this.http.get<Account[]>(baseURL + 'plaid/accounts?current=true');
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  // addUserGoals(userGoalDatas, userId) {
  //   console.log("adding multiple user goals")
  //   console.log(userGoalDatas)
  //   let addObservables: Observable<any>[] = [];
  //   for (let userGoalData of userGoalDatas) {
  //     addObservables.push(this.addUserGoal(userGoalData, userId))
  //   }
  //   if (addObservables.length == 0) {
  //     return of(null)
  //   }
  //   return forkJoin(addObservables)
  // }

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
  updateCurrentAccounts(accountId: string, update: object) {
    return this.http.put(baseURL + 'plaid/accounts/' + accountId, update);
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  updateItemInvalidAccount(accountId: string, update: object) {
    return this.http.put(baseURL + 'plaid/accounts/' + accountId, update);
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getTransactions(accountId: string, postsPerPage: number, currentPage: number, subAccountIds: string[]) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}&subAccountIds=${subAccountIds}`;
    return this.http.get<{success: boolean, transactions: any[], maxTransactions: number}>(baseURL + 'plaid/accounts/transactions/' + accountId + queryParams);
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getRecentTransactions(accountId: string, days: number, subdays: number) {
    const queryParams = `&days=${days}&subdays=${subdays}`;
    return this.http.get<any[]>(baseURL + 'plaid/accounts/transactions/'  + accountId + '?recentTransactions=true' + queryParams);
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getBudgetTransactions(accountId: string, days: number, subdays: number) {
    const queryParams = `&days=${days}&subdays=${subdays}`;
    return this.http.get<any[]>(baseURL + 'plaid/accounts/transactions/'  + accountId + '?budgetTransactions=true' + queryParams);
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getTransactionCategories() {
    console.log("getting here");
    return this.http.get<any[]>(baseURL + 'plaid/accounts/categories');
      // .pipe(catchError(this.processHTTPMsgService.handleError));
  }
}
