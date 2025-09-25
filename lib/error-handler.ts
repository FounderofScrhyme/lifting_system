import { toast } from "sonner";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class ErrorHandler {
  static handle(
    error: unknown,
    defaultMessage: string = "エラーが発生しました"
  ): ApiError {
    if (error instanceof Error) {
      return {
        message: error.message,
      };
    }

    if (typeof error === "object" && error !== null && "response" in error) {
      const axiosError = error as any;
      const status = axiosError.response?.status;
      const message =
        axiosError.response?.data?.error ||
        axiosError.message ||
        defaultMessage;

      return {
        message,
        status,
        code: axiosError.code,
      };
    }

    return {
      message: defaultMessage,
    };
  }

  static showError(
    error: unknown,
    defaultMessage: string = "エラーが発生しました"
  ): void {
    const apiError = this.handle(error, defaultMessage);
    toast.error(apiError.message);
  }

  static showSuccess(message: string): void {
    toast.success(message);
  }

  static showInfo(message: string): void {
    toast.info(message);
  }
}
