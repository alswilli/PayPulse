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
  budgets: any;
  budgetMins: any;
  isLoading: boolean;
  firstSelected = false;
  secondSelected = false;
  edit: boolean;
  minVal: number;
  maxVal: number;
  // subscription: Subscription;

  constructor(public dialogRef: MatDialogRef<AddBudgetComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    private accountService: AccountService,
    private budgetService: BudgetService) { }
  
  ngOnInit() {
    this.minVal = 0;
    this.maxVal = Number.POSITIVE_INFINITY;
    this.budgetMins = {};
    this.createForm();
    // this.categories = ["Gas", "Food", "Rent"]
    this.isLoading = true;
    this.categories = this.data.categories;
    this.budgets = this.data.budgets;
    this.edit = this.data.edit
    console.log(this.data)
    console.log("Active Budgets: ", this.budgets)
    console.log("Categories: ", this.categories)
    console.log("Edit: ", this.edit)
    this.createBudgetMins(); //-> NEED TO FIX FOR TESTS TO WORK
    // console.log("Active Budgets: ", this.budgets)
    // console.log("Categories: ", this.categories)
    if (this.edit === true) {
      console.log(this.data.budget)
      if (this.data.budget.category3 !== '') {
        this.firstOpSelected(this.data.budget.category);
        console.log(this.categories)
        this.secondOpSelected(this.data.budget.category2);
      }
      else if (this.data.budget.category2 !== '') {
        this.firstOpSelected(this.data.budget.category);
      }
      this.addBudgetForm.setValue({category: this.data.budget.category, category2: this.data.budget.category2, 
        category3: this.data.budget.category3, amount: this.data.budget.amount});
    }
    this.getMinMaxVals();
    console.log("here")
    this.isLoading = false;
  }

  // ngOnDestroy() {
  //   this.subscription.unsubscribe();
  // }

  formErrors = {
    'category': '',
    'amount': ''
  };

  // These were not working so used mat-error
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
      amount: ['', [Validators.required, Validators.min(this.minVal), Validators.max(this.maxVal)] ]
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
        console.log("HERERERER: ", res)

        this.onAdd.emit(res);
        // this.dialogRef.close(res)

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

  getMinMaxVals(){
    var budget = this.addBudgetForm.value;
    var budgetLevel = null;
    if (budget.category2 && budget.category3) {
      budgetLevel = 3;
    }
    else if (budget.category2) {
      budgetLevel = 2
    }
    else {
      budgetLevel = 1
    }

    var key = budget.category
    if (key in this.budgetMins) {
      // Top case
      if (budgetLevel === 1) {
        if (2 in this.budgetMins[key]) {
          this.minVal = 0;
          for (let cat of Object.keys(this.budgetMins[key][2])) {
            this.minVal = this.minVal + this.budgetMins[key][2][cat];
          }
        }
        else if (3 in this.budgetMins[key]) {
          this.minVal = 0;
          for (let cat of Object.keys(this.budgetMins[key][3])) {
            for (let subcat of Object.keys(this.budgetMins[key][3][cat])) {
              this.minVal = this.minVal + this.budgetMins[key][3][cat][subcat];
            }
            // this.minVal = this.minVal + this.budgetMins[key][3][cat];
          }
        }
        else {
          this.minVal = 0
        }
        this.maxVal = Number.POSITIVE_INFINITY;
      }

      // Middle case
      else if (budgetLevel === 2) {
        if (1 in this.budgetMins[key] && 3 in this.budgetMins[key]) {
          // min
          if (this.budgetMins[key][3] && budget.category2 in this.budgetMins[key][3]) {
            this.minVal = 0;
            for (let subcat of Object.keys(this.budgetMins[key][3][budget.category2])) {
              this.minVal = this.minVal + this.budgetMins[key][3][budget.category2][subcat];
            }
            // this.minVal = this.budgetMins[key][3][budget.category2]
          }
          else {
            this.minVal = 0
          }

          // max
          var otherVals = 0;
          if (this.budgetMins[key][2]) {
            for (let cat of Object.keys(this.budgetMins[key][2])) {
              if (cat !== budget.category2) {
                otherVals = otherVals + this.budgetMins[key][2][cat];
              }
            }
          }
          this.maxVal = this.budgetMins[key][1] - otherVals;
        }
        else if (1 in this.budgetMins[key]) {
          this.minVal = 0
          var otherVals = 0;
          if (this.budgetMins[key][2]) {
            for (let cat of Object.keys(this.budgetMins[key][2])) {
              if (cat !== budget.category2) {
                otherVals = otherVals + this.budgetMins[key][2][cat];
              }
            }
          }
          this.maxVal = this.budgetMins[key][1] - otherVals;
        }
        else if (3 in this.budgetMins[key]) {
          if (this.budgetMins[key][3] && budget.category2 in this.budgetMins[key][3]) {
            this.minVal = 0;
            for (let subcat of Object.keys(this.budgetMins[key][3][budget.category2])) {
              this.minVal = this.minVal + this.budgetMins[key][3][budget.category2][subcat];
            }
            // this.minVal = this.budgetMins[key][3][budget.category2]
          }
          else {
            this.minVal = 0
          }
          this.maxVal = this.maxVal = Number.POSITIVE_INFINITY;
        }
        else {
          this.minVal = 0
          this.maxVal = this.maxVal = Number.POSITIVE_INFINITY;
        }
      }

      // Bottom case
      else {
        console.log(this.budgetMins)
        if (2 in this.budgetMins[key] && 1 in this.budgetMins[key]) {
          if (budget.category2 in this.budgetMins[key][2]) {
            // bounded above by 2
            var currVals = 0;
            if (this.budgetMins[key][3] && budget.category2 in this.budgetMins[key][3]) {
              for (let sameLevelBudget in this.budgetMins[key][3][budget.category2]) {
                if (sameLevelBudget != budget.category3) {
                  currVals += this.budgetMins[key][3][budget.category2][sameLevelBudget];
                }
              }
              this.maxVal = this.budgetMins[key][2][budget.category2] - currVals;
            }
            else {
              this.maxVal = this.budgetMins[key][2][budget.category2];
            }
          }
          else {
            // bounded above by 1
            var otherVals = 0;
            for (let cat of Object.keys(this.budgetMins[key][2])) {
              if (cat !== budget.category2) {
                otherVals = otherVals + this.budgetMins[key][2][cat];
              }
            }
            var currVals = 0;
            if (this.budgetMins[key][3] && budget.category2 in this.budgetMins[key][3]) {
              for (let sameLevelBudget in this.budgetMins[key][3][budget.category2]) {
                if (sameLevelBudget != budget.category3) {
                  currVals += this.budgetMins[key][3][budget.category2][sameLevelBudget];
                } 
              }
              // currVals = this.budgetMins[key][3][budget.category2];
              this.maxVal = this.budgetMins[key][1] - otherVals - currVals;
            }
            else {
              this.maxVal = this.budgetMins[key][1] - otherVals;
            }
          }
        }
        else if (2 in this.budgetMins[key]) {
          if (budget.category2 in this.budgetMins[key][2]) {
            // bounded above
            var currVals = 0;
            if (this.budgetMins[key][3] && budget.category2 in this.budgetMins[key][3]) {
              for (let sameLevelBudget in this.budgetMins[key][3][budget.category2]) {
                if (sameLevelBudget != budget.category3) {
                  currVals += this.budgetMins[key][3][budget.category2][sameLevelBudget];
                } 
              }
              this.maxVal = this.budgetMins[key][2][budget.category2] - currVals;
            }
            else {
              this.maxVal = this.budgetMins[key][2][budget.category2];
            }
          }
          else {
            this.maxVal = Number.POSITIVE_INFINITY;
          }
        }
        else if (1 in this.budgetMins[key]) {
          var currVals = 0;
          if (this.budgetMins[key][3] && budget.category2 in this.budgetMins[key][3]) {
            // other restaurant budget 3's
            for (let sameLevelBudget in this.budgetMins[key][3][budget.category2]) {
              if (sameLevelBudget != budget.category3) {
                currVals += this.budgetMins[key][3][budget.category2][sameLevelBudget];
              } 
            }
            this.maxVal = this.budgetMins[key][1] - currVals;
          }
          else {
            // NO other restaurant budget 3's
            this.maxVal = this.budgetMins[key][1];
          }
        }
        else {
          this.maxVal = Number.POSITIVE_INFINITY;
        }
        this.minVal = 0;
      }
    }
    else {
      this.minVal = 0;
      this.maxVal = Number.POSITIVE_INFINITY;
    }
    
    this.addBudgetForm.controls.amount.setValidators([Validators.required, Validators.min(this.minVal), Validators.max(this.maxVal)]);

    this.addBudgetForm.controls.amount.updateValueAndValidity();

    console.log("Min Val: ", this.minVal)
    console.log("Max Val: ", this.maxVal)
    console.log(this.budgetMins)
  }

  createBudgetMins() {
    for (let budget of this.budgets) {
      console.log(budget)
      var budgetLevel = null;
      if (budget.category2 && budget.category3) {
        budgetLevel = 3;
      }
      else if (budget.category2) {
        budgetLevel = 2
      }
      else {
        budgetLevel = 1
      } 

      // var key = budget.category + String(budgetLevel);
      var key = budget.category
      if (key in this.budgetMins) {
        // top category already exists
        if (budgetLevel in this.budgetMins[key]) {
          if (budgetLevel === 3) {
            if (budget.category2 in this.budgetMins[key][budgetLevel]) {
              if (budget.category3 in this.budgetMins[key][budgetLevel][budget.category2]) {
                console.log("a") // won't get called?
                this.budgetMins[key][budgetLevel][budget.category2][budget.category3] = this.budgetMins[key][budgetLevel][budget.category2][budget.category3] + Number(budget.amount);
              }
              else {
                console.log("aa")
                this.budgetMins[key][budgetLevel][budget.category2][budget.category3] = Number(budget.amount);
              }
            }
            else {
              console.log("b")
              this.budgetMins[key][budgetLevel][budget.category2] = {}
              this.budgetMins[key][budgetLevel][budget.category2][budget.category3] = Number(budget.amount);
            }
          }
          else if (budgetLevel === 2) {
            if (budget.category2 in this.budgetMins[key][budgetLevel]) {
              console.log("c") // will not get called?
              this.budgetMins[key][budgetLevel][budget.category2] = this.budgetMins[key][budgetLevel][budget.category2] + Number(budget.amount);
            }
            else {
              console.log("d")
              this.budgetMins[key][budgetLevel][budget.category2] = Number(budget.amount);
            }
          }
          else {
            console.log("e") // will not get called?
            this.budgetMins[key][budgetLevel] = this.budgetMins[key][budgetLevel] + Number(budget.amount);
          }
        }
        else {
          if (budgetLevel === 3) {
            console.log("f")
            this.budgetMins[key][budgetLevel] = {}
            this.budgetMins[key][budgetLevel][budget.category2] = {}
            this.budgetMins[key][budgetLevel][budget.category2][budget.category3] = Number(budget.amount);
          }
          else if (budgetLevel === 2) {
            console.log("g")
            this.budgetMins[key][budgetLevel] = {}
            this.budgetMins[key][budgetLevel][budget.category2] = Number(budget.amount);
          }
          else {
            console.log("h") 
            this.budgetMins[key][budgetLevel] = Number(budget.amount);
          }
        }
      }
      else {
        // new top category
        this.budgetMins[key] = {};
        if (budgetLevel === 3) {
          console.log("i")
          this.budgetMins[key][budgetLevel] = {}
          this.budgetMins[key][budgetLevel][budget.category2] = {}
          this.budgetMins[key][budgetLevel][budget.category2][budget.category3] = Number(budget.amount);
        }
        else if (budgetLevel === 2) {
          console.log("j")
          this.budgetMins[key][budgetLevel] = {}
          this.budgetMins[key][budgetLevel][budget.category2] = Number(budget.amount);
        }
        else {
          console.log("k")
          this.budgetMins[key][budgetLevel] = Number(budget.amount);
        }
      }
    }
    console.log(this.budgetMins)
  }

  firstOpSelected(select) {
    console.log("In first")
    console.log(select);
    console.log(this.categories);
    console.log(this.addBudgetForm)
    this.firstSelected = false;
    this.secondSelected = false;
    // if (this.edit) {
    //   this.addBudgetForm.setValue({category: this.addBudgetForm.value.category, category2: '', 
    //     category3: '', amount: this.addBudgetForm.value.amount});
    // }
    this.addBudgetForm.setValue({category: this.addBudgetForm.value.category, category2: '', 
        category3: '', amount: this.addBudgetForm.value.amount});
    if (select[0] == " ") {
      select = select.substring(1, select.length-1)
    }
    console.log(select)
    console.log(this.categories)
    if (select in this.categories) {
      this.categories2 = this.categories[select];
      if (Object.keys(this.categories2).length > 0) {
        this.firstSelected = true;
      }
    }

    console.log("CATEGORIES 2: ", this.categories2)
    this.getMinMaxVals()
  }

  secondOpSelected(select) {
    console.log("In second")
    console.log(select);
    console.log(this.categories2);
    this.secondSelected = false;
    // if (this.edit) {
    //   this.addBudgetForm.setValue({category: this.addBudgetForm.value.category, category2: this.addBudgetForm.value.category2, 
    //     category3: '', amount: this.addBudgetForm.value.amount});
    // }
    this.addBudgetForm.setValue({category: this.addBudgetForm.value.category, category2: this.addBudgetForm.value.category2, 
      category3: '', amount: this.addBudgetForm.value.amount});
    if (select[0] == " ") {
      select = select.substring(1, select.length-1)
    }
    if (select in this.categories2) {
      this.categories3 = this.categories2[select];
      if (Object.keys(this.categories3).length > 0) {
        this.secondSelected = true;
      }
    }
    this.getMinMaxVals()
  }

  thirdOpSelected(select) {
    console.log(select);
    console.log(this.categories3);
    this.getMinMaxVals()
  }

}
