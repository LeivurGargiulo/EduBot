/**
 * Enhanced Logging Utility
 * Provides structured logging with different levels and output formatting
 */

const fs = require('fs');
const path = require('path');

/**
 * Log Levels
 */
const LogLevels = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

/**
 * Log Level Names
 */
const LogLevelNames = {
    0: 'ERROR',
    1: 'WARN',
    2: 'INFO',
    3: 'DEBUG'
};

/**
 * Enhanced Logger Class
 */
class Logger {
    constructor(options = {}) {
        this.level = options.level || LogLevels.INFO;
        this.enableFileLogging = options.enableFileLogging || false;
        this.logDirectory = options.logDirectory || path.join(__dirname, '..', 'logs');
        this.maxLogFiles = options.maxLogFiles || 7;
        this.enableColors = options.enableColors !== false;
        
        // Create logs directory if file logging is enabled
        if (this.enableFileLogging) {
            this.ensureLogDirectory();
        }
    }

    /**
     * Ensure log directory exists
     */
    ensureLogDirectory() {
        try {
            if (!fs.existsSync(this.logDirectory)) {
                fs.mkdirSync(this.logDirectory, { recursive: true });
            }
        } catch (error) {
            console.error('Failed to create log directory:', error);
            this.enableFileLogging = false;
        }
    }

    /**
     * Get current log file path
     * @returns {string}
     */
    getCurrentLogFile() {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logDirectory, `bot-${date}.log`);
    }

    /**
     * Format log message
     * @param {number} level 
     * @param {string} message 
     * @param {Object} meta 
     * @returns {string}
     */
    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const levelName = LogLevelNames[level];
        const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
        
        return `[${timestamp}] ${levelName}: ${message}${metaString}`;
    }

    /**
     * Get color for log level (console output)
     * @param {number} level 
     * @returns {string}
     */
    getColorCode(level) {
        if (!this.enableColors) return '';
        
        const colors = {
            [LogLevels.ERROR]: '\x1b[31m', // Red
            [LogLevels.WARN]: '\x1b[33m',  // Yellow
            [LogLevels.INFO]: '\x1b[36m',  // Cyan
            [LogLevels.DEBUG]: '\x1b[37m'  // White
        };
        
        return colors[level] || '';
    }

    /**
     * Reset color code
     * @returns {string}
     */
    getResetCode() {
        return this.enableColors ? '\x1b[0m' : '';
    }

    /**
     * Write log to file
     * @param {string} formattedMessage 
     */
    writeToFile(formattedMessage) {
        if (!this.enableFileLogging) return;
        
        try {
            const logFile = this.getCurrentLogFile();
            fs.appendFileSync(logFile, formattedMessage + '\n');
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    /**
     * Clean old log files
     */
    cleanOldLogs() {
        if (!this.enableFileLogging) return;
        
        try {
            const files = fs.readdirSync(this.logDirectory)
                .filter(file => file.startsWith('bot-') && file.endsWith('.log'))
                .map(file => ({
                    name: file,
                    path: path.join(this.logDirectory, file),
                    mtime: fs.statSync(path.join(this.logDirectory, file)).mtime
                }))
                .sort((a, b) => b.mtime - a.mtime);

            // Keep only the most recent files
            const filesToDelete = files.slice(this.maxLogFiles);
            
            filesToDelete.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                    console.log(`🗑️  Deleted old log file: ${file.name}`);
                } catch (error) {
                    console.error(`Failed to delete log file ${file.name}:`, error);
                }
            });
        } catch (error) {
            console.error('Failed to clean old logs:', error);
        }
    }

    /**
     * Log message with specified level
     * @param {number} level 
     * @param {string} message 
     * @param {Object} meta 
     */
    log(level, message, meta = {}) {
        if (level > this.level) return;
        
        const formattedMessage = this.formatMessage(level, message, meta);
        const colorCode = this.getColorCode(level);
        const resetCode = this.getResetCode();
        
        // Console output with colors
        console.log(`${colorCode}${formattedMessage}${resetCode}`);
        
        // File output without colors
        this.writeToFile(formattedMessage);
    }

    /**
     * Error level logging
     * @param {string} message 
     * @param {Object} meta 
     */
    error(message, meta = {}) {
        this.log(LogLevels.ERROR, message, meta);
    }

    /**
     * Warning level logging
     * @param {string} message 
     * @param {Object} meta 
     */
    warn(message, meta = {}) {
        this.log(LogLevels.WARN, message, meta);
    }

    /**
     * Info level logging
     * @param {string} message 
     * @param {Object} meta 
     */
    info(message, meta = {}) {
        this.log(LogLevels.INFO, message, meta);
    }

    /**
     * Debug level logging
     * @param {string} message 
     * @param {Object} meta 
     */
    debug(message, meta = {}) {
        this.log(LogLevels.DEBUG, message, meta);
    }

    /**
     * Log command execution
     * @param {string} commandName 
     * @param {string} username 
     * @param {string} guildName 
     * @param {boolean} success 
     * @param {number} executionTime 
     */
    logCommand(commandName, username, guildName, success = true, executionTime = null) {
        const status = success ? '✅' : '❌';
        const timeInfo = executionTime ? ` (${executionTime}ms)` : '';
        const message = `${status} Command executed: /${commandName} by ${username} in ${guildName}${timeInfo}`;
        
        this.info(message, {
            type: 'command',
            command: commandName,
            user: username,
            guild: guildName,
            success,
            executionTime
        });
    }

    /**
     * Log bot events
     * @param {string} event 
     * @param {string} message 
     * @param {Object} meta 
     */
    logEvent(event, message, meta = {}) {
        this.info(`🎯 Event: ${event} - ${message}`, { type: 'event', event, ...meta });
    }

    /**
     * Log performance metrics
     * @param {string} operation 
     * @param {number} duration 
     * @param {Object} meta 
     */
    logPerformance(operation, duration, meta = {}) {
        const level = duration > 1000 ? LogLevels.WARN : LogLevels.INFO;
        const emoji = duration > 1000 ? '🐌' : '⚡';
        
        this.log(level, `${emoji} Performance: ${operation} took ${duration}ms`, {
            type: 'performance',
            operation,
            duration,
            ...meta
        });
    }

    /**
     * Log security events
     * @param {string} event 
     * @param {string} message 
     * @param {Object} meta 
     */
    logSecurity(event, message, meta = {}) {
        this.warn(`🔒 Security: ${event} - ${message}`, { type: 'security', event, ...meta });
    }

    /**
     * Set log level
     * @param {number} level 
     */
    setLevel(level) {
        this.level = level;
        this.info(`Log level set to: ${LogLevelNames[level]}`);
    }

    /**
     * Get current configuration
     * @returns {Object}
     */
    getConfig() {
        return {
            level: this.level,
            levelName: LogLevelNames[this.level],
            enableFileLogging: this.enableFileLogging,
            logDirectory: this.logDirectory,
            maxLogFiles: this.maxLogFiles,
            enableColors: this.enableColors
        };
    }
}

// Create default logger instance
const logger = new Logger({
    level: process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL) : LogLevels.INFO,
    enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
    enableColors: process.env.DISABLE_LOG_COLORS !== 'true'
});

// Clean old logs on startup
if (logger.enableFileLogging) {
    logger.cleanOldLogs();
}

module.exports = {
    Logger,
    LogLevels,
    LogLevelNames,
    logger
};