// oxlint-disable no-console
import colors from 'picocolors'

type LoggerOptions = {
  prefix?: string
  timestamp?: boolean
}

let timeFormatter: Intl.DateTimeFormat
const getTimeFormatter = () => {
  timeFormatter ??= new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  })
  return timeFormatter
}

export const logger = {
  log: (message: string, ...args: any[]) =>
    console.log(colors.gray(`${message}`), ...args),
  debug: (message: string, ...args: any[]) =>
    console.debug(colors.cyan(`[DEBUG] ${message}`), ...args),
  http: (message: string, ...args: any[]) =>
    console.log(colors.green(`[HTTP] ${message}`), ...args),
  warn: (message: string, ...args: any[]) =>
    console.warn(colors.yellow(`[WARN] ${message}`), ...args),
  error: (message: string, ...args: any[]) =>
    console.error(colors.red(`[ERROR] ${message}`), ...args)
}

export const createLogger = (options: LoggerOptions = {}) => {
  const { prefix, timestamp } = options

  const timestampPrefix = timestamp
    ? `${getTimeFormatter().format(new Date())} `
    : ''
  const prefixMessage = prefix ? `[${prefix}] ` : ''

  const logger = {
    log: (message: string, ...args: any[]) =>
      console.log(
        colors.gray(`${timestampPrefix}${prefixMessage}${message}`),
        ...args
      ),
    debug: (message: string, ...args: any[]) =>
      console.debug(
        colors.cyan(`${timestampPrefix}${prefixMessage}${message}`),
        ...args
      ),
    warn: (message: string, ...args: any[]) =>
      console.warn(
        colors.yellow(`${timestampPrefix}${prefixMessage}${message}`),
        ...args
      ),
    error: (message: string, ...args: any[]) =>
      console.error(
        colors.red(`${timestampPrefix}${prefixMessage}${message}`),
        ...args
      )
  }

  return logger
}

export default createLogger()
