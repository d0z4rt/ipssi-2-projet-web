export type ErrorResponse = {
  statusCode?: number | null
  error: string
  // used for zod validation errors
  details?: string | null
}
