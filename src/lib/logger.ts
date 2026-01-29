export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    [key: string]: unknown;
}

const log = (level: LogLevel, message: string, context: Record<string, unknown> = {}) => {
    const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...context,
    };

    // In production, this would go to a log aggregator (Datadog, Splunk, etc.)
    // For now, we print structured JSON to stdout/stderr
    const stringified = JSON.stringify(entry);

    if (level === 'error') {
        console.error(stringified);
    } else {
        console.log(stringified);
    }
};

export const logger = {
    info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
    warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
    error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
    debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),
};
