import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @ViewChild('loginform') loginFormDirective;

  loginForm: FormGroup;
  errMess: string;

  constructor(private fb: FormBuilder,
    private router: Router,
    private authService: AuthService) { 
    this.createForm();
  }

  formErrors = {
    'email': '',
    'password': '',
  };

  validationMessages = {
    'email': {
      'required':      'Email is required.',
      'email':         'Email not in valid format.'
    },
    'password': {
      'required':      'Password is required.'
    },
  };

  ngOnInit() {
  }

  createForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email] ],
      password: ['', [Validators.required] ]
    });

    this.loginForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now

  }

  onValueChanged(data?: any) {
    if (!this.loginForm) { return; }
    const form = this.loginForm;
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
    console.log("User logging in: ", this.loginForm.value);
    var user = this.loginForm.value;
    this.authService.logIn(user).subscribe(res => {
      if (res.success) {
        this.router.navigate(['/home']);
      }
      else {
        console.log(res)
        console.log("Login method from auth service was not a success")
      }
    },
    error => {
      console.log(error);
      this.errMess = error;
    });
    // if (credentials.email === "email@email" && credentials.password === "password") {
    //   // [routerLink]="['/dishdetail', dish.id]"
    //   this.router.navigate(['/home']);
    // }
    this.loginFormDirective.resetForm();
    this.loginForm.reset({
      email: '',
      password: ''
    });
  }

}
