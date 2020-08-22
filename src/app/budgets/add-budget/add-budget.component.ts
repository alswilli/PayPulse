import { Component, OnInit, Inject, EventEmitter, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-budget',
  templateUrl: './add-budget.component.html',
  styleUrls: ['./add-budget.component.scss']
})
export class AddBudgetComponent implements OnInit {
  @ViewChild('addbudgetform') addBudgetFormDirective;
  addBudgetForm: FormGroup;
  onAdd = new EventEmitter();
  categories: string[];

  constructor(public dialogRef: MatDialogRef<AddBudgetComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder) { }

  formErrors = {
    'category': '',
    'amount': ''
  };

  validationMessages = {
    'category': {
      'required':      'Category is required.'
    },
    'amount': {
      'required':      'Amount is required.',
      'min':           'Amount must be a number greater than 0'
    }
  };

  createForm() {
    this.addBudgetForm = this.fb.group({
      category: ['', [Validators.required] ],
      amount: ['', [Validators.required, Validators.min(1)] ]
    });

    this.addBudgetForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.addBudgetForm) { return; }
    const form = this.addBudgetForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          console.log("here");
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onAddConfirmed() {
    // // this.feedback = this.feedbackForm.value;
    // console.log("User account getting created: ", this.createAccountForm.value);
    // var user = this.createAccountForm.value;
    // this.authService.signUp(user).subscribe(res => {
    //   if (res.success) {
    //     this.router.navigate(['/login']);
    //   }
    // });
    console.log("New Budget getting created: ", this.addBudgetForm.value);

    this.addBudgetFormDirective.resetForm();
    this.addBudgetForm.reset({
      category: '',
      amount: ''
    });

    this.onAdd.emit(this.addBudgetForm.value);
  }

  ngOnInit() {
    this.createForm();
    this.categories = ["Gas", "Food", "Rent"]
  }

}
