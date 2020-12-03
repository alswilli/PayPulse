import { getMatScrollStrategyAlreadyAttachedError } from '@angular/cdk/overlay/typings/scroll/scroll-strategy';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { GoalService } from 'src/app/services/goal.service';

@Component({
  selector: 'app-goals-unlocked',
  templateUrl: './goals-unlocked.component.html',
  styleUrls: ['./goals-unlocked.component.scss']
})
export class GoalsUnlockedComponent implements OnInit {

  // onDelete = new EventEmitter();
  isLoading = false;
  index: number;
  newlyUnlockedGoals = []
  farthestRight: boolean;
  farthestLeft: boolean;

  constructor(public dialogRef: MatDialogRef<GoalsUnlockedComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private goalsService: GoalService) {}

  ngOnInit() {
    console.log(this.data);
    this.isLoading = false;
    this.index = 0;
    var currIndex = 0;
    for (let goal of this.data.newlyUnlockedGoals) {
      if (currIndex == this.index) {
        goal['show'] = true
      }
      else {
        goal['show'] = false
      }
      goal[0].dateFirstAchieved = new Date(goal[0].dateFirstAchieved).toLocaleString("en-US")
      this.newlyUnlockedGoals.push(goal)
      currIndex += 1
    }
    console.log(this.newlyUnlockedGoals)
    if (this.index == 0) {
      this.farthestLeft = true;
    }
    else {
      this.farthestLeft = false;
    }
    if (this.index == this.newlyUnlockedGoals.length-1) {
      this.farthestRight = true;
    }
    else {
      this.farthestRight = false;
    }
  }

  onLeftIconClicked() {
    var currIndex = 0;
    while (currIndex < this.newlyUnlockedGoals.length) {
      if (currIndex - 1 >= 0 && currIndex == this.index) {
        console.log("left")
        this.newlyUnlockedGoals[this.index].show = false
        this.index = currIndex - 1
        this.newlyUnlockedGoals[this.index].show = true
        this.farthestRight = false
        break
      }
      currIndex += 1
    }
    if (this.index == 0) {
      this.farthestLeft = true;
    }
    else {
      this.farthestLeft = false;
    }
  }

  onRightIconClicked() {
    var currIndex = 0;
    while (currIndex < this.newlyUnlockedGoals.length) {
      if (currIndex + 1 < this.newlyUnlockedGoals.length && currIndex == this.index) {
        console.log("right")
        this.newlyUnlockedGoals[this.index].show = false
        this.index = currIndex + 1
        this.newlyUnlockedGoals[this.index].show = true
        this.farthestLeft = false
        break
      }
      currIndex += 1
    }
    if (this.index == this.newlyUnlockedGoals.length-1) {
      this.farthestRight = true;
    }
    else {
      this.farthestRight = false;
    }
  }


  // onDeleteConfirmed(currBudgetId, currAccountId) {
  //   this.isLoading = true;
  //   this.goalsService.deleteBudget(currBudgetId).subscribe(res => {
  //     this.onDelete.emit(res);
  //   }, errmess => this.isLoading = false
  //   );
  // }

}
