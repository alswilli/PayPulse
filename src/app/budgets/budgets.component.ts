import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss']
})
export class BudgetsComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;

  tests: string[];

  constructor() { }

  ngOnInit() {
    this.tests = ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1",
                  "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"]
  }

}
