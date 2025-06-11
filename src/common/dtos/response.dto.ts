// Use case of generics: You want to build something that works with any type
// (e.g., User, Product, string, etc.), but still have strong typing inside.
export class SuccessResponse<T> {
  success: boolean = true;
  message: string;
  data: T;

  constructor(message: string, data: T) {
    this.message = message;
    this.data = data;
  }
}
