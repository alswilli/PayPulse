import { of } from 'rxjs';
import { TRANSACTIONS, LESSTHAN30TRANSACTIONS, MORETHAN30TRANSACTIONS } from '../shared/transactions';
import { CATEGORIES } from '../shared/categories';

export class AccountServiceStub {
  getUserList() {
    return of({
      data: [
        { id: 1, first_name: 'George', last_name: 'Bluth', avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/calebogden/128.jpg' },
        { id: 2, first_name: 'Janet', last_name: 'Weaver', avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/josephstein/128.jpg' },
        { id: 3, first_name: 'Emma', last_name: 'Wong', avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/olegpogodaev/128.jpg' },
      ],
    });
  }

  getUserDetails() {
    return of({
      data: {
        id: 1,
        first_name: 'George',
        last_name: 'Bluth',
        avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/calebogden/128.jpg',
      },
    });
  }

  addAccount(plaidEventData: Object) {

  }

  // deleteAcount()

  getAccounts() {
    
  }

  getCurrentAccount() {
    
  }

  getTransactions(accountId: string, postsPerPage: number, currentPage: number, subAccount: string, subAccoutId: string) {
    return of({transactions: TRANSACTIONS, maxTransactions: 1});
  }

  getTransactionCategories() {
    return of(CATEGORIES)
  }

  getRecentTransactions(accountId: string) {
    
  }

  getBudgetTransactions(accountId: string, days: number, subdays: number) {
    if (days < 30) {
      return of(LESSTHAN30TRANSACTIONS)
    }
    else if (days >= 30) {
      return of(MORETHAN30TRANSACTIONS)
    }
  }
}