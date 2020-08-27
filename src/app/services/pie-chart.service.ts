import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PieChartService {

  constructor() { }

  private subject = new Subject<any>();

  sendNewPieDataEvent(pieData) {
    this.subject.next(pieData);
  }

  getNewPieDataEvent(): Observable<any>{ 
    return this.subject.asObservable();
  }
}
