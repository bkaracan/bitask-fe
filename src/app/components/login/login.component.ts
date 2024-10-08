import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { noWhitespaceValidator } from '../../validators/no-whitespace.validator';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoginFailed: boolean = false;
  errorMessage: string = '';
  emailForReset: string = '';
  resetCode: string = '';
  showForgotPasswordPopup: boolean = false;
  codeSent: boolean = false;
  showCodeVerification: boolean = false;
  isCodeIncorrect: boolean = false;
  isCodeCorrect: boolean = false;
  passwordResetSuccessMessage: string = '';
  countdown: number = 60;
  formattedCountdown: string = '01:00';
  countdownExpired: boolean = true;
  private countdownInterval: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthenticationService,
    private readonly router: Router
  ) {
    this.loginForm = this.fb.group({
      email: [
        '',
        [Validators.required, Validators.email, noWhitespaceValidator()],
      ],
      password: [
        '',
        [Validators.required, Validators.minLength(8), noWhitespaceValidator()],
      ],
    });
  }

  startCountdown(): void {
    this.countdown = 60;
    this.countdownExpired = false;
    this.formattedCountdown = this.formatCountdown();
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      this.formattedCountdown = this.formatCountdown();
      if (this.countdown === 0) {
        clearInterval(this.countdownInterval);
        this.countdownExpired = true;
      }
    }, 1000);
  }

  stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  formatCountdown(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      // Trim the input values
      const formData = {
        email: this.loginForm.value.email.trim(),
        password: this.loginForm.value.password.trim(),
      };

      this.authService.authenticate(formData).subscribe(
        (response: any) => {
          if (response.success) {
            // Token'ı localStorage'a kaydet
            localStorage.setItem('jwtToken', response.data.token);
            this.router.navigate(['/dashboard']);
          } else {
            this.isLoginFailed = true;
            this.errorMessage =
              response.message || 'An unexpected error occurred.';
          }
        },
        (error: any) => {
          this.isLoginFailed = true;
          this.errorMessage = 'Your email or password is incorrect.';
        }
      );
    } else {
      // Mark all controls as touched to trigger validation messages
      this.loginForm.markAllAsTouched();
    }
  }

  sendResetCode(): void {
    if (this.emailForReset) {
      this.authService.sendResetPasswordCode(this.emailForReset).subscribe(
        (response: any) => {
          this.codeSent = true;
          this.showCodeVerification = true;
          this.startCountdown();
        },
        (error: any) => {
          this.passwordResetSuccessMessage =
            'Failed to send password reset code. Please try again.';
        }
      );
    }
  }

  verifyCode(): void {
    this.authService
      .verifyResetCode(this.emailForReset, this.resetCode)
      .subscribe(
        (response: any) => {
          if (response.success) {
            this.isCodeCorrect = true;
            this.isCodeIncorrect = false;
            this.errorMessage = '';
            setTimeout(() => {
              this.router.navigate(['/reset-password'], {
                queryParams: {
                  token: this.resetCode,
                  email: this.emailForReset,
                },
              });
            }, 2000);
          } else {
            this.isCodeIncorrect = true;
            this.isCodeCorrect = false;
            this.errorMessage =
              response.message || 'Incorrect reset code. Please try again.';
          }
        },
        (error: any) => {
          this.isCodeIncorrect = true;
          this.isCodeCorrect = false;
          this.errorMessage =
            'Reset code verification failed. Please try again.';
        }
      );
  }

  openForgotPasswordPopup(event: Event): void {
    event.preventDefault();
    this.showForgotPasswordPopup = true;
  }
}
