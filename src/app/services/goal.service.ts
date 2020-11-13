import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { Goal } from '../shared/goal';
import { UserGoal } from '../shared/usergoal';

interface GoalResponse {
  message: string;
  goals: Goal[];
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
    return this.http.get<UserGoal[]>(baseURL + 'goals');
  }

  addUserGoal(userGoalData: Object) {
    return this.http.post<UserGoal>(baseURL + 'goals', userGoalData);
  }

  updateUserGoal(goalId: string, update: object) {
    return this.http.put(baseURL + 'budgets/' + goalId, update);
  }

}
