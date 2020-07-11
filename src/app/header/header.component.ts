import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, Event} from '@angular/router';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  opened: boolean;
  loggingIn: boolean;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute) {} 

  ngOnInit() {
    this.router.events.subscribe((event:Event) => {
      if(event instanceof NavigationEnd ){
        console.log(event.url);
        if (event.url === '/login') {
          this.loggingIn = true;
          console.log("Log in screen opened!");
        } 
        else {
          this.loggingIn = false;
          console.log("Log in screen closed!");
        }
      }
    });
    // this.router.events.pipe(
    //   filter(event => event instanceof NavigationEnd))
    //     .subscribe((event:Event) => {
    //       console.log(event);
    //       if (event.url === '/login') {
    //         this.loggingIn = true;
    //         console.log("Log in screen opened!");
    //       } 
    //       else {
    //         this.loggingIn = false;
    //         console.log("Log in screen closed!");
    //       }
    //     });  
  }

  onMenuClick() {
    this.opened = !this.opened;
    if (this.opened) {
      console.log("Sidebar opened!");
    }
    else {
      console.log("Sidebar closed!");
    }
  }

}
