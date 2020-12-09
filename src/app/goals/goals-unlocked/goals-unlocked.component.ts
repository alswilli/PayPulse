import { getMatScrollStrategyAlreadyAttachedError } from '@angular/cdk/overlay/typings/scroll/scroll-strategy';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { GoalService } from 'src/app/services/goal.service';

@Component({
  selector: 'app-goals-unlocked',
  templateUrl: './goals-unlocked.component.html',
  styleUrls: ['./goals-unlocked.component.scss']
})
export class GoalsUnlockedComponent implements OnInit {

  // onDelete = new EventEmitter();
  @ViewChild('box') box: ElementRef;
  isLoading = false;
  index: number;
  newlyUnlockedGoals = []
  matchedGoals = []
  farthestRight: boolean;
  farthestLeft: boolean;
  newGoals: boolean;
  goals = []
  gtMd = true

  constructor(public dialogRef: MatDialogRef<GoalsUnlockedComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private goalsService: GoalService) {}

  ngOnInit() {
    console.log(this.data);
    this.isLoading = false;
    this.index = 0;
    var currIndex = 0;
    console.log(this.box.nativeElement.clientWidth)
    console.log(window.screen.availWidth)
    if (window.screen.availWidth > 950) {
      console.log(window.screen.availWidth)
      this.gtMd = true
    }
    else {
      this.gtMd = false
    }
    if ('matchedGoals' in this.data) {
      this.newGoals = false
      this.index = this.data.index;
      for (let goal of this.data.matchedGoals) {
        if (currIndex == this.index) {
          goal['show'] = true
        }
        else {
          goal['show'] = false
        }
        goal[0].dateFirstAchieved = new Date(goal[0].dateFirstAchieved).toLocaleString("en-US")
        this.matchedGoals.push(goal)
        currIndex += 1
      }
      console.log(this.matchedGoals)
      this.goals = this.matchedGoals
    }
    else {
      this.newGoals = true
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
      this.goals = this.newlyUnlockedGoals
    }

    if (this.index == 0) {
      this.farthestLeft = true;
    }
    else {
      this.farthestLeft = false;
    }

    if (this.newGoals && this.index == this.newlyUnlockedGoals.length-1) {
      this.farthestRight = true;
    }
    else if (!this.newGoals && this.index == this.matchedGoals.length-1) {
      this.farthestRight = true;
    }
    else {
      this.farthestRight = false;
    }
  }

  onLeftIconClicked() {
    var currIndex = 0;
    while (currIndex < this.goals.length) {
      if (currIndex - 1 >= 0 && currIndex == this.index) {
        console.log("left")
        this.goals[this.index].show = false
        this.index = currIndex - 1
        this.goals[this.index].show = true
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
    while (currIndex < this.goals.length) {
      if (currIndex + 1 < this.goals.length && currIndex == this.index) {
        console.log("right")
        this.goals[this.index].show = false
        this.index = currIndex + 1
        this.goals[this.index].show = true
        this.farthestLeft = false
        break
      }
      currIndex += 1
    }
    if (this.index == this.goals.length-1) {
      this.farthestRight = true;
    }
    else {
      this.farthestRight = false;
    }
  }

  // onBoxResize() {
  //   console.log("here")
  //   console.log(this.box.nativeElement.clientWidth)
  //   if (this.box) {
  //     if (window.screen.availWidth > 950) {
  //       this.gtMd = true
  //     }
  //     else {
  //       this.gtMd = false
  //     }
  //   }
  // }


  // onDeleteConfirmed(currBudgetId, currAccountId) {
  //   this.isLoading = true;
  //   this.goalsService.deleteBudget(currBudgetId).subscribe(res => {
  //     this.onDelete.emit(res);
  //   }, errmess => this.isLoading = false
  //   );
  // }

}
