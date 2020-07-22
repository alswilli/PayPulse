import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { HttpClientModule } from '@angular/common/http';


import {AccountServiceStub} from '../mock-services/account.service.mock';
import {AccountService} from '../services/account.service';
import {Account} from '../shared/account';
import { baseURL } from '../shared/baseurl';
import { Observable, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TransactionsComponent } from './transactions.component';

interface GetAccountsResponse {
  success: string;
  numAccounts: number;
  accountsData: Account[];
}

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        HttpClientModule,
        RouterTestingModule.withRoutes([{ path: 'transactions', component: TransactionsComponent }])  
      ],
      declarations: [ TransactionsComponent ],
      providers: [
        { provide: AccountService, useClass: AccountServiceStub },
        { provide: 'baseURL', useValue: baseURL },
      ]
    })
    .compileComponents();

    // const accountservice = TestBed.get(AccountService);

  }));

  beforeEach(() => {
    // var jsonValue = {"Hello"};

    var store = {
          'accounts': 
            [
              {
                'accessToken': "123",
                'createdAt': "2020-07-21T19:08:51.632Z",
                'current': true,
                'institutionId': "ins_1",
                'institutionName': "Bank of America",
                'itemId': "fdouiwhefoh",
                'updatedAt': "2020-07-21T19:08:51.632Z",
                'userId': "fo32r78f",
                '__v': 0,
                '_id': "wfiug2f"
              },
              {
                'accessToken': "456",
                'createdAt': "2020-07-21T19:08:51.632Z",
                'current': true,
                'institutionId': "ins_1",
                'institutionName': "Chase",
                'itemId': "afliugwef",
                'updatedAt': "2020-07-21T19:08:51.632Z",
                'userId': "wefiuwef",
                '__v': 0,
                '_id': "wefliu2rp9t"
              }
            ],
          'currentAccount': 
            [
              {
                'accessToken': "123",
                'createdAt': "2020-07-21T19:08:51.632Z",
                'current': true,
                'institutionId': "ins_1",
                'institutionName': "Bank of America",
                'itemId': "fdouiwhefoh",
                'updatedAt': "2020-07-21T19:08:51.632Z",
                'userId': "fo32r78f",
                '__v': 0,
                '_id': "wfiug2f"
              }
            ],
          'ids': 
            [
              "wefliu2rp9t",
              "wfiug2f"
            ]
    };

    localStorage.setItem('User Accounts Details', JSON.stringify(store));
    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    

    // let store = {
    //   'User Accounts Details': "It worked"
    // };

    // let store = {};
    const mockLocalStorage = {
      getItem: (key: string): string => {
        return key in store ? store[key] : null;
        // return "yes" || "no";
      },
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      // clear: () => {
      //   store = {};
      // }
    };

    spyOn(localStorage, 'getItem')
    .and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem')
    .and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem')
    .and.callFake(mockLocalStorage.removeItem);
    // spyOn(localStorage, 'clear')
    // .and.callFake(mockLocalStorage.clear);

    
  });

  it('should create', () => {
    // expect(true).toBe(true);
    // localStorage.setItem('User Accounts Details', 'It works');
    // this.mockLocalStorage.setItem('User Accounts Details', 'It works');
    expect(component).toBeTruthy();
  });

  // describe('setAccessToken', () => {
  //   it('should store the token in localStorage',
  //     () => {
  //       service.setAccessToken('sometoken');
  //       expect(localStorage.getItem('id_token')).toEqual('sometoken');
  //   });
  // });
  // describe('getAccessToken', () => {
  //   it('should return stored token from localStorage',
  //     () => {
  //       localStorage.setItem('id_token', 'anothertoken');
  //       expect(service.getAccessToken()).toEqual('anothertoken');
  //   });
  // });
});
