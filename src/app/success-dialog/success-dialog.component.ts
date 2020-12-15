import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-success-dialog',
  templateUrl: './success-dialog.component.html',
  styleUrls: ['./success-dialog.component.scss']
})
export class SuccessDialogComponent implements OnInit {
  
  isLoading: boolean;
  onClose = new EventEmitter();

  constructor (
    public dialogRef: MatDialogRef<SuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
    ) { }

  ngOnInit() {
    this.isLoading = true;
    this.isLoading = false;
  }

  closeDialog() {
    this.onClose.emit();
  }

}
