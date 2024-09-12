import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
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

  onSubmit(): void {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;

      this.authService.authenticate(formData).subscribe(
        (response: any) => {
          if (response.success) {
            // Başarılı giriş
          } else {
            this.isLoginFailed = true;
            this.errorMessage = response.message || 'An unexpected error occurred.';
          }
        },
        (error: any) => {
          this.isLoginFailed = true;
          this.errorMessage = 'Your email or password is incorrect.';
        }
      );
    }
  }

  // Reset kodu göndermek için kullanılacak metod
  sendResetCode(): void {
    if (this.emailForReset) {
      this.authService.sendResetPasswordCode(this.emailForReset).subscribe(
        (response: any) => {
          this.codeSent = true;
          this.showCodeVerification = true; // Şifre sıfırlama kodu alanını göster
        },
        (error: any) => {
          this.passwordResetSuccessMessage = 'Failed to send password reset code. Please try again.';
        }
      );
    }
  }

  // Kullanıcıdan gelen kodu doğrulama işlemi
  verifyCode(): void {
    this.authService.verifyResetCode(this.emailForReset, this.resetCode).subscribe(
      (response: any) => {
        console.log(response);  // Response'u görmek için log ekledik
        // success alanını kontrol ediyoruz
        if (response.success) {  // Backend'den success true dönüyor mu?
          this.isCodeCorrect = true;
          setTimeout(() => {
            this.router.navigate(['/reset-password']); // Şifre sıfırlama ekranına yönlendir
          }, 2000); // 2 saniye sonra yönlendirme
        } else {
          this.isCodeIncorrect = true;
          console.error("Incorrect reset code");
        }
      },
      (error: any) => {
        this.isCodeIncorrect = true;
        console.error("Reset code verification failed", error);
      }
    );
}




  openForgotPasswordPopup(event: Event): void {
    event.preventDefault();
    this.showForgotPasswordPopup = true;
  }
}
