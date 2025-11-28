// src/lib/utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogData {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, data?: LogData): void {
    if (!this.isDevelopment && level === 'debug') {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        console.error(prefix, message, data);
        // TODO: In production, send to error tracking service (Sentry, LogRocket, etc.)
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'info':
        if (this.isDevelopment) {
          console.info(prefix, message, data);
        }
        break;
      case 'debug':
        console.log(prefix, message, data);
        break;
    }
  }

  debug(message: string, data?: LogData): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: LogData): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogData): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: LogData): void {
    this.log('error', message, data);
  }
}

export const logger = new Logger();
