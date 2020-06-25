import { Component, OnInit } from '@angular/core';
import { MajorComponent } from '../shared/majorComponent';
import { MAJORS } from '../shared/majorComponents';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  majorComponents: MajorComponent[] = MAJORS;

  constructor() { }

  ngOnInit() {
  }

}
