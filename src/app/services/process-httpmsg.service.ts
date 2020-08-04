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
    console.log("Error was firedadad: ", error);

    if (error.error instanceof ErrorEvent) {
      errMsg = error.error.message;
    } else {
      errMsg = `${error.status} - ${error.statusText || ''} ${error.message}`;
    }
    console.log("Error was firedd: ", errMsg);

    return throwError(errMsg);
  }
}
