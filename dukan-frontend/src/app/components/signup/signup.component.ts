import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      gender: ['', Validators.required],
      dob: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.signupForm.invalid || this.signupForm.value.password !== this.signupForm.value.confirmPassword) {
      this.errorMessage = 'Form is invalid or passwords do not match.';
      return;
    }

    const formData = this.signupForm.value;
    delete formData.confirmPassword;

    this.http.post('http://localhost:5000/api/auth/signup', formData)
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => this.errorMessage = err.error.message || 'Signup failed'
      });
  }
}
