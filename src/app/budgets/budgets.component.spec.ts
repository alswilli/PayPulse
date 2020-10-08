import { async, ComponentFixture, TestBed, fakeAsync, discardPeriodicTasks, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { BudgetsComponent } from './budgets.component';

import { BrowserModule, By } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ComponentRef } from '@angular/core';
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
import { FormsModule, FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NgxPlaidLinkModule } from 'ngx-plaid-link';
import { HttpClientModule } from '@angular/common/http';
import { MatExpansionModule, MatAccordion } from '@angular/material/expansion';

import { MatGridListModule } from '@angular/material/grid-list';;
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
import { Observable, of } from 'rxjs';
import { AddBudgetComponent } from './add-budget/add-budget.component';
import { DeleteBudgetComponent } from './delete-budget/delete-budget.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { componentFactoryName } from '@angular/compiler';
import { ADDEDBUDGETS } from '../shared/budgets';

// <<-- Create a MatDialog mock class -->>
export class MatDialogStub {
  // When the component calls this.dialog.open(...) we'll return an object
  // with an afterClosed method that allows to subscribe to the dialog result observable.
  open(data) {
    console.log("inside")
    console.log(data)
    return {
      onAdd: () => of(data)
    };
  }
}

describe('BudgetsComponent', () => {
  let component: BudgetsComponent;
  let fixture: ComponentFixture<BudgetsComponent>;

  // let overlayContainerElement: HTMLElement;

  // let testViewContainerRef: ViewContainerRef;
  // let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;
  let childComponent: AddBudgetComponent;
  let childFixture: ComponentFixture<AddBudgetComponent>

  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BudgetsComponent,
        PieChartComponent,
        AddBudgetComponent,
        DeleteBudgetComponent ],
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
        // { provide: MatDialog, useClass: MatDialogStub },
        { provide: 'baseURL', useValue: baseURL },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: FormBuilder, useValue: formBuilder },
        MatAccordion,
        MatSelect,
        MatDialog
      ],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ AddBudgetComponent ],
      }
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
    childFixture = TestBed.createComponent(AddBudgetComponent);
    childComponent = childFixture.componentInstance;
    childFixture.autoDetectChanges();
    fixture = TestBed.createComponent(BudgetsComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();

    childComponent.addBudgetForm = formBuilder.group({
        category: "Food and Drink",
        category2: "Restaurant",
        category23: null,
        amount: "67"
    });

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

  // it('should open the AddBudgetsComponent with correct data in a MatDialog', fakeAsync(() => {
  //   // fixture.whenStable().then(() => {
    
  //   // })
  //   // var categories = {
  //   //   'Food and Drink' : {
  //   //     'Restaurant' : {
  //   //       'Fast Food' : {},
  //   //       'American' : {}
  //   //     },
  //   //     'Nightlife' : {}
  //   //   }
  //   // }
  //   // console.log(categories)
  //   // var budgets = []
  //   // console.log(budgets);
    
  //   spyOn(component.dialog,'open').and.callThrough();
  //   component.onAddBudgetClicked();
  //   expect(component.dialog.open).toHaveBeenCalledWith(AddBudgetComponent, {
  //     data: {
  //       categories: component.categories,
  //       budgets: component.budgets,
  //       edit: false
  //     }
  //   });
  // }));

  it('should open the AddBudgetsComponent, add a new budget, and close', fakeAsync((done) => {
    spyOn(component.dialog,'open').and.callThrough();
    component.onAddBudgetClicked();
    expect(component.dialog.open).toHaveBeenCalledWith(AddBudgetComponent, {
      data: {
        categories: component.categories,
        budgets: component.budgets,
        edit: false
      }
    });

    

    spyOn(childComponent.onAdd,'emit').and.callThrough();
    // childComponent.onFormConfirmed();
    var addButton = childFixture.debugElement.nativeElement.querySelector('#addbutton');
    // console.log(addButton)
    // addButton.disabled = false;
    // console.log(addButton)
    // addButton.click();
    addButton.dispatchEvent(new Event('click'));
    tick(5);
    expect(childComponent.onAdd.emit).toHaveBeenCalledWith( ADDEDBUDGETS );

    fixture.detectChanges();
    childFixture.detectChanges();

    

    component.addBudgetRef.componentInstance.onAdd.emit( ADDEDBUDGETS );

    discardPeriodicTasks()

    // component.addBudgetRef.componentInstance.onAdd.subscribe(res => {
    //   console.log("RES: ", res)
    //   expect(true).toEqual(false);
    //   done();
    // })
    // childComponent.onAdd.subscribe(res => {
    //   expect(true).toEqual(false);
    //   expect(res).toEqual(2);
    // })

    // spyOn(component.addBudgetRef.componentInstance.onAdd,'emit').and.callThrough();
    // component.addBudgetRef.componentInstance.onFormConfirmed();
    // expect(component.addBudgetRef.componentInstance.onAdd.emit).toHaveBeenCalled();
    
    // expect(component.budgets.length).toEqual(3)
    // component.addBudgetRef.close()
  }));

  // it('should open add dialog component', () => {
  //   component.onAddBudgetClicked();
  // });

  // it('should open add dialog when add button clicked', () => {
  //   const addButton = document.querySelector('#addButton');
   
  //   addButton.click();
  //   fixture.detectChanges();
   
  //   fixture.whenStable().then(() => {
  //     const dialogDiv = document.querySelector('mat-dialog-container');
  //     expect(dialogDiv).toBeTruthy();
  //   });
  // });

  // it('should open the AddBudgetsComponent, add a new budget, and close 2', () => 
  //   // let abc = new AddBudgetComponent();
  //   // spyOn(component.dialog, 'open')
  //   //  .and
  //   //  .returnValue({onAdd: () => of( ADDEDBUDGETS )});
  // });
});
