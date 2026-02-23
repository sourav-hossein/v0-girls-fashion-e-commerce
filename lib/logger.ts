type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: unknown
  stack?: string
}

const isDevelopment = process.env.NODE_ENV === 'development'

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 100

  private createEntry(level: LogLevel, message: string, data?: unknown, stack?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      stack,
    }
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  debug(message: string, data?: unknown) {
    const entry = this.createEntry('debug', message, data)
    this.addLog(entry)
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, data)
    }
  }

  info(message: string, data?: unknown) {
    const entry = this.createEntry('info', message, data)
    this.addLog(entry)
    console.log(`[INFO] ${message}`, data)
  }

  warn(message: string, data?: unknown) {
    const entry = this.createEntry('warn', message, data)
    this.addLog(entry)
    console.warn(`[WARN] ${message}`, data)
  }

  error(message: string, error?: unknown) {
    const stack = error instanceof Error ? error.stack : undefined
    const entry = this.createEntry('error', message, error, stack)
    this.addLog(entry)
    console.error(`[ERROR] ${message}`, error)
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }
}

export const logger = new Logger()
