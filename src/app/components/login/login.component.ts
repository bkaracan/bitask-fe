import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { AuthenticationRequestDTO } from '../../models/authentication-request.dto';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoginFailed: boolean = false;
  errorMessage: string = ''; // Hata mesajı için değişken

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const formData: AuthenticationRequestDTO = this.loginForm.value;
  
      this.authService.authenticate(formData).subscribe(
        response => {
          console.log('Login successful', response);
          if (response.success) {
            this.router.navigate(['/dashboard']); // Giriş başarılı olursa yönlendirme yap
          } else {
            this.isLoginFailed = true;
            this.errorMessage = response.message || 'An unexpected error occurred. Please try again.';
          }
        },
        error => {
          console.error('Login failed', error);
          if (error.status === 401) {
            this.isLoginFailed = true;
            this.errorMessage = 'Your email address or password is incorrect.';
          } else {
            this.errorMessage = 'An unexpected error occurred. Please try again.';
          }
        }
      );
    }
  }
  
  
}
