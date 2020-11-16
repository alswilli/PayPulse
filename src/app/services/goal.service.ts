import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { Goal } from '../shared/goal';
import { UserGoal } from '../shared/usergoal';

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
