import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-token-expired',
  templateUrl: './token-expired.component.html',
  styleUrls: ['./token-expired.component.scss']
})
export class TokenExpiredComponent implements OnInit {

  isLoading = false;
  seconds: number;
  currSeconds: number;
  onLogout = new EventEmitter();
  onStayLoggedIn = new EventEmitter();
  timerId: any;
  timeout: any;

  constructor(public dialogRef: MatDialogRef<TokenExpiredComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    ) { }

  ngOnInit() {
    console.log(this.data);
    this.isLoading = false;
    this.seconds = Math.floor(this.data.tokenTimer);
    this.currSeconds = this.seconds - 1;
    this.timerId = setInterval(() => {
      // console.log("tick")
      this.currSeconds = this.currSeconds - 1;
    }, 1000);
    
    this.timeout = setTimeout(() => { 
      clearInterval(this.timerId); 
      console.log('stop'); 
    }, this.seconds * 1000);
  }

  logout() {
    console.log("Log out!")
    clearInterval(this.timerId)
    clearTimeout(this.timeout);
    this.isLoading = true;
    this.onLogout.emit();
  }

  stayLoggedIn() {
    console.log("Stay logged in!")
    clearInterval(this.timerId)
    clearTimeout(this.timeout);
    this.isLoading = true;
    this.onStayLoggedIn.emit();
  }

}
