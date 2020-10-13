import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { timer } from 'rxjs';

import { baseURL } from '../shared/baseurl';
import { ProcessHTTPMsgService } from './process-httpmsg.service';
import { Router } from '@angular/router';

interface AuthResponse {
  status: string;
  success: string;
  token: string;
  exp: number;
}

interface FbAuthResponse {
  status: string;
  success: string;
  token: string;
  username: string;
  exp: number;
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
  accountsKey = 'User Accounts Details';
  isAuthenticated: Boolean = false;
  username: Subject<string> = new Subject<string>();
  tokenTimer: Subject<number> = new Subject<number>();
  // tokenTimer: any;
  nodeTimer: NodeJS.Timer;
  timeLeft: number = 30;
  authToken: string = undefined;

   constructor(private http: HttpClient,
     private processHTTPMsgService: ProcessHTTPMsgService,
     private router: Router) {
   }

   checkJWTtoken() {
     this.http.get<JWTResponse>(baseURL + 'users/checkJWTtoken')
     .subscribe(res => {
       console.log('JWT Token Valid: ', res);
       this.sendUsername(res.user.username);
     },
     err => {
       console.log('JWT Token invalid: ', err);
       this.destroyUserCredentials();
     });
   }

   sendUsername(name: string) {
     this.username.next(name);
   }

   clearUsername() {
     this.username.next(undefined);
   }

   loadUserCredentials() {
     const credentials = JSON.parse(localStorage.getItem(this.tokenKey));
     const expiration = new Date(localStorage.getItem('expiration'))
     console.log('loadUserCredentials ', credentials);
     console.log(expiration)
     if (credentials && credentials.username !== undefined) {
       this.useCredentials(credentials);
       if (this.authToken) {
        this.checkJWTtoken();
        const now = new Date();
        console.log(expiration.getTime())
        console.log(now.getTime())
        console.log(expiration)
        console.log(now)
        const expiresIn = (expiration.getTime() - now.getTime()) / 1000;
        this.startTimer(expiresIn)
       }
     }
   }

   storeUserCredentials(credentials: any, expirationDate: Date) {
     console.log('storeUserCredentials ', credentials);
     localStorage.setItem(this.tokenKey, JSON.stringify(credentials));
     localStorage.setItem('expiration', expirationDate.toISOString());
     this.useCredentials(credentials);
   }

   useCredentials(credentials: any) {
     this.isAuthenticated = true;
     this.sendUsername(credentials.username);
     this.authToken = credentials.token;
   }

   destroyUserCredentials() {
     this.authToken = undefined;
     this.clearUsername();
     this.isAuthenticated = false;
     localStorage.removeItem(this.tokenKey);
     localStorage.removeItem('expiration');
   }

   storeUserAccountsDetails(details: any) {
     console.log('storeUserAccountsDetails ', details); //need to see how to store array in localStorage
     localStorage.setItem(this.accountsKey, JSON.stringify(details));
   }

   destroyUserAccountsDetails() {
     localStorage.removeItem(this.accountsKey);
   }
 
   signUp(user: any): Observable<any> {
     return this.http.post(baseURL + 'users/signup', user)
       .pipe( map(res => {
         return {'success': true, 'username': user.username };
     }),
      //  catchError(error => this.processHTTPMsgService.handleError(error))
       );
     }

   logIn(user: any): Observable<any> {
     return this.http.post<AuthResponse>(baseURL + 'users/login',
       {'username': user.username, 'password': user.password})
       .pipe( map(res => {
           console.log(res)
           const now = new Date();
           const expirationDate = new Date(now.getTime() + res.exp * 1000);
           this.storeUserCredentials({username: user.username, token: res.token}, expirationDate);
           console.log(expirationDate)
           this.startTimer(res.exp);
           return {'success': true, 'username': user.username };
       }),
        // catchError(error => this.processHTTPMsgService.handleError(error))
        );
   }

   logInFacebook(fbAuthResponse): Observable<any>{
    return this.http.post<FbAuthResponse>(baseURL + 'users/facebook/token',
       {access_token: fbAuthResponse.accessToken})
       .pipe( map(res => {
           console.log(res)
           const now = new Date();
           const expirationDate = new Date(now.getTime() + res.exp * 1000);
           this.storeUserCredentials({username: res.username, token: res.token}, expirationDate);
           this.startTimer(res.exp);
           return {'success': true, 'username': res.username };
       }), map(res2 => {
           console.log("Test: ", res2);
           return res2; 
       }),
        // catchError(error => this.processHTTPMsgService.handleError(error))
        );
  }

   logOut() {
     this.destroyUserCredentials();
     this.destroyUserAccountsDetails();
     this.router.navigate(['/login']);
     clearTimeout(this.nodeTimer)
     this.clearTokenTimer()
   }

   isLoggedIn(): Boolean {
     return this.isAuthenticated;
   }

   getUsername(): Observable<string> {
     return this.username.asObservable();
   }

   getToken(): string {
     return this.authToken;
   }

   startTimer(expTime) {
    //  // repeat with the interval of 2 seconds
    //  let timerId = setInterval(() => console.log("tick"), 2000);
    //  // after 5 seconds stop
    //  setTimeout(() => { clearInterval(timerId); console.log('stop'); }, 10000);

    const source = timer(1000, 1000);
    const abc = source.subscribe(val => {
      // console.log(val, '-');
      var tokenTimer = expTime - val;
      this.sendTokenTimer(tokenTimer)
      if (tokenTimer < 15) {
        console.log("Logging out in 15 seconds, would you like to stay logged in?")
      }
    });
    console.log("EXP TIME: ", expTime)
    this.nodeTimer = setTimeout(() => {
      console.log("Inside the log out block")
      this.logOut();
      // this.tokenTimer.unsubscribe();
      abc.unsubscribe();
    }, expTime*1000)
   }

   getTokenTimer(): Observable<number>  {
     return this.tokenTimer.asObservable();
   }

   sendTokenTimer(tokenTimer: number) {
     this.tokenTimer.next(tokenTimer);
   }

   clearTokenTimer() {
     this.tokenTimer.next(undefined);
   }
}

