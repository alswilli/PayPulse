import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, Event} from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  // email: string = undefined;
  username: string = undefined;
  tokenTimer: number = undefined;
  usernameSubscription: Subscription;
  tokenSubscription: Subscription;
  opened: boolean;
  loggingIn: boolean;
  bgColor: string;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute, 
    private authService: AuthService) {} 

  ngOnInit() {
    this.router.events.subscribe((event:Event) => {
      if(event instanceof NavigationEnd ){
        console.log(event.url);
        if (event.url === '/login') {
          this.loggingIn = true;
          this.bgColor = 'f7fbff'
          console.log("Log in screen opened!");
        }
        else if (event.url === '/createAccount' || event.url === '/linkAccount') {
          this.loggingIn = true;
          this.bgColor = 'f7fbff'
        } 
        else {
          this.loggingIn = false;
          this.bgColor = 'FFFFFF'
        }
        // this.loggingIn = false;
      }
    }); 

    this.authService.loadUserCredentials();
    console.log("LOAD WAS CALLED")
      // this.subscription = this.authService.getEmail()
        // .subscribe(email => { console.log(email); this.email = email; });
    this.usernameSubscription = this.authService.getUsername()
      .subscribe(username => { console.log(username); this.username = username; });
    this.tokenSubscription = this.authService.getTokenTimer()
      .subscribe(tokenTimer => { console.log(tokenTimer); this.tokenTimer = tokenTimer; });
  }

  ngOnDestroy() {
    this.usernameSubscription.unsubscribe();
    this.tokenSubscription.unsubscribe();
  }

  onMenuClick(e) {
    console.log(e)
    this.opened = !this.opened;
    if (this.opened) {
      console.log("Sidebar opened!");
    }
    else {
      console.log("Sidebar closed!");
    }

    if (e && e.srcElement.innerHTML == " Log Out ") {
      this.logOut();
    }
  }

  logOut() {
    console.log('logout called')
    // this.email = undefined;
    this.username = undefined;
    // this.tokenTimer = undefined;
    // this.tokenSubscription.unsubscribe();
    this.ngOnDestroy();
    this.authService.logOut()
    // this.authService.logOut().subscribe(res => {
    //   // this.router.navigate(['/login']);
    // });
    // this.router.navigate(['/login']);
  }

}
