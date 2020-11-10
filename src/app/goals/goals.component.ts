import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Goal } from '../shared/goal';

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

  constructor() { }

  ngOnInit() {
    this.recentlyCompletedGoals = [
      {_id: "1", userId: "1", goalName: "a"},
      {_id: "2", userId: "1", goalName: "b"},
      {_id: "3", userId: "1", goalName: "c"},
      {_id: "4", userId: "1", goalName: "d"},
      {_id: "5", userId: "1", goalName: "e"},
      {_id: "6", userId: "1", goalName: "f"},
      {_id: "7", userId: "1", goalName: "g"},
      {_id: "8", userId: "1", goalName: "h"},
      {_id: "9", userId: "1", goalName: "i"},
      {_id: "10", userId: "1", goalName: "j"},
    ];
    this.monthlyGoals = [
      {_id: "1", userId: "1", goalName: "a"},
      {_id: "2", userId: "1", goalName: "b"},
      {_id: "3", userId: "1", goalName: "c"},
      {_id: "4", userId: "1", goalName: "d"},
      {_id: "5", userId: "1", goalName: "e"},
      {_id: "6", userId: "1", goalName: "f"},
      {_id: "7", userId: "1", goalName: "g"},
      {_id: "8", userId: "1", goalName: "h"},
      {_id: "9", userId: "1", goalName: "i"},
      {_id: "10", userId: "1", goalName: "j"},
    ];
    this.allGoals = [
      {_id: "1", userId: "1", goalName: "a"},
      {_id: "2", userId: "1", goalName: "b"},
      {_id: "3", userId: "1", goalName: "c"},
      {_id: "4", userId: "1", goalName: "d"},
      {_id: "5", userId: "1", goalName: "e"},
      {_id: "6", userId: "1", goalName: "f"},
      {_id: "7", userId: "1", goalName: "g"},
      {_id: "8", userId: "1", goalName: "h"},
      {_id: "9", userId: "1", goalName: "i"},
      {_id: "10", userId: "1", goalName: "j"},
    ];
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
