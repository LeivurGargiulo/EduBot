/**
 * Centralized Error Handler Utility
 * Provides comprehensive error handling and logging functionality
 */

const { EmbedBuilder } = require('discord.js');

/**
 * Error Types Enum
 */
const ErrorTypes = {
    DISCORD_API: 'DISCORD_API',
    PERMISSION: 'PERMISSION',
    VALIDATION: 'VALIDATION',
    DATABASE: 'DATABASE',
    NETWORK: 'NETWORK',
    UNKNOWN: 'UNKNOWN'
};

/**
 * Error Severity Levels
 */
const ErrorSeverity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
};

/**
 * Main Error Handler Class
 */
class ErrorHandler {
    constructor() {
        this.errorCounts = new Map();
        this.lastErrors = [];
        this.maxLastErrors = 50;
    }

    /**
     * Handle and log errors with appropriate responses
     * @param {Error} error - The error object
     * @param {Object} context - Context information (interaction, command, etc.)
     * @param {Object} options - Additional options
     */
    async handleError(error, context = {}, options = {}) {
        try {
            const errorInfo = this.analyzeError(error);
            const severity = this.determineSeverity(error, context);
            
            // Log the error
            this.logError(error, errorInfo, context, severity);
            
            // Track error statistics
            this.trackError(errorInfo.type);
            
            // Store in recent errors
            this.storeRecentError(error, context, errorInfo);
            
            // Send user response if interaction provided
            if (context.interaction && !options.skipUserResponse) {
                await this.sendUserErrorResponse(context.interaction, errorInfo, severity).catch(responseError => {
                    console.error('❌ Failed to send error response:', responseError);
                });
            }
            
            // Send to moderation channel if critical
            if (severity === ErrorSeverity.CRITICAL && context.interaction?.guild) {
                await this.sendModerationAlert(error, context, errorInfo).catch(alertError => {
                    console.error('❌ Failed to send moderation alert:', alertError);
                });
            }
            
            return errorInfo;
        } catch (handlingError) {
            console.error('❌ Critical error in error handler:', {
                originalError: error?.message,
                handlingError: handlingError?.message,
                stack: handlingError?.stack,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Analyze error to determine type and details
     * @param {Error} error 
     * @returns {Object} Error analysis
     */
    analyzeError(error) {
        const analysis = {
            type: ErrorTypes.UNKNOWN,
            code: error.code || null,
            message: error.message || 'Unknown error',
            stack: error.stack || null,
            isRetryable: false,
            userMessage: 'Se produjo un error inesperado.'
        };

        // Discord API errors
        if (error.code) {
            analysis.type = ErrorTypes.DISCORD_API;
            analysis.isRetryable = this.isRetryableDiscordError(error.code);
            analysis.userMessage = this.getDiscordErrorMessage(error.code);
        }
        // Permission errors
        else if (error.message.includes('permission') || error.message.includes('Missing Permissions')) {
            analysis.type = ErrorTypes.PERMISSION;
            analysis.userMessage = 'No hay permisos suficientes para realizar esta acción.';
        }
        // Validation errors
        else if (error.message.includes('validation') || error.message.includes('invalid')) {
            analysis.type = ErrorTypes.VALIDATION;
            analysis.userMessage = 'Los datos proporcionados no son válidos.';
        }
        // Network errors
        else if (error.message.includes('timeout') || error.message.includes('network') || error.code === 'ENOTFOUND') {
            analysis.type = ErrorTypes.NETWORK;
            analysis.isRetryable = true;
            analysis.userMessage = 'Error de conexión. Por favor, inténtalo de nuevo.';
        }

        return analysis;
    }

    /**
     * Determine error severity based on error and context
     * @param {Error} error 
     * @param {Object} context 
     * @returns {string} Severity level
     */
    determineSeverity(error, context) {
        // Critical errors
        if (error.message.includes('SIGTERM') || error.message.includes('SIGKILL')) {
            return ErrorSeverity.CRITICAL;
        }
        
        // High severity
        if (error.code === 50013 || error.code === 50001 || context.command?.data.name === 'deploy') {
            return ErrorSeverity.HIGH;
        }
        
        // Medium severity
        if (error.code || context.isModeration) {
            return ErrorSeverity.MEDIUM;
        }
        
        return ErrorSeverity.LOW;
    }

    /**
     * Log error with appropriate formatting
     * @param {Error} error 
     * @param {Object} errorInfo 
     * @param {Object} context 
     * @param {string} severity 
     */
    logError(error, errorInfo, context, severity) {
        const timestamp = new Date().toISOString();
        const severityIcon = this.getSeverityIcon(severity);
        
        const logData = {
            severity,
            type: errorInfo.type,
            code: errorInfo.code,
            message: errorInfo.message,
            user: context.interaction?.user.tag,
            userId: context.interaction?.user.id,
            guild: context.interaction?.guild?.name || 'DM',
            guildId: context.interaction?.guild?.id,
            channel: context.interaction?.channel?.name || 'Unknown',
            channelId: context.interaction?.channel?.id,
            command: context.command?.data.name,
            timestamp
        };

        console.error(`${severityIcon} [${timestamp}] ${severity} ERROR:`, logData);

        // Only log stack trace for high/critical errors to reduce noise
        if ((severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL) && errorInfo.stack) {
            console.error(`Stack trace:`, errorInfo.stack);
        }
    }

    /**
     * Track error statistics
     * @param {string} errorType 
     */
    trackError(errorType) {
        const count = this.errorCounts.get(errorType) || 0;
        this.errorCounts.set(errorType, count + 1);
    }

    /**
     * Store error in recent errors list
     * @param {Error} error 
     * @param {Object} context 
     * @param {Object} errorInfo 
     */
    storeRecentError(error, context, errorInfo) {
        const errorRecord = {
            timestamp: new Date(),
            type: errorInfo.type,
            code: errorInfo.code,
            message: errorInfo.message,
            user: context.interaction?.user.tag,
            command: context.command?.data.name,
            guild: context.interaction?.guild?.name
        };

        this.lastErrors.unshift(errorRecord);
        
        // Keep only the last N errors
        if (this.lastErrors.length > this.maxLastErrors) {
            this.lastErrors = this.lastErrors.slice(0, this.maxLastErrors);
        }
    }

    /**
     * Send user-friendly error response
     * @param {Interaction} interaction 
     * @param {Object} errorInfo 
     * @param {string} severity 
     */
    async sendUserErrorResponse(interaction, errorInfo, severity) {
        try {
            // Check if interaction is still valid
            if (!interaction || interaction.replied === undefined) {
                console.warn('⚠️ Invalid interaction object for error response');
                return;
            }

            const response = {
                content: `❌ ${errorInfo.userMessage}`,
                ephemeral: true
            };

            // Add retry suggestion for retryable errors
            if (errorInfo.isRetryable) {
                response.content += '\n💡 Puedes intentarlo de nuevo en unos momentos.';
            }

            // Add support contact for critical errors
            if (severity === ErrorSeverity.CRITICAL) {
                response.content += '\n🆘 Si el problema persiste, contacta al equipo de soporte.';
            }

            // Try different response methods with timeout
            const responsePromise = (async () => {
                if (interaction.replied || interaction.deferred) {
                    return await interaction.followUp(response);
                } else {
                    return await interaction.reply(response);
                }
            })();

            // Add timeout to prevent hanging
            await Promise.race([
                responsePromise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Response timeout')), 5000)
                )
            ]);

        } catch (responseError) {
            console.error('❌ Failed to send error response to user:', {
                error: responseError.message,
                interactionId: interaction?.id,
                userId: interaction?.user?.id,
                timestamp: new Date().toISOString()
            }
            );
        }
    }

    /**
     * Send alert to moderation channel for critical errors
     * @param {Error} error 
     * @param {Object} context 
     * @param {Object} errorInfo 
     */
    async sendModerationAlert(error, context, errorInfo) {
        try {
            if (!context.interaction?.guild) {
                return; // Can't send to moderation channel without guild
            }

            const modChannelId = context.interaction.client.configManager?.getModerationChannelId?.(context.interaction.guild.id) || 
                               process.env.MODERATION_CHANNEL_ID;
                               
            if (!modChannelId) return;

            const modChannel = context.interaction.guild.channels.cache.get(modChannelId);
            if (!modChannel) return;

            const alertEmbed = new EmbedBuilder()
                .setTitle('🚨 Error Crítico Detectado')
                .setColor(0xFF0000)
                .addFields(
                    { name: 'Tipo', value: errorInfo.type, inline: true },
                    { name: 'Código', value: errorInfo.code?.toString() || 'N/A', inline: true },
                    { name: 'Usuario', value: `${context.interaction.user.tag}\n(${context.interaction.user.id})`, inline: true },
                    { name: 'Comando', value: context.command?.data.name || 'N/A', inline: true },
                    { name: 'Canal', value: `${context.interaction.channel.name}\n(${context.interaction.channel.id})`, inline: true },
                    { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: 'Error', value: `\`\`\`${errorInfo.message.slice(0, 1000)}\`\`\``, inline: false }
                )
                .setTimestamp();

            await modChannel.send({ embeds: [alertEmbed] });
        } catch (alertError) {
            console.error('❌ Failed to send moderation alert:', {
                error: alertError.message,
                originalError: error.message,
                guildId: context.interaction?.guild?.id,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get user-friendly message for Discord API errors
     * @param {number} code 
     * @returns {string}
     */
    getDiscordErrorMessage(code) {
        const messages = {
            10062: 'Esta interacción ha expirado. Por favor, inténtalo de nuevo.',
            50013: 'El bot no tiene los permisos necesarios para realizar esta acción.',
            50001: 'El bot no tiene acceso a este recurso.',
            10008: 'El mensaje no fue encontrado.',
            10003: 'El canal no fue encontrado.',
            50035: 'Los datos proporcionados no son válidos.',
            10011: 'El rol no fue encontrado.',
            10013: 'El usuario no fue encontrado.',
            50033: 'Mensaje demasiado largo.',
            50034: 'Demasiados mensajes para eliminar a la vez.',
            30001: 'Límite de canales alcanzado.',
            30005: 'Límite de roles alcanzado.'
        };

        return messages[code] || 'Se produjo un error de Discord. Por favor, inténtalo de nuevo.';
    }

    /**
     * Check if Discord error is retryable
     * @param {number} code 
     * @returns {boolean}
     */
    isRetryableDiscordError(code) {
        const retryableCodes = [0, 502, 503, 504, 520, 521, 522, 523, 524];
        return retryableCodes.includes(code);
    }

    /**
     * Get severity icon for logging
     * @param {string} severity 
     * @returns {string}
     */
    getSeverityIcon(severity) {
        const icons = {
            [ErrorSeverity.LOW]: '🟡',
            [ErrorSeverity.MEDIUM]: '🟠',
            [ErrorSeverity.HIGH]: '🔴',
            [ErrorSeverity.CRITICAL]: '💀'
        };
        return icons[severity] || '❓';
    }

    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getErrorStats() {
        return {
            totalErrors: Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0),
            errorsByType: Object.fromEntries(this.errorCounts),
            recentErrors: this.lastErrors.slice(0, 10),
            lastErrorTime: this.lastErrors[0]?.timestamp || null
        };
    }

    /**
     * Clear error statistics
     */
    clearStats() {
        this.errorCounts.clear();
        this.lastErrors = [];
        console.log('📊 Error statistics cleared');
    }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

module.exports = {
    ErrorHandler,
    ErrorTypes,
    ErrorSeverity,
    errorHandler
};