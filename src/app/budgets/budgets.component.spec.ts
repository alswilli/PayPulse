import { async, ComponentFixture, TestBed, fakeAsync, discardPeriodicTasks, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { BudgetsComponent } from './budgets.component';

import { BrowserModule, By } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ComponentRef, ɵConsole } from '@angular/core';
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
import { moveBindingIndexToReservedSlot } from '@angular/core/src/render3/instructions';
import { Budget } from '../shared/budget';

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
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ AddBudgetComponent,
        DeleteBudgetComponent ],
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

    // childComponent.addBudgetForm = formBuilder.group({
    //     category: "Food and Drink",
    //     category2: "Restaurant",
    //     category23: null,
    //     amount: "67"
    // });

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

  /*####### ADDING BUDGETS #######*/ 

  it('should open the AddBudgetsComponent in a MatDialog with correct data ater pressing Add New Budget button', fakeAsync(() => {
    spyOn(component.dialog,'open').and.callThrough();

    var addNewButton = fixture.debugElement.nativeElement.querySelector('#addButton');
    addNewButton.dispatchEvent(new Event('click'));

    // component.onAddBudgetClicked();
    expect(component.dialog.open).toHaveBeenCalledWith(AddBudgetComponent, {
      data: {
        categories: component.categories,
        budgets: component.budgets,
        edit: false
      }
    });
    tick(5)
    discardPeriodicTasks()
    component.addBudgetRef.close();
    discardPeriodicTasks()
  }));

  // // it('should add a new budget and submit on MatDialog', fakeAsync((done) => {
  // //   spyOn(component.dialog,'open').and.callThrough();

  // //   var addNewButton = fixture.debugElement.nativeElement.querySelector('#addButton');
  // //   addNewButton.dispatchEvent(new Event('click'));

  // //   // component.onAddBudgetClicked();
  // //   expect(component.dialog.open).toHaveBeenCalledWith(AddBudgetComponent, {
  // //     data: {
  // //       categories: component.categories,
  // //       budgets: component.budgets,
  // //       edit: false
  // //     }
  // //   });

  // //   childComponent.addBudgetForm.value.category = "Food and Drink";
  // //   childComponent.addBudgetForm.value.category2 = "Restaurants";
  // //   childComponent.addBudgetForm.value.category3 = "";
  // //   childComponent.addBudgetForm.value.amount = "350";

  // //   var currBudget: Budget = {
  // //     _id : "",
  // //     userId : "",
  // //     mainCategory : "Restaurants",
  // //     category : childComponent.addBudgetForm.value.category,
  // //     category2 : childComponent.addBudgetForm.value.category2,
  // //     category3 : "",
  // //     amount : childComponent.addBudgetForm.value.amount,
  // //     total : 0
  // //   }

  // //   spyOn(childComponent.onAdd,'emit').and.callThrough();
  // //   // childComponent.onFormConfirmed();
  // //   var addButton = childFixture.debugElement.nativeElement.querySelector('#addbutton');
  // //   addButton.dispatchEvent(new Event('click'));
  // //   tick(5);
  // //   // expect(childComponent.onAdd.emit).toHaveBeenCalledWith( ADDEDBUDGETS );
  // //   expect(childComponent.onAdd.emit).toHaveBeenCalledWith(currBudget);
  // //   // expect(childComponent.onAdd.emit).toHaveBeenCalled();

  // //   fixture.detectChanges();
  // //   childFixture.detectChanges();

  // //   discardPeriodicTasks()

  // //   component.addBudgetRef.close()
  // // }));

  it('should add new budget to budget list', () => {
    expect(component.budgets.length).toEqual(2);

    var currBudget: Budget = {
      _id : "",
      userId : "",
      mainCategory : "Restaurants",
      category : "Food and Drink",
      category2 : "Restaurants",
      category3 : "",
      amount : "350",
      total : 0
    }

    var addNewButton = fixture.debugElement.nativeElement.querySelector('#addButton');
    addNewButton.dispatchEvent(new Event('click'));

    // component.onAddBudgetClicked();
    // component.addBudgetRef.componentInstance.onAdd.emit( ADDEDBUDGETS );
    component.addBudgetRef.componentInstance.onAdd.emit(currBudget);
    expect(component.budgets.length).toEqual(3);
    // expect(component.budgets[component.budgets.length-1]).toEqual(ADDEDBUDGETS);
    expect(component.budgets[component.budgets.length-1]).toEqual(currBudget);
  })

  // /*####### EDITING BUDGETS #######*/ 

  it('should open the AddBudgetsComponent in a MatDialog with correct data after pressing Edit Budget button', fakeAsync(() => {
    spyOn(component.dialog,'open').and.callThrough();

    // var budgetList = fixture.debugElement.nativeElement.querySelector('.budgetList');
    // console.log(budgetList)

    var editButton1 = fixture.debugElement.nativeElement.querySelector('#editButton1');
    console.log(editButton1)
    editButton1.dispatchEvent(new Event('click'));

    var currBudget = component.budgets[1];

    expect(component.dialog.open).toHaveBeenCalledWith(AddBudgetComponent, {
      data: {
        categories: component.categories,
        budgets: component.budgets,
        edit: true,
        budget: currBudget
      }
    });
    // tick(5)
    // discardPeriodicTasks()
    component.editBudgetRef.close();
    // discardPeriodicTasks()
  }));

  // // it('should edit budget and submit on MatDialog', async(() => {
  // //   console.log('should edit budget and submit on MatDialog')
  // //   spyOn(component.dialog,'open').and.callThrough();
  // //   var editButton1 = fixture.debugElement.nativeElement.querySelector('#editButton1');
  // //   console.log(editButton1)
  // //   editButton1.dispatchEvent(new Event('click'));
  // //   // editButton1.click()
  // //   var currBudget = component.budgets[1];

  // //   expect(component.dialog.open).toHaveBeenCalledWith(AddBudgetComponent, {
  // //     data: {
  // //       categories: component.categories,
  // //       budgets: component.budgets,
  // //       edit: true,
  // //       budget: currBudget
  // //     }
  // //   });

  // //   // component.onEditBudgetClicked(currBudget);
  // //   console.log(component.dialog.afterOpen)
  // //   childFixture.whenStable().then(() => {
  // //     childFixture.detectChanges();
  // //     console.log(childComponent.edit)
  // //   })

  // //   //   console.log("DONE");
  // //   //   console.log(childComponent);

  // //   //   // fixture.detectChanges();
  // //   // // childFixture.detectChanges();
  // //   // // tick()
  // //   // // fixture.detectChanges();
  // //   // // childFixture.detectChanges();
  // //   // // childComponent.ngOnInit();
  // //   // // tick()
  // //   // // fixture.detectChanges();
  // //   // // childFixture.detectChanges();

  // //   // console.log(childComponent);

  // //   // childComponent.addBudgetForm.value.category = "Food and Drink";
  // //   // childComponent.addBudgetForm.value.category2 = "Restaurants";
  // //   // childComponent.addBudgetForm.value.category3 = "Fast Food";
  // //   // childComponent.addBudgetForm.value.amount = "200";

  // //   // // childComponent.addBudgetForm.setValue({
  // //   // //   category: this.addBudgetForm.value.category, 
  // //   // //   category2: this.addBudgetForm.value.category2, 
  // //   // //   category3: this.addBudgetForm.value.category3, 
  // //   // //   amount: this.addBudgetForm.value.amount});


  // //   // console.log(childComponent);
  // //   // var currBudget: Budget = {
  // //   //   _id : "",
  // //   //   userId : "",
  // //   //   mainCategory : "Fast Food",
  // //   //   category : childComponent.addBudgetForm.value.category,
  // //   //   category2 : childComponent.addBudgetForm.value.category2,
  // //   //   category3 : childComponent.addBudgetForm.value.category3,
  // //   //   amount : childComponent.addBudgetForm.value.amount,
  // //   //   total : 0
  // //   // };

  // //   // console.log("Curr Budget: ", currBudget);

  // //   // spyOn(childComponent.onEdit,'emit').and.callThrough();
    
  // //   // var addButton = childFixture.debugElement.nativeElement.querySelector('#addbutton');
  // //   // console.log("Add button: ", addButton);

  // //   // // var editButton = childFixture.debugElement.nativeElement.querySelector('#editbutton');
  // //   // // console.log("Edit button: ", editButton)

  // //   // // childComponent.firstOpSelected("Food and Drink")

  // //   // // spyOn(childComponent.onEdit,'emit').and.callThrough();
  // //   // // childComponent.onFormConfirmed();
    
  // //   // console.log("Edit in test: ", childComponent.edit)
  // //   // addButton.dispatchEvent(new Event('click'));
    
  // //   // expect(childComponent.onEdit.emit).toHaveBeenCalledWith(currBudget);
  // //   // // // expect(childComponent.onAdd.emit).toHaveBeenCalled();

  // //   // fixture.detectChanges();
  // //   // childFixture.detectChanges();

  // //   // // discardPeriodicTasks()

  // //   // // component.editBudgetRef.close()
  // //   // })
    

    
  // // }));

  it('should edit budget in budget list', () => {
    console.log('should edit new budget to budget list')
    var currBudget: Budget = {
      _id : "p08ygiugrg",
      userId : "sdfsf",
      mainCategory : "Shops",
      category : "Shops",
      category2 : "",
      category3 : "",
      amount : "500",
      total : 0
    }
    expect(component.budgets.length).toEqual(3);
    expect(component.budgets[1]).toEqual(currBudget);

    var editButton1 = fixture.debugElement.nativeElement.querySelector('#editButton1');
    console.log(editButton1)
    editButton1.dispatchEvent(new Event('click'));

    var nextBudget: Budget = {
      _id : "p08ygiugrg",
      userId : "sdfsf",
      mainCategory : "Fast Food",
      category : "Food and Drink",
      category2 : "Restaurants",
      category3 : "Fast Food",
      amount : "200",
      total : 0
    }
  
    component.editBudgetRef.componentInstance.onEdit.emit(nextBudget);
    expect(component.budgets.length).toEqual(3);
    expect(component.budgets[1]).toEqual(nextBudget);
  })

  // /*####### DELETING BUDGETS #######*/ 

  it('should open the DeleteBudgetsComponent in a MatDialog with correct data after pressing Delete Budget button', fakeAsync(() => {
    spyOn(component.dialog,'open').and.callThrough();

    // var budgetList = fixture.debugElement.nativeElement.querySelector('.budgetList');
    // console.log(budgetList)

    var deleteButton1 = fixture.debugElement.nativeElement.querySelector('#deleteButton1');
    console.log(deleteButton1)
    deleteButton1.dispatchEvent(new Event('click'));

    var currBudget = component.budgets[1];

    expect(component.dialog.open).toHaveBeenCalledWith(DeleteBudgetComponent, {
      data: {
        budget: currBudget
      }
    });
    // tick(5)
    // discardPeriodicTasks()
    component.deleteBudgetRef.close();
    // discardPeriodicTasks()
  }));

  it('should delete budget in budget list', () => {
    console.log('should delete budget in budget list')
    var currBudget: Budget = {
      _id : "p08ygiugrg",
      userId : "sdfsf",
      mainCategory : "Fast Food",
      category : "Food and Drink",
      category2 : "Restaurants",
      category3 : "Fast Food",
      amount : "200",
      total : 50
    }
    expect(component.budgets.length).toEqual(3);
    expect(component.budgets[1]).toEqual(currBudget);

    var deleteButton1 = fixture.debugElement.nativeElement.querySelector('#deleteButton1');
    console.log(deleteButton1)
    deleteButton1.dispatchEvent(new Event('click'));
  
    component.deleteBudgetRef.componentInstance.onDelete.emit(currBudget);
    expect(component.budgets.length).toEqual(2);
  })

  // /*####### RESET GRAPH #######*/ 

  it("should delete all existing budgets", () => {
    expect(component.budgets.length).toEqual(2);
    var count = component.budgets.length - 1;
    var list = fixture.debugElement.nativeElement.querySelector('.budgetList');
    console.log(list)
    while (count >= 0) {
      var currBudget = component.budgets[count];
      console.log(currBudget)

      component.onDeleteBudgetClicked(currBudget)
    
      component.deleteBudgetRef.componentInstance.onDelete.emit(currBudget);
      count = count - 1;
    }
    expect(component.budgets.length).toEqual(0);
  })

  // /*####### GRAPH TESTS #######*/

  // // Adding
  // it('when total = 0, should not add to pie graph and should add to list', () => {

  // })
  // it('when total > 0, and parent budget not present on graph, should add to graph and list', () => {

  // })
  // it('when total > 0, parent budget present on graph, and existing same category budgets are on same category level (highest), should update graph total and add to list', () => {

  // })
  // it('when total > 0, parent budget present on graph, and existing same category budgets are not on the same category level (highest), and existing graph total < new total, should overwrite graph total and add to list ', () => {
    
  // })



  // // Editing
  // // A - D (deletions)
  // it("when new budget category is new, and old category still in list, and current graph total for old category != total for old category, and total for old category > 0, should overwrite old category on graph total and update list accordingly", () => {

  // })

  // it("when new budget category is new, and old category still in list, and current graph total for old category != total for old category, and total for old category = 0, should delete old category from graph and update list accordingly", () => {

  // })

  // it("when new budget category is new, and old category still in list, and current graph total for old category = total for old category, should not update old category on graph and update list accordingly", () => {

  // })

  // it("when new budget category is new, and old category not still in list, should delete old category from graph and update list accordingly", () => {

  // })
  // // E - G (additions)
  // it("when new budget category is new, and handled deletions, and parent budget for new category already present on graph, and graph total for new category < total for budgets on highest level in new category (same category as new budget), should overwrite graph total and update list accordingly", () => {

  // })
  // it("when new budget category is new, and handled deletions, and parent budget for new category already present on graph, and graph total for new category >= total for budgets on highest level in new category (same category as new budget), should not update graph total and update list accordingly", () => {

  // })
  // it("when new budget category is new, and handled deletions, and parent budget for new category not already present on graph, and new budget total > 0, should add budget to graph and update list accordingly", () => {
    
  // })
  // it("when new budget category is new, and handled deletions, and parent budget for new category not already present on graph, and new budget total = 0, should not add budget to graph and update list accordingly", () => {
    
  // })
  // // H - J (not a new category)
  // it("when new budget category is not new, and category was previously present on graph, and total on graph != total from highest budgets, and total from highest budgets > 0, should overwrite graph total and update list accordingly", () => {

  // })
  // // I don't think this can ever happen
  // // it("when new budget category is not new, and category was previously present on graph, and total on graph != total from highest budgets, and total from highest budgets = 0, should remove category from graph and update list accordingly", () => {
    
  // // })
  // it("when new budget category is not new, and category was not present on graph, and result total > 0, should add to graph and update list accordingly", () => {

  // })
  // it("when new budget category is not new, and category was not present on graph, and result total = 0, should not add to graph and update list accordingly", () => {
    
  // })



  // // Deleting
  // it("when deleted budget category has no budgets left, should delete category from graph and list", () => {

  // })
  // // Could probably rework code so this test isn't needed, same wth adding
  // it("when deleted budget category has budgets left, and those budgets are on the same level as deleted budget, and remaining total > 0, should update category total on graph and delete from list", () => {

  // })
  // it("when deleted budget category has budgets left, and those budgets are on the same level as deleted budget, and remaining total = 0, should delete category from graph and list", () => {

  // })
  // it("when deleted budget category has budgets left, and those budgets are not on the same level as deleted budget, and category total on graph != remaining total for category from list, and remaining total > 0, should overwrite graph total and delete from list", () => {

  // })
  // it("when deleted budget category has budgets left, and those budgets are not on the same level as deleted budget, and category total on graph != remaining total for category from list, and remaining total = 0, should delete category from graph and list", () => {

  // })
});





