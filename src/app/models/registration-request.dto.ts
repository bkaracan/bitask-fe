export interface RegistrationRequestDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  jobTitleId: number;
  dateOfBirth?: string;
}
