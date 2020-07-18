import { Routes } from '@angular/router';
import { AuthGuardService as AuthGuard } from '../services/auth-guard.service';
import { LoginComponent } from '../login/login.component';
import { HomeComponent } from '../home/home.component';
import { TransactionsComponent } from '../transactions/transactions.component';
import { BudgetsComponent } from '../budgets/budgets.component';
import { GoalsComponent } from '../goals/goals.component';
import { SharingComponent } from '../sharing/sharing.component';
import { AdviceComponent } from '../advice/advice.component';
import { CreateAccountComponent } from '../create-account/create-account.component';
import { LinkAccountComponent } from '../link-account/link-account.component';

export const routes: Routes = [
  { path: 'login',  component: LoginComponent },
  { path: 'home',  component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'transactions',  component: TransactionsComponent, canActivate: [AuthGuard] },
  { path: 'budgets',  component: BudgetsComponent, canActivate: [AuthGuard] },
  { path: 'goals', component: GoalsComponent, canActivate: [AuthGuard] },
  { path: 'sharing',  component: SharingComponent, canActivate: [AuthGuard] },
  { path: 'advice',  component: AdviceComponent, canActivate: [AuthGuard] },
  { path: 'linkAccount',  component: LinkAccountComponent },
  { path: 'createAccount',  component: CreateAccountComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];