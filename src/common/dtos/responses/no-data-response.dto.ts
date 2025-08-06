export class NoDataResponse {
  success: boolean = true;
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
