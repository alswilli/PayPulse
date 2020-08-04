import { Injectable } from '@angular/core';

import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { ErrorComponent } from '../error/error.component';

@Injectable({
  providedIn: 'root'
})
export class ProcessHTTPMsgService {

  // public dialog: MatDialog
  constructor() { 
    // console.log("HERE: ", this.dialog)
  }

  public handleError(error: HttpErrorResponse | any) {
    let errMsg: string;
    console.log("Error was fired: ", error);

    if (error.error instanceof ErrorEvent) {
      errMsg = error.error.message;
    } else {
      if (error.error.message) {
        errMsg = `${error.status} - ${error.statusText || ''}: ${error.error.message}`;
      }
      else {
        errMsg = `${error.status} - ${error.statusText || ''}: ${error.message}`;
      }
    }
    // console.log("sdasasdHERE: ", this.dialog)
    // this.dialog.open(ErrorComponent, {data: {message: errMsg}});

    return throwError(errMsg);
  }
}
