import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
// import {MatPaginatorHarness} from '@angular/material/paginator/testing';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatTableModule } from '@angular/material/table';
// import { MatPaginatorModule } from '@angular/material/paginator';
// import { MatSortModule } from '@angular/material/sort';
// import { HttpClientModule } from '@angular/common/http';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppRoutingModule } from '../app-routing/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar'; 
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NgxPlaidLinkModule } from 'ngx-plaid-link';
import { HttpClientModule } from '@angular/common/http';
import { MatExpansionModule } from '@angular/material/expansion';

import { MatGridListModule } from '@angular/material/grid-list';;
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';

import { AppComponent } from '../app.component';
import { LoginComponent } from '../login/login.component';
import { TransactionsComponent } from '../transactions/transactions.component';
import { BudgetsComponent } from '../budgets/budgets.component';
import { GoalsComponent } from '../goals/goals.component';
import { SharingComponent } from '../sharing/sharing.component';
import { AdviceComponent } from '../advice/advice.component';

import { HomeComponent } from '../home/home.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { LinkAccountComponent } from '../link-account/link-account.component';
import { CreateAccountComponent } from '../create-account/create-account.component';
import { DeleteAccountComponent } from '../delete-account/delete-account.component';
import { ErrorComponent } from '../error/error.component';

import { SidebarService } from '../services/sidebar.service';
import { AuthService } from '../services/auth.service';
import { ProcessHTTPMsgService } from '../services/process-httpmsg.service';

import 'hammerjs';

import { AuthInterceptor, UnauthorizedInterceptor } from '../services/auth.interceptor';
import { AuthGuardService } from '../services/auth-guard.service';

import { baseURL } from '../shared/baseurl';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import { ErrorInterceptor } from '../error-interceptor';
import { PieChartComponent } from '../budgets/pie-chart/pie-chart.component';
import { AddBudgetComponent } from '../budgets/add-budget/add-budget.component';
import { DeleteBudgetComponent } from '../budgets/delete-budget/delete-budget.component';


import {AccountServiceStub} from '../mock-services/account.service.mock';
import {AccountService} from '../services/account.service';
import {Account} from '../shared/account';
// import { baseURL } from '../shared/baseurl';
import { Observable, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

// import { TransactionsComponent } from './transactions.component';

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
        MatToolbarModule,
        FlexLayoutModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        MatProgressSpinnerModule,
        NgxPlaidLinkModule,
        MatSelectModule,
        MatDialogModule,
        MatExpansionModule,
        RouterTestingModule.withRoutes([{ path: 'transactions', component: TransactionsComponent }])  
      ],
      declarations: [ TransactionsComponent ],

      providers: [
        { provide: AccountService, useClass: AccountServiceStub },
        { provide: 'baseURL', useValue: baseURL },
        MatPaginator,
        MatSort
      ]
    })
    .compileComponents();
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
                'subAccounts': [
                  {
                    'account_id': "8wefiwef",
                    'balances': {
                      'available': 100,
                      'current': 110
                    },
                    'name': "Checking"
                  }
                ],
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
                'subAccounts': [
                  {
                    'account_id': "wdvkef",
                    'balances': {
                      'available': 200,
                      'current': 210
                    },
                    'name': "Savings"
                  }
                ],
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
                'subAccounts': [
                  {
                    'account_id': "8wefiwef",
                    'balances': {
                      'available': 100,
                      'current': 110
                    },
                    'name': "Checking"
                  }
                ],
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
    // component.ngOnInit();
    fixture.autoDetectChanges();

    console.log("Pag?? ", component.paginator)
    

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

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(TransactionsComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  it('should create', () => {
    // expect(true).toBe(true);
    // localStorage.setItem('User Accounts Details', 'It works');
    // this.mockLocalStorage.setItem('User Accounts Details', 'It works');
    expect(component).toBeTruthy();
  });

  it('should populate datasource', () => {
    expect(component.dataSource).not.toBeNull();
})

  // Correct text rendered
});
