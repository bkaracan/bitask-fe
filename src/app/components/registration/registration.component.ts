import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobTitleService } from '../../services/job-title.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  jobTitles: any[] = [];
  displayModal: boolean = false; // Başlangıçta false olmalı
  isInvalidCode: boolean = false;
  activationCode: string = '';
  successModal: boolean = false;

  constructor(
    private fb: FormBuilder,
    private jobTitleService: JobTitleService,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      jobTitleId: [null, Validators.required],
      dateOfBirth: ['']
    });
  }

  ngOnInit(): void {
    this.jobTitleService.getJobTitles().subscribe(response => {
      if (response.success) {
        this.jobTitles = response.data.map((title: string, index: number) => ({
          label: title,
          value: index + 1
        }));
      }
    });
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      const formData = { ...this.registrationForm.value };

      if (formData.dateOfBirth) {
        const date = new Date(formData.dateOfBirth);
        formData.dateOfBirth = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      }

      this.authService.register(formData).subscribe(
        response => {
          console.log('Registration successful', response);
          this.displayModal = true;
        },
        error => {
          console.error('Registration failed', error);
        }
      );
    } else {
      // Form geçerli değilse, tüm alanlar dokunulmuş olarak işaretlenir ve hata mesajları gösterilir
      Object.keys(this.registrationForm.controls).forEach(field => {
        const control = this.registrationForm.get(field);
        if (control) {
          control.markAsTouched({ onlySelf: true });
        }
      });
    }
  }

  activateAccount() {
    this.authService.activateAccount(this.activationCode).subscribe(
      response => {
        if (response.success) {
          console.log('Account activated successfully', response);
          this.displayModal = false;
          this.successModal = true;
        } else {
          console.error('Account activation failed', response);
          this.isInvalidCode = true;
        }
      },
      error => {
        console.error('Account activation failed', error);
        this.isInvalidCode = true;
      }
    );
  }

  closeSuccessModal() {
    this.successModal = false;
    this.router.navigate(['/login']); // Login sayfasına yönlendirme
  }
}
