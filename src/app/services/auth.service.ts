import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { timer } from 'rxjs';

import { baseURL } from '../shared/baseurl';
import { ProcessHTTPMsgService } from './process-httpmsg.service';
import { ActivatedRoute, NavigationEnd, Router, Event } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
import { TokenExpiredComponent } from '../token-expired/token-expired.component';
import { User } from '../shared/user';
import { UserGoal } from '../shared/usergoal';
import {filter} from 'rxjs/operators';

interface AuthResponse {
  status: string;
  success: string;
  token: string;
  exp: number;
  admin: boolean;
  userId: string;
  lastUpdated: Date;
}

interface FbAuthResponse {
  status: string;
  success: string;
  token: string;
  username: string;
  exp: number;
  admin: boolean;
  userId: string;
  lastUpdated: Date;

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
  isUpdating: Boolean = false;
  username: Subject<string> = new Subject<string>();
  tokenTimer: Subject<number> = new Subject<number>();
  // tokenTimer: any;
  nodeTimer: NodeJS.Timer;
  timeLeft: number = 30;
  authToken: string = undefined;
  tokenExpiredRef: MatDialogRef<TokenExpiredComponent>;
  abc: any;
  currentRoute: string = ""
  onNewGoals = new EventEmitter();
  // newlyCompletedGoals: Subject<UserGoal[]> = new Subject<UserGoal[]>();
  newlyCompletedGoals: Subject<UserGoal[]> = new BehaviorSubject<UserGoal[]>([]);

