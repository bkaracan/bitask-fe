import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { PasswordResetRequestDTO } from '../../models/password-reset-request.dto'; // Import the DTO

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  passwordsDoNotMatch: boolean = false;
  passwordsMatch: boolean = false;
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      const newPassword = this.resetPasswordForm.get('newPassword')?.value;
      const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;

      if (newPassword === confirmPassword) {
        const passwordResetRequest = new PasswordResetRequestDTO(newPassword); // Use the DTO object

        this.authService.resetPassword(this.token, passwordResetRequest).subscribe(
          response => {
            console.log('Password reset successfully', response);
            this.router.navigate(['/login']);
          },
          error => {
            console.error('Password reset failed', error);
          }
        );
      } else {
        this.passwordsDoNotMatch = true;
        this.passwordsMatch = false;
      }
    }
  }

  checkPasswordMatch() {
    const newPassword = this.resetPasswordForm.get('newPassword')?.value;
    const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword === confirmPassword) {
      this.passwordsMatch = true;
      this.passwordsDoNotMatch = false;
    } else {
      this.passwordsDoNotMatch = true;
      this.passwordsMatch = false;
    }
  }
}
