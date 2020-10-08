import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AddBudgetComponent } from './add-budget.component';
import { BudgetsComponent } from '../budgets.component';

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
// import { PieChartComponent } from './pie-chart/pie-chart.component';
// import { AccountService } from '../services/account.service';
// import { AccountServiceStub } from '../mock-services/account.service.mock';
// import { baseURL } from '../shared/baseurl';
// import { BudgetService } from '../services/budget.service';
// import { BudgetServiceStub } from '../mock-services/budget.service.mock';
import { Observable, of } from 'rxjs';
import { PieChartComponent } from '../pie-chart/pie-chart.component';
// import { DeleteBudgetComponent } from './delete-budget/delete-budget.component';

describe('AddBudgetComponent', () => {
  let component: AddBudgetComponent;
  let fixture: ComponentFixture<AddBudgetComponent>;

  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBudgetComponent,
      BudgetsComponent,
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
          { provide: MAT_DIALOG_DATA, useValue: {} },
          { provide: MatDialogRef, useValue: {} },
          { provide: FormBuilder, useValue: formBuilder }
       ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBudgetComponent);
    component = fixture.componentInstance;
    component.addBudgetForm = formBuilder.group({
        category: null,
        category2: null,
        category23: null,
        amount: null
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
