import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {AccountService} from '../services/account.service';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.scss']
})
export class DeleteAccountComponent implements OnInit {

  onDelete = new EventEmitter();
  errMess: string;
  isLoading = false;

  constructor(public dialogRef: MatDialogRef<DeleteAccountComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private accountService: AccountService) {}

  ngOnInit() {
    console.log(this.data);
    this.isLoading = false;
  }

  onDeleteConfirmed(accountName) {
    console.log(accountName);
    // this.isLoading = true;
    var deleteId;
    for (let account of this.data.userAccountsDetails.accounts) {
      console.log(account)
      if (account.institutionName === accountName) {
        deleteId = account._id;
        break;
      } 
    }
    console.log("Delete Id: ", deleteId);
    this.accountService.deleteAccount(deleteId)
      .subscribe(res => {
        this.isLoading = true;
        this.onDelete.emit(res);
        // this.dialogRef.close(res)
      },
      error => {
        console.log(error);
        this.errMess = error;
      });
  }

}
