import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion, MatDialog } from '@angular/material';
import { AddBudgetComponent } from './add-budget/add-budget.component';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss']
})
export class BudgetsComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('addbudgetform') createAccountFormDirective;

  budgets: string[];

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.budgets = [];
  }

  onAddBudgetClicked() {
    const addBudgetRef = this.dialog.open(AddBudgetComponent, {data: {}});
    addBudgetRef.componentInstance.onAdd
      .subscribe(result => {
        console.log(result);
        this.budgets.push(result);
        // Close dialogue ref
        addBudgetRef.close();
      });
    }
  }
