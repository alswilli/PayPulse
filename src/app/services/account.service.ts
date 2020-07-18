import { Injectable } from '@angular/core';
import { Account } from '../shared/account';
import { Transaction } from '../shared/transaction';

import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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

  constructor(private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService) { }

  addAccount(plaidEventData: Object) {
    return this.http.post<Account>(baseURL + 'plaid/accounts/add', plaidEventData)
    .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  // deleteAcount()

  getAccounts() {
    return this.http.get<GetAccountsResponse>(baseURL + 'plaid/accounts')
      .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getCurrentAccount() {
    return this.http.get(baseURL + 'plaid/accounts?current=true')
      .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getTransactions(accountId: string, postsPerPage: number, currentPage: number) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    return this.http.get<{transactions: Transaction[], maxTransactions: number}>(baseURL + 'plaid/accounts/transactions/' + accountId + queryParams)
      .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getRecentTransactions(accountId: string) {
    return this.http.get<Transaction[]>(baseURL + 'plaid/accounts/transactions/'  + accountId + '?recentTransactions=true')
      .pipe(catchError(this.processHTTPMsgService.handleError));
  }
}
