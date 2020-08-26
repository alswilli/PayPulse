import { Component, OnInit, EventEmitter, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BudgetService } from 'src/app/services/budget.service';

@Component({
  selector: 'app-delete-budget',
  templateUrl: './delete-budget.component.html',
  styleUrls: ['./delete-budget.component.scss']
})
export class DeleteBudgetComponent implements OnInit {

  onDelete = new EventEmitter();
  isLoading = false;

  constructor(public dialogRef: MatDialogRef<DeleteBudgetComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private budgetService: BudgetService) {}

  ngOnInit() {
    console.log(this.data);
    this.isLoading = false;
  }

  onDeleteConfirmed(currBudgetId) {
    this.isLoading = true;
    this.budgetService.deleteBudget(currBudgetId).subscribe(res => {
      this.onDelete.emit(res);
    }, errmess => this.isLoading = false
    );
  }

}
