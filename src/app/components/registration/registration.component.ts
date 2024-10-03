import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobTitleService } from '../../services/job-title.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  jobTitles: any[] = [];
  displayModal: boolean = false; // Başlangıçta false olmalı
  isInvalidCode: boolean = false;
  isExpiredCode: boolean = false;
  activationCode: string = '';
  successModal: boolean = false;
  showPasswordPopup: boolean = false;
  passwordsMatch: boolean = true; // Şifrelerin eşleşip eşleşmediğini takip eden flag
  emailExistsError: boolean = false; // E-mail'in zaten var olup olmadığını kontrol eden flag
  generalErrorMessage: string | null = null;
  countdown = 60;
  formattedCountdown: string = '01:00';
  countdownExpired: boolean = false;

  // Şifre validasyonu için kontroller
  passwordValidations = {
    hasMinLength: false,
    hasUppercase: false,
    hasSpecialChar: false,
  };

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
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required], // Retype Password alanı
      jobTitleId: [null, Validators.required], // Job Title zorunlu
      dateOfBirth: ['', Validators.required], // Doğum tarihi zorunlu
    });
  }

  ngOnInit(): void {
    this.jobTitleService.getJobTitles().subscribe((response) => {
      if (response.success) {
        this.jobTitles = response.data.map((title: string, index: number) => ({
          label: title,
          value: index + 1,
        }));
      }
    });

    // Şifre alanı her değiştiğinde kontrol işlemi yapılacak
    this.registrationForm.get('password')!.valueChanges.subscribe((value) => {
      this.checkPasswordStrength(value);
    });
  }

  // Şifre validasyonları
  checkPasswordStrength(password: string) {
    this.passwordValidations.hasMinLength = password.length >= 8;
    this.passwordValidations.hasUppercase = /[A-Z]/.test(password);
    this.passwordValidations.hasSpecialChar =
      /[!'^+=@#$%^&*(),.?"/_\£½:{}|<>|]/.test(password);
  }

  isPasswordValid(): boolean {
    return (
      this.passwordValidations.hasMinLength &&
      this.passwordValidations.hasUppercase &&
      this.passwordValidations.hasSpecialChar
    );
  }

  // Şifrelerin eşleşip eşleşmediğini kontrol eden metot
  checkPasswordMatch(): void {
    const password = this.registrationForm.get('password')?.value;
    const confirmPassword = this.registrationForm.get('confirmPassword')?.value;
    this.passwordsMatch = password === confirmPassword;
  }

  // Formun genel geçerliliğini kontrol eden metot
  isFormValid(): boolean {
    return (
      this.registrationForm.valid &&
      this.isPasswordValid() &&
      this.passwordsMatch
    );
  }

  onSubmit() {
    if (this.isFormValid()) {
      const formData = { ...this.registrationForm.value };

      if (formData.dateOfBirth) {
        const date = new Date(formData.dateOfBirth);
        formData.dateOfBirth = new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
        );
      }

      this.authService.register(formData).subscribe(
        (response) => {
          console.log('Registration successful', response);
          if (response.success) {
            // Başarılı ise aktivasyon kodu popup'ını göster
            this.displayModal = true;
            const val = setInterval(() => {
              this.countdown--;
              this.formattedCountdown = this.formatCountdown();
              if (this.countdown === 0) {
                clearInterval(val);
                this.countdownExpired = true;
              }
            }, 1000);
            this.emailExistsError = false;
            this.generalErrorMessage = null;
          } else if (
            response.code === 400 &&
            response.message === 'Email already exists!'
          ) {
            // Email zaten mevcutsa, emailExistsError flag'ini true yap ve hata mesajını göster
            this.emailExistsError = true;
            this.generalErrorMessage = response.message;
          } else {
            // Diğer genel hatalar için genel hata mesajı
            this.generalErrorMessage = 'Registration failed. Please try again.';
            console.error('Registration failed', response);
          }
        },
        (error) => {
          // API çağrısında bir hata olursa genel hata mesajını göster
          console.error('Error during registration', error);
          this.generalErrorMessage =
            'An error occurred. Please try again later.';
        }
      );
    } else {
      // Form geçerli değilse, tüm alanlar dokunulmuş olarak işaretlenir ve hata mesajları gösterilir
      Object.keys(this.registrationForm.controls).forEach((field) => {
        const control = this.registrationForm.get(field);
        if (control) {
          control.markAsTouched({ onlySelf: true });
        }
      });
    }
  }

  activateAccount() {
    if (this.activationCode.length !== 6) {
      this.isInvalidCode = true;
      this.isExpiredCode = false; // Eğer kod uzunluğu hatalıysa süresi dolmuş mesajını sıfırla
      return;
    }

    // Aktivasyon isteği
    this.authService.activateAccount(this.activationCode).subscribe(
      (response) => {
        // Eğer response success değilse, hataları burada yönetiyoruz
        if (!response.success) {
          const backendErrorMessage = response?.data?.error;

          // Token süresi dolmuşsa
          if (
            backendErrorMessage &&
            backendErrorMessage.includes('Activation token has expired')
          ) {
            this.isExpiredCode = true; // Süresi dolmuş kod için
            this.isInvalidCode = false; // Yanlış kod mesajını sıfırla
          } else {
            // Eğer başka bir hata mesajı gelmişse yanlış kod hatası göster
            this.isInvalidCode = true;
            this.isExpiredCode = false; // Süresi dolmuş mesajını sıfırla
          }
        } else {
          console.log('Account activated successfully', response);
          this.displayModal = false;
          this.isInvalidCode = false;
          this.isExpiredCode = false; // Başarılı olduğunda her iki hata durumunu da sıfırla
          this.successModal = true;

          // Başarı mesajından sonra login sayfasına yönlendir
          setTimeout(() => {
            this.closeSuccessModal();
          }, 3000);
        }
      },
      (error) => {
        console.error('Account activation failed', error);
        // Eğer network veya sunucuya ulaşamama gibi genel bir hata oluşursa buraya düşecektir.
        this.isInvalidCode = true;
        this.isExpiredCode = false;
      }
    );
  }

  closeSuccessModal() {
    this.successModal = false;
    this.router.navigate(['/login']); // Login sayfasına yönlendirme
  }

  formatCountdown(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }
}
