import { Routes } from '@angular/router';
import { AuthGuardService as AuthGuard } from '../services/auth-guard.service';
import { LoginComponent } from '../login/login.component';
import { HomeComponent } from '../home/home.component';
import { TransactionsComponent } from '../transactions/transactions.component';
import { BudgetsComponent } from '../budgets/budgets.component';
import { GoalsComponent } from '../goals/goals.component';
import { SharingComponent } from '../sharing/sharing.component';
import { AdviceComponent } from '../advice/advice.component';

export const routes: Routes = [
  { path: 'login',  component: LoginComponent },
  { path: 'home',  component: HomeComponent },
  { path: 'transactions',  component: TransactionsComponent },
  { path: 'budgets',  component: BudgetsComponent },
  { path: 'goals', component: GoalsComponent},
  { path: 'sharing',  component: SharingComponent },
  { path: 'advice',  component: AdviceComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];