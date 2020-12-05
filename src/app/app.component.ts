import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { SidebarService } from './services/sidebar.service';
import { AuthService } from './services/auth.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'PayPulse';

  // @HostListener('window:unload', [ '$event' ])
  // unloadHandler(event) {
  //   this.authService.logOut();
  // }

  constructor(private authService: AuthService,
    private router: Router) {}

  // ngOnInit() {
  //   this.router.events.subscribe((evt) => {
  //     if (!(evt instanceof NavigationEnd)) {
  //         return;
  //     }
  //     console.log("SDVASVSVSDVASDADASDJASDJASDAD")
  //     window.scrollTo(0, 0)
  // });
  // }

  // @HostListener('window:beforeunload', ['$event'])
  // async doSomething($event) {
  //   console.log("hey")
  //   console.log($event)
  //   $event.preventDefault();
  //   $event.returnValued=undefined;
  //   await this.authService.logOut().toPromise();
  // }

  // @HostListener('window:unload', ['$event'])
  // async doSomething($event) {
  //   console.log("hey")
  //   console.log($event)
  //   $event.preventDefault();
  //   $event.returnValued='';
  //   await this.authService.logOut().toPromise();
  // }

  // @HostListener('window:beforeunload', ['$event'])
  // async ngOnDestroy($event) {
  //   await this.authService.logOut().toPromise();
  //   $event.preventDefault();
  //   $event.returnValue = 'A message.';

  // }

  // @HostListener('window:unload', ['$event']) 
  // async unloadHandler(event) {
  //     await this.triggerSyncLogout2();
  // }

  // async triggerSyncLogout2(){
  //   return await this.authService.logOut().toPromise();
  // }

  // @HostListener('window:beforeunload', ['$event']) 
  // async beforeunloadHandler(event) {
  //     await this.triggerSyncLogout();
  // }

  // async triggerSyncLogout(){
  //   return await this.authService.logOut().toPromise();
  // }

  // public doUnload(): void {
  //   this.doBeforeUnload();
  // }

  // // Keep me Signed in
  // public doBeforeUnload(): void {
  //   // // Clear localStorage
  //   // localStorage.removeItem('username_key');
  //   this.authService.logOut();
  // }

  // window.addEventListener("beforeunload", function (e) {
  //   var confirmationMessage = "\o/";
  
  //   (e || window.event).returnValue = confirmationMessage; //Gecko + IE
  //   return confirmationMessage;                            //Webkit, Safari, Chrome
  // });
}
