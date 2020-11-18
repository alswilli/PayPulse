import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { Goal } from '../shared/goal';
import { UserGoal } from '../shared/usergoal';
import { Observable, forkJoin } from 'rxjs';

interface GoalResponse {
  message: string;
  goals: Goal[];
}

interface UserGoalResponse {
  message: string;
  usergoals: UserGoal[];
}

@Injectable({
  providedIn: 'root'
})
export class GoalService {

  constructor(private http: HttpClient) { }

  getGoals() {
    return this.http.get<GoalResponse>(baseURL + 'goals');
  }

  addGoal(name: string, description: string, image: File) {
    const goalData = new FormData();
    goalData.append("name", name);
    goalData.append("description", description);
    goalData.append("image", image, name);
    return this.http.post<GoalResponse>(baseURL + 'goals', goalData);
  }

  getUserGoals() {
    return this.http.get<UserGoalResponse>(baseURL + 'usergoals');
  }

  addUserGoal(userGoalData: Object) {
    return this.http.post<UserGoalResponse>(baseURL + 'usergoals', userGoalData);
  }

  checkAndUpdateUserGoals() {
    /*
    If (prev date is same month and year as current date) {
      do nothing
    }
    Else {
      Check all the related goals and update progress bar accordingly.
      If all goal is flagged,
          - Check to see if it has already been achieved
    }

    WHEN NEXT DAY OCCURS, CALL THIS FUNCTION ANDDDDD UPDATE the date
        
    */

    // let observables: Observable<any>[] = [];
    // for (let goal of this.allGoals) {
    //   for (let usergoal of this.allUserGoals) {
    //     if (usergoal.goalId == goal._id) {
    //       const userGoalData = {
    //         userId: currAccount._id,
    //         goalId: goal._id,
    //       }
    //       observables.push(this.goalService.addUserGoal(userGoalData))
    //     }
    //   }
    // }
    // forkJoin(observables)
    //     .subscribe(dataArray => {
    //         // All observables in `observables` array have resolved and `dataArray` is an array of result of each observable
    //         console.log("In fork join")
    //         for (let usergoal of dataArray[1]) {
    //           this.allUserGoals.push(usergoal);
    //         }
    //         this.authService.storeUserAccountsDetails({usergoals: this.allUserGoals});
    //         this.router.navigate(['/home']);
    //       });
  }

  // addUserGoals(userId: string, allGoals: Goal[], allUserGoals: UserGoal[]) {
  //   for (let goal of allGoals) {
  //     var found = false;
  //     for (let userGoal of allUserGoals) {
  //       if (userGoal.goalId == goal._id) {
  //         this.http.post(baseURL + 'usergoals/' + userId, userGoalData);
  //       }
  //     }
  //   }
  //   return true;
  // }

  updateUserGoal(goalId: string, update: object) {
    return this.http.put(baseURL + 'usergoals/' + goalId, update);
  }

}
