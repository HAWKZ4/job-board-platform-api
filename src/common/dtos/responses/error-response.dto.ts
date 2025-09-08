export class ErrorResponse {
  success: boolean = false;
  message: string;
  error?: any; 

  constructor(message: string, error?: any) {
    this.message = message;
    this.error = error;
  }
}
