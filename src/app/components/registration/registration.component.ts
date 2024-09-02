import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  displayModal: boolean = false;
  isInvalidCode: boolean = false;
  successModal: boolean = false;
  activationCode: string = '';

  constructor(private fb: FormBuilder, private jobTitleService: JobTitleService, private authService: AuthenticationService) {
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
    }
  }

  activateAccount() {
    this.authService.activateAccount(this.activationCode).subscribe(
      response => {
        if (response.success) {
          console.log('Account activated successfully', response);
          this.displayModal = false;
          this.isInvalidCode = false;
          this.successModal = true; // Başarı pop-up'ını göster
        } else {
          this.isInvalidCode = true;
        }
      },
      error => {
        console.error('Account activation failed', error);
        this.isInvalidCode = true; // Yanlış kod girildiğinde hata mesajını ve kırmızı çerçeveyi göster
      }
    );
  }

  closeSuccessModal() {
    this.successModal = false;
  }
  
  
}
