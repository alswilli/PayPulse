import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { BudgetsComponent } from './budgets.component';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import { AppRoutingModule } from './app-routing/app-routing.module';
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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NgxPlaidLinkModule } from 'ngx-plaid-link';
import { HttpClientModule } from '@angular/common/http';
import { MatExpansionModule, MatAccordion } from '@angular/material/expansion';

import { MatGridListModule } from '@angular/material/grid-list';;
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { AccountService } from '../services/account.service';
import { AccountServiceStub } from '../mock-services/account.service.mock';
import { baseURL } from '../shared/baseurl';
import { BudgetService } from '../services/budget.service';
import { BudgetServiceStub } from '../mock-services/budget.service.mock';

describe('BudgetsComponent', () => {
  let component: BudgetsComponent;
  let fixture: ComponentFixture<BudgetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BudgetsComponent,
        PieChartComponent ],
      imports: [BrowserModule,
        // AppRoutingModule,
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
        RouterTestingModule.withRoutes([{ path: 'budgets', component: BudgetsComponent }]) ],
      providers: [
        { provide: AccountService, useClass: AccountServiceStub },
        { provide: BudgetService, useClass: BudgetServiceStub },
        { provide: 'baseURL', useValue: baseURL },
        MatAccordion,
        MatSelect
      ]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(BudgetsComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  beforeEach(() => {
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
    fixture = TestBed.createComponent(BudgetsComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();

    const mockLocalStorage = {
      getItem: (key: string): string => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    };

    spyOn(localStorage, 'getItem')
    .and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem')
    .and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem')
    .and.callFake(mockLocalStorage.removeItem);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
