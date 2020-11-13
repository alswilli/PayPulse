import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Goal } from '../shared/goal';
import { GoalService } from '../services/goal.service';
import { mergeMap } from 'rxjs/operators';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { mimeType } from "./mime-type.validator";

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
})
export class GoalsComponent implements OnInit {
  recentlyCompletedGoals: Goal[];
  monthlyGoals: Goal[];
  allGoals: Goal[];

  columns: number = 1;
  width: number = 250;
  lowEdge: number;
  highEdge: number;

  @ViewChild('box') box: ElementRef;
  userAccountsDetails: any;
  currentAccountId: any;
  jwtDetails: any;
  admin: any;
  form: FormGroup;
  imagePreview: string;
  isLoading: boolean;

  @ViewChild('filePicker') filePicker: ElementRef;
  initialLoad: boolean;
  

  constructor(private goalService: GoalService,) { }

  ngOnInit() {
    this.isLoading = true;
    this.initialLoad = true;
    this.allGoals = [];
    this.userAccountsDetails = JSON.parse(localStorage.getItem('User Accounts Details'));
    this.currentAccountId = this.userAccountsDetails.currentAccount[0]._id;

    this.jwtDetails = JSON.parse(localStorage.getItem('JWT'));
    this.admin = this.jwtDetails.admin;

    this.form = new FormGroup({
      name: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      description: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });

    this.goalService.getGoals()
    .pipe(
      mergeMap((goalResponse) => {
        this.allGoals = goalResponse.goals;
        console.log(this.allGoals)
        var currWidth = this.box.nativeElement.clientWidth;
        this.columns = Math.floor(currWidth / this.width) 
        console.log(currWidth, this.columns)
        if (this.columns > this.allGoals.length) {
          this.columns = this.allGoals.length;
        }
        this.lowEdge = currWidth - (currWidth % this.width);
        this.highEdge = this.lowEdge + this.width;
        console.log(this.columns, this.lowEdge, currWidth, this.highEdge)
        this.isLoading = false;
        this.initialLoad = false;
        return goalResponse.goals;
      })
    )
    .subscribe(goals => {
      
    })
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSaveGoal() {
    if (this.form.invalid) {
      return;
    }
    console.log(this.form.value.image)
    this.goalService.addGoal(
      this.form.value.name,
      this.form.value.description,
      this.form.value.image
    ).subscribe(createdGoal => {
      this.allGoals.push(createdGoal.goals[0]);
    });
    this.filePicker.nativeElement.value = "";
    this.form.reset();
  }

  onBoxResize(e) {
    if(this.box) {
      // console.log(this.box.nativeElement.clientWidth)
      var currWidth = this.box.nativeElement.clientWidth;

      if (currWidth < this.lowEdge) {
        if ((this.columns-1) * this.width < this.allGoals.length * this.width && currWidth < this.allGoals.length * this.width) {
          this.columns = this.columns - 1;
        }
        this.highEdge = this.lowEdge;
        this.lowEdge = this.highEdge - this.width;
        console.log("a")
      }
      else if (currWidth > this.highEdge) {
        if ((this.columns) * this.width < this.allGoals.length * this.width) {
          this.columns = this.columns + 1;
        }
        this.lowEdge = this.highEdge
        this.highEdge = this.lowEdge + this.width;
        console.log("b")
      }
      console.log(this.allGoals.length / this.columns)
      console.log(this.columns, this.lowEdge, currWidth, this.highEdge)

      // this.columns = Math.floor(currWidth / this.width)
      // let n = Math.floor(this.box.nativeElement.clientWidth / 100);
      // this.columns = (n > 0 ? n : 1);

      // if (currWidth < 447) {
      //   this.columns = 1;
      // }
      // else if (currWidth < 960) {
      //   this.columns = 2;
      // }
      // else {
      //   this.columns = 4;
      // }

      
    } 
    // else {
    //   this.columns = 1;
    // }
  }

}
