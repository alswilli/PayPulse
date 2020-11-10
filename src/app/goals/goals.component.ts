import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Goal } from '../shared/goal';
import { GoalService } from '../services/goal.service';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
})
export class GoalsComponent implements OnInit {
  recentlyCompletedGoals: Goal[];
  monthlyGoals: Goal[];
  allGoals: Goal[];

  columns: number = 4;

  @ViewChild('box') box: ElementRef;
  userAccountsDetails: any;
  currentAccountId: any;
  jwtDetails: any;
  admin: any;

  constructor(private goalService: GoalService,) { }

  ngOnInit() {
    this.allGoals = [];
    this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
    this.currentAccountId = this.userAccountsDetails.currentAccount[0]._id;

    this.jwtDetails = JSON.parse(localStorage.getItem('JWT'));
    this.admin = this.jwtDetails.admin;

    this.goalService.getGoals()
    .pipe(
      mergeMap((goals) => {
        this.allGoals = goals;
        return goals;
      })
    )
    .subscribe(_ => {
      
    })
  }

  onBoxResize() {
    if(this.box) {
      console.log(this.box.nativeElement.clientWidth)
      var currWidth = this.box.nativeElement.clientWidth;
      // let n = Math.floor(this.box.nativeElement.clientWidth / 100);
      // this.columns = (n > 0 ? n : 1);
      if (currWidth < 447) {
        this.columns = 1;
      }
      else if (currWidth < 960) {
        this.columns = 2;
      }
      else {
        this.columns = 4;
      }
    } 
    // else {
    //   this.columns = 1;
    // }
  }

}
