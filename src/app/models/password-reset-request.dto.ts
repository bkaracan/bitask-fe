export class PasswordResetRequestDTO {
  constructor(public email: string, public newPassword: string) {}
}
