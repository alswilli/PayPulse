import { Injectable } from '@angular/core';

import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProcessHTTPMsgService {

  constructor() { }

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

    return throwError(errMsg);
  }
}
