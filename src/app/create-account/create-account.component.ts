import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Router } from "@angular/router";
import { AuthService } from '../services/auth.service';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent implements OnInit {

  @ViewChild('createaccountform') createAccountFormDirective;

  createAccountForm: FormGroup;
  errMess: string;
  accountCreatedRef: any;
  isLoading = false;

  @ViewChild('pswdCheckboxText') pswdCheckboxText;

  constructor(private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public dialog: MatDialog) { 
    this.createForm();
  }

  formErrors = {
    'email': '',
    'password': '',
    'firstname': '',
    'lastname': '',
    'username': ''
  };

  validationMessages = {
    'email': {
      'required':      'Email is required.',
      'email':         'Email not in valid format.'
    },
    'password': {
      'required':      'Password is required.'
    },
    'firstname': {
      'required':      'First name is required.'
    },
    'lastname': {
      'required':      'Last name is required.'
    },
    'username': {
      'required':      'Username is required.'
    },
  };

  ngOnInit() {
    this.gotoTop()
  }

  createForm() {
    this.createAccountForm = this.fb.group({
      email: ['', [Validators.required, Validators.email] ],
      password: ['', [Validators.required] ],
      firstname: ['', [Validators.required] ],
      lastname: ['', [Validators.required] ],
      username: ['', [Validators.required] ]
    });

    this.createAccountForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now

  }

  onValueChanged(data?: any) {
    if (!this.createAccountForm) { return; }
    const form = this.createAccountForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
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

  onSubmit() {
    // this.feedback = this.feedbackForm.value;
    this.isLoading = true;
    console.log("User account getting created: ", this.createAccountForm.value);
    var user = this.createAccountForm.value;
    this.authService.signUp(user).subscribe(res => {
      this.isLoading = false;
      if (res.success) {
        this.accountCreatedRef = this.dialog.open(SuccessDialogComponent, {data: {username: this.createAccountForm.value.username}});
        this.accountCreatedRef.componentInstance.onClose
          .subscribe(result => {
            this.accountCreatedRef.close()
            this.router.navigate(['/login']);
          })
      }
    },
      error => {
        this.isLoading = false;
      }
    );

    // this.createAccountFormDirective.resetForm();
    //         this.createAccountForm.reset({
    //           email: '',
    //           password: '',
    //           firstname: '',
    //           lastname: '',
    //           username: ''
    //         });
  }

  gotoTop() {
    var scrollElem= document.querySelector('#moveTop');
    scrollElem.scrollIntoView();  
   }

   togglePasswordShow() {
    var x = this.pswdCheckboxText.nativeElement
    console.log(x)
    if (this.pswdCheckboxText.nativeElement.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

}
