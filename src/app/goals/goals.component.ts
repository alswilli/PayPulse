import { Component, OnInit } from '@angular/core';
import { Goal } from '../shared/goal';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
})
export class GoalsComponent implements OnInit {
  activeGoals: Goal[];
  completedGoals: Goal[];

  constructor() { }

  ngOnInit() {
    this.activeGoals = [
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
    this.completedGoals = [
      
    ];
  }

}
