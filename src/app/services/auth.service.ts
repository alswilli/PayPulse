import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { baseURL } from '../shared/baseurl';
import { ProcessHTTPMsgService } from './process-httpmsg.service';

interface AuthResponse {
  status: string;
  success: string;
  token: string;
}

interface JWTResponse {
  status: string;
  success: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  tokenKey = 'JWT';
  isAuthenticated: Boolean = false;
  email: Subject<string> = new Subject<string>();
  authToken: string = undefined;

   constructor(private http: HttpClient,
     private processHTTPMsgService: ProcessHTTPMsgService) {
   }

   checkJWTtoken() {
     this.http.get<JWTResponse>(baseURL + 'users/checkJWTtoken')
     .subscribe(res => {
       console.log('JWT Token Valid: ', res);
       this.sendEmail(res.user.email);
     },
     err => {
       console.log('JWT Token invalid: ', err);
       this.destroyUserCredentials();
     });
   }

   sendEmail(name: string) {
     this.email.next(name);
   }

   clearEmail() {
     this.email.next(undefined);
   }

   loadUserCredentials() {
     const credentials = JSON.parse(localStorage.getItem(this.tokenKey));
     console.log('loadUserCredentials ', credentials);
     if (credentials && credentials.email !== undefined) {
       this.useCredentials(credentials);
       if (this.authToken) {
        this.checkJWTtoken();
       }
     }
   }

   storeUserCredentials(credentials: any) {
     console.log('storeUserCredentials ', credentials);
     localStorage.setItem(this.tokenKey, JSON.stringify(credentials));
     this.useCredentials(credentials);
   }

   useCredentials(credentials: any) {
     this.isAuthenticated = true;
     this.sendEmail(credentials.email);
     this.authToken = credentials.token;
   }

   destroyUserCredentials() {
     this.authToken = undefined;
     this.clearEmail();
     this.isAuthenticated = false;
     localStorage.removeItem(this.tokenKey);
   }

   signUp() {

   }

   logIn(user: any): Observable<any> {
     return this.http.post<AuthResponse>(baseURL + 'users/login',
       {'email': user.email, 'password': user.password})
       .pipe( map(res => {
           this.storeUserCredentials({email: user.email, token: res.token});
           return {'success': true, 'email': user.email };
       }),
        catchError(error => this.processHTTPMsgService.handleError(error)));
   }

   logOut() {
     this.destroyUserCredentials();
   }

   isLoggedIn(): Boolean {
     return this.isAuthenticated;
   }

   getEmail(): Observable<string> {
     return this.email.asObservable();
   }

   getToken(): string {
     return this.authToken;
   }
}