   constructor(private http: HttpClient,
     private processHTTPMsgService: ProcessHTTPMsgService,
     private router: Router,
     public dialog: MatDialog,
     private activeRoute: ActivatedRoute) {
      // this.router.events.subscribe((event:Event) => {
      //   if(event instanceof NavigationEnd ){
      //     this.currentRoute = event.url;
      //   }
      // })
      // router.events.pipe(filter(event => event instanceof NavigationEnd))
      //     .subscribe(event => {
      //         this.currentRoute = event.url
      //     });
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

   loadUserCredentials() {
     const credentials = JSON.parse(localStorage.getItem(this.tokenKey));
     const expiration = new Date(localStorage.getItem('expiration'))
     console.log('loadUserCredentials ', credentials);
     console.log(expiration)
     const now = new Date();
     const expiresIn = (expiration.getTime() - now.getTime()) / 1000;
     let currentUrl = window.location.href
     let i;
     for (i = currentUrl.length-1; i >= 0; i--) {
       if (currentUrl[i] === "/") {
         break
       }
     }
     let urlPath = currentUrl.substring(i)
     console.log("Router url: ", urlPath)
     if (expiresIn > 0 && !(urlPath === "/login")) {
      if (credentials && credentials.username !== undefined) {
        this.useCredentials(credentials);
        if (this.authToken) {
          this.checkJWTtoken();
          console.log(expiration.getTime())
          console.log(now.getTime())
          console.log(expiration)
          console.log(now)
          this.startTimer(expiresIn)
        }
      }
     }
     else {
       this.logOut()
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

   storeGoalsDetails(details: any) {
    console.log('storeUserGoalsDetails ', details); 
    this.onNewGoals.emit(details.newlyCompletedGoals)
    // this.sendNewlyCompletedGoals(details.newlyCompletedGoals);
    localStorage.setItem("User Goals Details", JSON.stringify(details));
  }

  destroyGoalsDetails() {
    this.clearNewlyCompletedGoals();
    localStorage.removeItem("User Goals Details")
  }

  storeItemsDetails(details: any) {
    localStorage.setItem("Items Details", JSON.stringify(details));
  }

  destroyItemsDetails() {
    localStorage.removeItem("Items Details");
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
           this.storeUserCredentials({username: user.username, token: res.token, 
            admin: res.admin, userId: res.userId, lastUpdated: res.lastUpdated}, expirationDate);
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
           this.storeUserCredentials({username: res.username, token: res.token, 
            admin: res.admin, userId: res.userId, lastUpdated: res.lastUpdated}, expirationDate);
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
     console.log("logging out")
     //  var userId = JSON.parse(localStorage.getItem(this.accountsKey))["currentAccount"][0]["userId"];
    //  var userId = JSON.parse(localStorage.getItem(this.tokenKey))["userId"]
    //  console.log(userId)
    //  return this.http.put(baseURL + 'users/update', {userId: userId})
    //  .pipe( map(res => {
    //    console.log('inside')
    //     this.destroyUserCredentials();
    //     this.destroyUserAccountsDetails();
    //     this.destroyUserGoalsDetails();
    //     this.router.navigate(['/login']);
    //     clearTimeout(this.nodeTimer)
    //     this.clearTokenTimer();
    //     this.abc.unsubscribe();
    //     return res;
    //  }));
    this.destroyUserCredentials();
    this.destroyUserAccountsDetails();
    this.destroyGoalsDetails();
    this.destroyItemsDetails()
    this.router.navigate(['/login']);
    clearTimeout(this.nodeTimer)
    this.clearTokenTimer();
    if (this.abc) {
      this.abc.unsubscribe();
    }
   }

   update() {
    var userId = JSON.parse(localStorage.getItem(this.tokenKey))["userId"];
    return this.http.put<User>(baseURL + 'users/update', {userId: userId})
    .pipe( map(res => {
        var oldValues = JSON.parse(localStorage.getItem(this.tokenKey));
        console.log(oldValues)
        console.log(res)
        oldValues.lastUpdated = res.lastUpdated;
        localStorage.setItem(this.tokenKey, JSON.stringify(oldValues));
        console.log("updated user lastUpdated")
        return res;
    }));
   }

   isLoggedIn(): Boolean {
     return this.isAuthenticated;
   }

   nowUpdatingBackend() {
    this.isUpdating = true;
  }

   doneUpdatingBackend() {
    this.isUpdating = false;
  }

   isUpdatingBackend(): Boolean {
    return this.isUpdating;
  }

   getToken(): string {
     return this.authToken;
   }

   startTimer(expTime) {
    //  // repeat with the interval of 2 seconds
    //  let timerId = setInterval(() => console.log("tick"), 2000);
    //  // after 5 seconds stop
    //  setTimeout(() => { clearInterval(timerId); console.log('stop'); }, 10000);
    console.log("START TIMER")
    var dialogOpened = false;
    const source = timer(1000, 1000);
    this.abc = source.subscribe(val => {
      // console.log(val, '-');
      var tokenTimer = expTime - val;
      // console.log("TOKEN TIMER: ", tokenTimer)
      // this.sendTokenTimer(tokenTimer) 
      if (tokenTimer <= 61) {
        console.log("TOKEN TIMER: ", tokenTimer)
      }
      if (tokenTimer <= 61 && !dialogOpened) {
        // console.log("Logging out in 15 seconds, would you like to stay logged in?")
        this.tokenExpiredRef = this.dialog.open(TokenExpiredComponent, {data: {tokenTimer: tokenTimer}});
        this.tokenExpiredRef.componentInstance.onLogout
          .subscribe(() => {
            this.logOut();
            this.abc.unsubscribe();
          });
        this.tokenExpiredRef.componentInstance.onStayLoggedIn
          .subscribe(() => {
            console.log("back in auth")
            this.http.get<FbAuthResponse>(baseURL + 'users/newJWTtoken')
              .subscribe(res => {
                console.log(res)
                clearTimeout(this.nodeTimer)
                this.clearTokenTimer();
                this.abc.unsubscribe();
                this.tokenExpiredRef.close();
                const now = new Date();
                const expirationDate = new Date(now.getTime() + res.exp * 1000);
                this.storeUserCredentials({username: res.username, token: res.token,
                  admin: res.admin, userId: res.userId, lastUpdated: res.lastUpdated}, expirationDate);
                this.startTimer(res.exp);
                return {'success': true, 'username': res.username };
              },
              err => {
                // console.log('JWT Token invalid: ', err);
              });
          });
        dialogOpened = true;
      }
    });
    console.log("EXP TIME: ", expTime)
    this.nodeTimer = setTimeout(() => {
      console.log("Inside the log out block")
      this.logOut();
      this.tokenExpiredRef.close();
      // this.logOut();
      // this.tokenTimer.unsubscribe();
      // abc.unsubscribe();
    }, expTime*1000)
   }

   getUsername(): Observable<string> {
    return this.username.asObservable();
  }

   sendUsername(name: string) {
    this.username.next(name);
  }

  clearUsername() {
    this.username.next(undefined);
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

   getNewlyCompletedGoals(): Observable<UserGoal[]> {
     return this.newlyCompletedGoals.asObservable();
   }

   sendNewlyCompletedGoals(goals: UserGoal[]) {
     console.log("sent goals")
     this.newlyCompletedGoals.next(goals);
   }

   clearNewlyCompletedGoals() {
     this.newlyCompletedGoals.next(undefined);
   }
}

