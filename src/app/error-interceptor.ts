import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpErrorResponse
  } from "@angular/common/http";
  import { catchError } from "rxjs/operators";
  import { throwError, of } from "rxjs";
  import { Injectable } from "@angular/core";
  import { MatDialog } from "@angular/material";
  import { ErrorComponent } from "./error/error.component";
//   import { ErrorService } from "./error/error.service";
  @Injectable()
  export class ErrorInterceptor implements HttpInterceptor {
    constructor(private dialog: MatDialog) {}
    intercept(req: HttpRequest<any>, next: HttpHandler) {
      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {
          console.log("ERROR: ", error)
          let errorMessage = "An unknown error occurred!";
          if (error.error.message) {
            errorMessage = error.error.message;
          }
          else if (error.error.error && error.error.error.error_message) {
            // Item Login error
            errorMessage = error.error.error.error_message;
            console.log("Item login error")
            // return null
            
          }
          else if (error.error.err && error.error.err.message) {
            errorMessage = error.error.err.message;
          }
          this.dialog.open(ErrorComponent, {data: {message: errorMessage}});
          // this.errorService.throwError(errorMessage);
          return throwError(error);
        })
      );
    }
  }