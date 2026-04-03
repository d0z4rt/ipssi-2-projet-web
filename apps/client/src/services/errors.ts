import axios from 'axios'

export const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    const responseError = error.response?.data as
      | { error?: string; details?: string }
      | undefined
    return (
      responseError?.error ||
      responseError?.details ||
      error.message ||
      fallbackMessage
    )
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallbackMessage
}
