export class ErrorResponse {
  success: boolean = false;
  message: string;
  error?: any; // Additional error details

  constructor(message: string, error?: any) {
    this.message = message;
    this.error = error;
  }
}
