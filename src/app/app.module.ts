import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppRoutingModule } from './app-routing/app-routing.module';
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

import { MatGridListModule } from '@angular/material/grid-list';;
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { BudgetsComponent } from './budgets/budgets.component';
import { GoalsComponent } from './goals/goals.component';
import { SharingComponent } from './sharing/sharing.component';
import { AdviceComponent } from './advice/advice.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LinkAccountComponent } from './link-account/link-account.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { DeleteAccountComponent } from './delete-account/delete-account.component';
import { ErrorComponent } from './error/error.component';

import { SidebarService } from './services/sidebar.service';
import { AuthService } from './services/auth.service';
import { ProcessHTTPMsgService } from './services/process-httpmsg.service';

import 'hammerjs';

import { AuthInterceptor, UnauthorizedInterceptor } from './services/auth.interceptor';
import { AuthGuardService } from './services/auth-guard.service';

import { baseURL } from './shared/baseurl';
import {HTTP_INTERCEPTORS} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TransactionsComponent,
    BudgetsComponent,
    GoalsComponent,
    SharingComponent,
    AdviceComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    CreateAccountComponent,
    LinkAccountComponent,
    DeleteAccountComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
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
    MatDialogModule
  ],
  // exports: [
  //   MatFormFieldModule,
  //   MatInputModule
  // ],
  providers: [
    SidebarService,
    AuthService,
    ProcessHTTPMsgService,
    AuthGuardService,
    {provide: 'baseURL', useValue: baseURL},
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UnauthorizedInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    DeleteAccountComponent,
    ErrorComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class AppModule { }
