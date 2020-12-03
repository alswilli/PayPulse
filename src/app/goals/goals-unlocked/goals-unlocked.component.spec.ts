import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalsUnlockedComponent } from './goals-unlocked.component';

describe('GoalsUnlockedComponent', () => {
  let component: GoalsUnlockedComponent;
  let fixture: ComponentFixture<GoalsUnlockedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoalsUnlockedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalsUnlockedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
