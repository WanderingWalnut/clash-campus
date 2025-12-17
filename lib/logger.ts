/**
 * Logger utility for server-side logging
 * 
 * Follows Next.js best practices:
 * - Structured logging with JSON output in production
 * - Human-readable output in development
 * - Automatic sensitive data masking
 * - Log levels: debug, info, warn, error
 * - Contextual metadata (timestamps, environment, etc.)
 * 
 * @example
 * ```ts
 * import { logger } from '@/lib/logger'
 * 
 * logger.info('User signed up', { userId: '123' })
 * logger.error('Database error', { error: err.message })
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
    [key: string]: unknown
}

interface LogEntry {
    level: LogLevel
    message: string
    context?: LogContext
    timestamp: string
    environment: string
}

class Logger {
    private readonly isDevelopment = process.env.NODE_ENV === 'development'
    private readonly isProduction = process.env.NODE_ENV === 'production'

    /**
     * Masks sensitive data in log context
     * - Emails: shows only prefix (user@***)
     * - Passwords: always masked
     * - Tokens: always masked
     */
    private maskSensitiveData(context: LogContext): LogContext {
        const masked = { ...context }
        const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authToken']

        for (const key in masked) {
            const lowerKey = key.toLowerCase()

            // Mask known sensitive keys
            if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
                masked[key] = '[REDACTED]'
                continue
            }

            // Mask email addresses (keep prefix for debugging)
            if (lowerKey.includes('email') && typeof masked[key] === 'string') {
                const email = masked[key] as string
                if (email.includes('@')) {
                    const [prefix] = email.split('@')
                    masked[key] = `${prefix}@***`
                }
            }
        }

        return masked
    }

    /**
     * Formats log entry for output
     */
    private formatLog(entry: LogEntry): string {
        const { level, message, context, timestamp, environment } = entry

        if (this.isDevelopment) {
            // Human-readable format for development
            const contextStr = context
                ? ` ${JSON.stringify(context, null, 2)}`
                : ''
            return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
        }

        // Structured JSON for production (easier to parse in log aggregators)
        return JSON.stringify({
            level: level.toUpperCase(),
            message,
            ...context,
            timestamp,
            environment,
        })
    }

    /**
     * Core logging method
     */
    private log(level: LogLevel, message: string, context?: LogContext) {
        const maskedContext = context ? this.maskSensitiveData(context) : undefined

        const entry: LogEntry = {
            level,
            message,
            context: maskedContext,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'unknown',
        }

        const formatted = this.formatLog(entry)

        // Use appropriate console method based on level
        switch (level) {
            case 'debug':
                if (this.isDevelopment) {
                    console.debug(formatted)
                }
                break
            case 'info':
                console.info(formatted)
                break
            case 'warn':
                console.warn(formatted)
                break
            case 'error':
                console.error(formatted)
                // In production, you might want to send to error tracking service here
                break
        }
    }

    /**
     * Debug logs - only shown in development
     */
    debug(message: string, context?: LogContext) {
        this.log('debug', message, context)
    }

    /**
     * Info logs - general information about application flow
     */
    info(message: string, context?: LogContext) {
        this.log('info', message, context)
    }

    /**
     * Warning logs - non-critical issues that should be investigated
     */
    warn(message: string, context?: LogContext) {
        this.log('warn', message, context)
    }

    /**
     * Error logs - errors that need attention
     */
    error(message: string, context?: LogContext) {
        this.log('error', message, context)
    }

    /**
     * Log errors with full stack trace
     */
    errorWithStack(message: string, error: Error, context?: LogContext) {
        this.error(message, {
            ...context,
            error: error.message,
            stack: error.stack,
            name: error.name,
        })
    }
}

// Export singleton instance
export const logger = new Logger()

