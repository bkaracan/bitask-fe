import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  passwordsDoNotMatch: boolean = false;
  token: string = '';
  email: string = '';
  showPasswordCriteria: boolean = false;
  passwordValidations = {
    minLength: false,
    uppercase: false,
    specialChar: false,
  };
  showSuccessPopup: boolean = false;
  errorMessage: string = '';  // Hata mesajını göstermek için

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });

    // URL'den token ve email'i alma
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.email = this.route.snapshot.queryParamMap.get('email') || ''; // Email'i de URL'den alıyoruz
    console.log('Token:', this.token);
    console.log('Email:', this.email);

  }

  onSubmit() {
    if (this.resetPasswordForm.valid && this.isPasswordValid() && !this.passwordsDoNotMatch) {
      const newPassword = this.resetPasswordForm.get('newPassword')?.value;
  
      const passwordResetRequest = {
        email: this.email,  // URL'den aldığımız email
        newPassword: newPassword,
      };
  
      // Şifre sıfırlama isteği
      this.authService.resetPassword(this.token, passwordResetRequest).subscribe(
        (response) => {
          if (response.success) {
            console.log('Password reset successfully', response);
            this.showSuccessPopup = true;
            setTimeout(() => {
              this.showSuccessPopup = false;
              this.router.navigate(['/login']);
            }, 2000); // 2 saniye sonra login sayfasına yönlendir
          } else {
            // Başarısız durumda hata mesajını göster
            this.errorMessage = response.message || 'An error occurred while resetting password.';
             // Hata mesajının 3 saniye sonra kaybolmasını sağla
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000); 
          }
        },
        (error) => {
          // Backend'den gelen hata mesajını işleyin
          console.error('Password reset failed', error);
          this.errorMessage = error.error?.message || 'An unexpected error occurred. Please try again.';
        }
      );
    } else {
      this.passwordsDoNotMatch = true;
    }
  }
  

  checkPasswordMatch() {
    const newPassword = this.resetPasswordForm.get('newPassword')?.value;
    const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;

    this.passwordsDoNotMatch = newPassword !== confirmPassword;
  }

  validatePassword() {
    const password = this.resetPasswordForm.get('newPassword')?.value || '';

    // En az 8 karakter kontrolü
    this.passwordValidations.minLength = password.length >= 8;

    // En az bir büyük harf kontrolü
    this.passwordValidations.uppercase = /[A-Z]/.test(password);

    // En az bir özel karakter kontrolü
    this.passwordValidations.specialChar = /[!+@#$%^&*(),.?":{}|<>]/.test(password);

    // Şifreler eşleşiyor mu kontrol et
    this.checkPasswordMatch();
  }

  isPasswordValid(): boolean {
    return (
      this.passwordValidations.minLength &&
      this.passwordValidations.uppercase &&
      this.passwordValidations.specialChar
    );
  }
}
