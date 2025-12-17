/**
 * Logger utility using Pino - industry-standard structured logging
 * 
 * Features:
 * - Fast async logging (Pino is one of the fastest Node.js loggers)
 * - Structured JSON output in production (easy to parse/aggregate)
 * - Pretty-printed output in development (human-readable)
 * - Automatic sensitive data masking
 * - Log levels: debug, info, warn, error
 * - Next.js optimized configuration
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

import pino from 'pino'

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
 * Create Pino logger instance
 * - Development: Pretty-printed, human-readable output
 * - Production: Structured JSON output (for log aggregators)
 */
const isDevelopment = process.env.NODE_ENV === 'development'

const pinoLogger = pino({
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss.l',
                ignore: 'pid,hostname',
                singleLine: false,
            },
        }
        : undefined, // Production uses default JSON output
    base: {
        env: process.env.NODE_ENV || 'unknown',
    },
    formatters: {
        level: (label: string) => {
            return { level: label.toUpperCase() }
        },
    },
})

/**
 * Logger wrapper that maintains the same API as before
 * but uses Pino under the hood with automatic sensitive data masking
 */
class Logger {
    /**
     * Debug logs - only shown in development
     */
    debug(message: string, context?: Record<string, unknown>) {
        if (isDevelopment) {
            const masked = context ? maskSensitiveData(context) : undefined
            pinoLogger.debug(masked, message)
        }
    }

    /**
     * Info logs - general information about application flow
     */
    info(message: string, context?: Record<string, unknown>) {
        const masked = context ? maskSensitiveData(context) : undefined
        pinoLogger.info(masked, message)
    }

    /**
     * Warning logs - non-critical issues that should be investigated
     */
    warn(message: string, context?: Record<string, unknown>) {
        const masked = context ? maskSensitiveData(context) : undefined
        pinoLogger.warn(masked, message)
    }

    /**
     * Error logs - errors that need attention
     */
    error(message: string, context?: Record<string, unknown>) {
        const masked = context ? maskSensitiveData(context) : undefined
        pinoLogger.error(masked, message)
    }

    /**
     * Log errors with full stack trace
     */
    errorWithStack(message: string, error: Error, context?: Record<string, unknown>) {
        const masked = context ? maskSensitiveData(context) : undefined
        pinoLogger.error(
            {
                ...masked,
                err: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                },
            },
            message
        )
    }
}

// Export singleton instance
export const logger = new Logger()
