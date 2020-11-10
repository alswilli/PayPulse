import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { Goal } from '../shared/goal';
import { UserGoal } from '../shared/usergoal';

@Injectable({
  providedIn: 'root'
})
export class GoalService {

  constructor(private http: HttpClient) { }

  getGoals() {
    return this.http.get<Goal[]>(baseURL + 'goals');
  }

  getUserGoals() {
    return this.http.get<UserGoal[]>(baseURL + 'goals');
  }

  addUserGoal(goalData: Object) {
    return this.http.post<UserGoal>(baseURL + 'goals', goalData);
  }

  updateUserGoal(goalId: string, update: object) {
    return this.http.put(baseURL + 'budgets/' + goalId, update);
  }

}
