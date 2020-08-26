import { Component, OnInit, Inject, EventEmitter, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AccountService } from 'src/app/services/account.service';
import { ThrowStmt } from '@angular/compiler';
import { Subscription } from 'rxjs';
import { BudgetService } from 'src/app/services/budget.service';
import { error } from 'protractor';

@Component({
  selector: 'app-add-budget',
  templateUrl: './add-budget.component.html',
  styleUrls: ['./add-budget.component.scss']
})
export class AddBudgetComponent implements OnInit {
  @ViewChild('addbudgetform') addBudgetFormDirective;
  addBudgetForm: FormGroup;
  onAdd = new EventEmitter();
  onEdit = new EventEmitter();
  categories: any;
  categories2: any;
  categories3: any;
  isLoading: boolean;
  firstSelected = false;
  secondSelected = false;
  edit: boolean;
  // subscription: Subscription;

  constructor(public dialogRef: MatDialogRef<AddBudgetComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    private accountService: AccountService,
    private budgetService: BudgetService) { }
  
  ngOnInit() {
    this.createForm();
    // this.categories = ["Gas", "Food", "Rent"]
    this.isLoading = true;
    this.categories = this.data.categories;
    this.edit = this.data.edit
    if (this.edit === true) {
      console.log(this.addBudgetForm);
      if (this.data.budget.category3 !== '') {
        this.firstOpSelected(this.data.budget.category);
        this.secondOpSelected(this.data.budget.category2);
      }
      else if (this.data.budget.category2 !== '') {
        this.firstOpSelected(this.data.budget.category);
      }
      this.addBudgetForm.setValue({category: this.data.budget.category, category2: this.data.budget.category2, 
        category3: this.data.budget.category3, amount: this.data.budget.amount});
    }
    this.isLoading = false;
    // this.subscription = this.accountService.getCategoriesSub()
    //     .subscribe(categories => { console.log(categories); this.categories = categories; this.categoriesLoading = false;});
    // this.accountService.getTransactionCategories()
    //     .subscribe(categories => {
    //       console.log(categories);
    //       this.categories = {};
    //       for (let row of categories) {
    //         var i = 0;
    //         var currStr = "";
    //         var curr = this.categories;
    //         while (i < row.hierarchy.length) {
    //           currStr = row.hierarchy[i];
    //           // if (currStr !== "") {
    //           //   currStr = currStr + "." + row.hierarchy[i];
    //           // }
    //           // else {
    //           //   currStr = row.hierarchy[i];
    //           // }
    //           if (currStr in curr) {
    //             curr = curr[currStr];
    //           }
    //           else {
    //             curr[currStr] = {};
    //             curr = curr[currStr];
    //           }
    //           i += 1;
    //         }
    //       }
    //       console.log(this.categories);
    //       this.categoriesLoading = false;
    //     });
  }

  // ngOnDestroy() {
  //   this.subscription.unsubscribe();
  // }

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
      category2: ['', [] ],
      category3: ['', [] ],
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

  onFormConfirmed() {
    console.log("Budget: ", this.addBudgetForm.value);
    var returnFormValues = {};
    if (this.addBudgetForm.value.category3 !== "") {
      returnFormValues = {
        'mainCategory' : this.addBudgetForm.value.category3,
        'category' : this.addBudgetForm.value.category,
        'category2' : this.addBudgetForm.value.category2,
        'category3' : this.addBudgetForm.value.category3,
        'amount' : this.addBudgetForm.value.amount,
      };
    }
    else if (this.addBudgetForm.value.category2 !== "") {
      returnFormValues = {
        'mainCategory' : this.addBudgetForm.value.category2,
        'category' : this.addBudgetForm.value.category,
        'category2' : this.addBudgetForm.value.category2,
        'category3' : "",
        'amount' : this.addBudgetForm.value.amount,
      };
    }
    else {
      returnFormValues = {
        'mainCategory' : this.addBudgetForm.value.category,
        'category' : this.addBudgetForm.value.category,
        'category2' : "",
        'category3' : "",
        'amount' : this.addBudgetForm.value.amount,
      };
    }
    this.isLoading = true;
    if (this.edit) {
      this.budgetService.updateBudget(this.data.budget._id, returnFormValues).subscribe(res => {
        this.onEdit.emit(res);
      }, errmess => this.isLoading = false
      );
    }
    else {
      this.budgetService.addBudget(returnFormValues).subscribe(res => {
        this.onAdd.emit(res);
        // this.isLoading = false;
  
        // this.addBudgetFormDirective.resetForm();
        // this.addBudgetForm.reset({
        //   category: '',
        //   category2: '',
        //   category3: '',
        //   amount: ''
        // });
      }, errmess => this.isLoading = false
      );
    }
  }

  firstOpSelected(select) {
    console.log(select);
    console.log(this.categories);
    this.firstSelected = false;
    this.secondSelected = false;
    if (this.edit) {
      this.addBudgetForm.setValue({category: this.addBudgetForm.value.category, category2: '', 
        category3: '', amount: this.addBudgetForm.value.amount});
    }
    if (select[0] == " ") {
      select = select.substring(1, select.length-1)
    }
    if (select in this.categories) {
      this.categories2 = this.categories[select];
      if (Object.keys(this.categories2).length > 0) {
        this.firstSelected = true;
      }
    }
  }

  secondOpSelected(select) {
    console.log(select);
    console.log(this.categories2);
    this.secondSelected = false;
    if (this.edit) {
      this.addBudgetForm.setValue({category: this.addBudgetForm.value.category, category2: this.addBudgetForm.value.category2, 
        category3: '', amount: this.addBudgetForm.value.amount});
    }
    if (select[0] == " ") {
      select = select.substring(1, select.length-1)
    }
    if (select in this.categories2) {
      this.categories3 = this.categories2[select];
      if (Object.keys(this.categories3).length > 0) {
        this.secondSelected = true;
      }
    }
  }

}
