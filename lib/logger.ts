import 'server-only'

/**
 * Simple logger that uses console methods - automatically captured by Vercel
 * 
 * Features:
 * - Zero dependencies - uses native console methods
 * - Automatically captured by Vercel's built-in observability
 * - Sensitive data masking (passwords, tokens, emails)
 * - Structured JSON output for easy parsing
 * - Log levels: debug, info, warn, error
 * 
 * @example
 * ```ts
 * import { logger } from '@/lib/logger'
 * 
 * logger.info('User signed up', { userId: '123' })
 * logger.error('Database error', { error: err.message })
 * logger.errorWithStack('Unexpected error', err, { userId: '123' })
 * ```
 */

/**
 * Sensitive keys that should be masked in logs
 */
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'apiKey', 'authToken', 'accessToken', 'refreshToken']

/**
 * Masks sensitive data in log context
 * - Emails: shows only prefix (user@***)
 * - Passwords/tokens: always masked as [REDACTED]
 */
function maskSensitiveData(obj: Record<string, unknown>): Record<string, unknown> {
    const masked = { ...obj }

    for (const key in masked) {
        const lowerKey = key.toLowerCase()
        const value = masked[key]

        // Mask known sensitive keys
        if (SENSITIVE_KEYS.some(sk => lowerKey.includes(sk))) {
            masked[key] = '[REDACTED]'
            continue
        }

        // Mask email addresses (keep prefix for debugging)
        if (lowerKey.includes('email') && typeof value === 'string') {
            const email = value as string
            if (email.includes('@')) {
                const [prefix] = email.split('@')
                masked[key] = `${prefix}@***`
            }
        }

        // Recursively mask nested objects
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            masked[key] = maskSensitiveData(value as Record<string, unknown>)
        }
    }

    return masked
}

/**
 * Simple logger using console methods - automatically captured by Vercel
 * Vercel's observability dashboard automatically captures console.log/error
 */
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Format log entry for both development and production.
 * 
 * In development: readable format for terminal debugging
 * In production: structured JSON for Vercel observability dashboard
 * 
 * Both formats are logged - the format just changes for better readability
 * in each environment.
 */
function formatLog(level: string, message: string, context?: Record<string, unknown>) {
    const timestamp = new Date().toISOString()
    const logEntry = {
        level: level.toUpperCase(),
        message,
        timestamp,
        env: process.env.NODE_ENV || 'unknown',
        ...(context && { context }),
    }

    // In development, output readable format for easier terminal debugging
    if (isDevelopment) {
        const contextStr = context ? ` ${JSON.stringify(context, null, 2)}` : ''
        return `[${level.toUpperCase()}] ${message}${contextStr}`
    }

    // In production, output structured JSON for Vercel's observability dashboard
    // Vercel automatically captures console.log/error and parses JSON logs
    return JSON.stringify(logEntry)
}

/**
 * Logger wrapper using console methods with automatic sensitive data masking
 * All logs are automatically captured by Vercel's built-in observability
 */
class Logger {
    /**
     * Debug logs - only shown in development
     */
    debug(message: string, context?: Record<string, unknown>) {
        if (isDevelopment) {
            const masked = context ? maskSensitiveData(context) : undefined
            const formatted = formatLog('debug', message, masked)
            console.debug(formatted)
        }
    }

    /**
     * Info logs - general information about application flow
     */
    info(message: string, context?: Record<string, unknown>) {
        const masked = context ? maskSensitiveData(context) : undefined
        const formatted = formatLog('info', message, masked)
        console.log(formatted)
    }

    /**
     * Warning logs - non-critical issues that should be investigated
     */
    warn(message: string, context?: Record<string, unknown>) {
        const masked = context ? maskSensitiveData(context) : undefined
        const formatted = formatLog('warn', message, masked)
        console.warn(formatted)
    }

    /**
     * Error logs - errors that need attention
     */
    error(message: string, context?: Record<string, unknown>) {
        const masked = context ? maskSensitiveData(context) : undefined
        const formatted = formatLog('error', message, masked)
        console.error(formatted)
    }

    /**
     * Log errors with full stack trace
     */
    errorWithStack(message: string, error: Error, context?: Record<string, unknown>) {
        const masked = context ? maskSensitiveData(context) : undefined
        const logEntry = {
            level: 'ERROR',
            message,
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV || 'unknown',
            ...(masked && { context: masked }),
            err: {
                message: error.message,
                stack: error.stack,
                name: error.name,
            },
        }
        console.error(JSON.stringify(logEntry))
    }
}

// Export singleton instance
export const logger = new Logger()
