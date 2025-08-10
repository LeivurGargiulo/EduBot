/**
 * Enhanced Debug Manager Utility
 * Provides comprehensive debugging, monitoring, and troubleshooting capabilities
 */

const { EmbedBuilder } = require('discord.js');
const { logger } = require('./logger');
const os = require('os');
const process = require('process');

/**
 * Debug Levels
 */
const DebugLevels = {
    NONE: 0,
    BASIC: 1,
    DETAILED: 2,
    VERBOSE: 3
};

/**
 * Performance Metrics
 */
class PerformanceMetrics {
    constructor() {
        this.metrics = new Map();
        this.startTime = Date.now();
        this.uptime = 0;
        this.commandExecutions = 0;
        this.errors = 0;
        this.memoryUsage = [];
        this.responseTimes = [];
    }

    /**
     * Record command execution
     * @param {string} commandName 
     * @param {number} executionTime 
     * @param {boolean} success 
     */
    recordCommand(commandName, executionTime, success = true) {
        this.commandExecutions++;
        if (!success) this.errors++;
        
        this.responseTimes.push(executionTime);
        
        // Keep only last 100 response times
        if (this.responseTimes.length > 100) {
            this.responseTimes.shift();
        }
        
        // Track per-command metrics
        if (!this.metrics.has(commandName)) {
            this.metrics.set(commandName, {
                executions: 0,
                totalTime: 0,
                errors: 0,
                avgTime: 0
            });
        }
        
        const cmdMetrics = this.metrics.get(commandName);
        cmdMetrics.executions++;
        cmdMetrics.totalTime += executionTime;
        cmdMetrics.avgTime = cmdMetrics.totalTime / cmdMetrics.executions;
        if (!success) cmdMetrics.errors++;
    }

    /**
     * Record memory usage
     */
    recordMemoryUsage() {
        const memUsage = process.memoryUsage();
        this.memoryUsage.push({
            timestamp: Date.now(),
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external,
            rss: memUsage.rss
        });
        
        // Keep only last 50 memory readings
        if (this.memoryUsage.length > 50) {
            this.memoryUsage.shift();
        }
    }

    /**
     * Get performance summary
     * @returns {Object}
     */
    getSummary() {
        this.uptime = Date.now() - this.startTime;
        
        const avgResponseTime = this.responseTimes.length > 0 
            ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
            : 0;
        
        const latestMemory = this.memoryUsage.length > 0 
            ? this.memoryUsage[this.memoryUsage.length - 1] 
            : process.memoryUsage();
        
        return {
            uptime: this.uptime,
            commandExecutions: this.commandExecutions,
            errors: this.errors,
            successRate: this.commandExecutions > 0 
                ? ((this.commandExecutions - this.errors) / this.commandExecutions * 100).toFixed(2) 
                : 100,
            avgResponseTime: avgResponseTime.toFixed(2),
            memoryUsage: {
                heapUsed: Math.round(latestMemory.heapUsed / 1024 / 1024),
                heapTotal: Math.round(latestMemory.heapTotal / 1024 / 1024),
                external: Math.round(latestMemory.external / 1024 / 1024),
                rss: Math.round(latestMemory.rss / 1024 / 1024)
            },
            topCommands: this.getTopCommands()
        };
    }

    /**
     * Get top commands by usage
     * @returns {Array}
     */
    getTopCommands() {
        return Array.from(this.metrics.entries())
            .map(([name, metrics]) => ({
                name,
                executions: metrics.executions,
                avgTime: metrics.avgTime,
                errors: metrics.errors
            }))
            .sort((a, b) => b.executions - a.executions)
            .slice(0, 10);
    }

    /**
     * Reset metrics
     */
    reset() {
        this.metrics.clear();
        this.commandExecutions = 0;
        this.errors = 0;
        this.responseTimes = [];
        this.memoryUsage = [];
        this.startTime = Date.now();
    }
}

/**
 * Main Debug Manager Class
 */
class DebugManager {
    constructor(client) {
        this.client = client;
        this.debugLevel = DebugLevels.BASIC;
        this.performanceMetrics = new PerformanceMetrics();
        this.debugMode = false;
        this.loggedErrors = [];
        this.maxLoggedErrors = 100;
        
        // Start memory monitoring
        this.startMemoryMonitoring();
    }

    /**
     * Set debug level
     * @param {number} level 
     */
    setDebugLevel(level) {
        this.debugLevel = level;
        logger.info(`Debug level set to: ${level}`, { debugLevel: level });
    }

    /**
     * Enable/disable debug mode
     * @param {boolean} enabled 
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        logger.info(`Debug mode ${enabled ? 'enabled' : 'disabled'}`, { debugMode: enabled });
    }

    /**
     * Start memory monitoring
     */
    startMemoryMonitoring() {
        setInterval(() => {
            this.performanceMetrics.recordMemoryUsage();
            
            // Log high memory usage
            const memUsage = process.memoryUsage();
            const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
            
            if (heapUsedMB > 500) {
                logger.warn(`High memory usage detected: ${heapUsedMB}MB`, {
                    memoryUsage: heapUsedMB,
                    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                    rss: Math.round(memUsage.rss / 1024 / 1024)
                });
            }
        }, 30000); // Every 30 seconds
    }

    /**
     * Log command execution
     * @param {string} commandName 
     * @param {number} executionTime 
     * @param {boolean} success 
     * @param {Object} context 
     */
    logCommandExecution(commandName, executionTime, success, context = {}) {
        this.performanceMetrics.recordCommand(commandName, executionTime, success);
        
        if (this.debugMode || this.debugLevel >= DebugLevels.DETAILED) {
            const status = success ? '✅' : '❌';
            const timeInfo = executionTime > 1000 ? '🐌' : '⚡';
            
            logger.debug(`${status} Command: /${commandName} (${executionTime}ms) ${timeInfo}`, {
                command: commandName,
                executionTime,
                success,
                user: context.user?.tag,
                guild: context.guild?.name,
                channel: context.channel?.name
            });
        }
    }

    /**
     * Log error with context
     * @param {Error} error 
     * @param {Object} context 
     */
    logError(error, context = {}) {
        // Store error for debugging
        const errorRecord = {
            timestamp: new Date(),
            message: error.message,
            stack: error.stack,
            code: error.code,
            context: {
                command: context.command?.data?.name,
                user: context.user?.tag,
                guild: context.guild?.name,
                channel: context.channel?.name
            }
        };
        
        this.loggedErrors.unshift(errorRecord);
        
        // Keep only recent errors
        if (this.loggedErrors.length > this.maxLoggedErrors) {
            this.loggedErrors = this.loggedErrors.slice(0, this.maxLoggedErrors);
        }
        
        if (this.debugMode || this.debugLevel >= DebugLevels.DETAILED) {
            logger.error(`Debug Error: ${error.message}`, {
                error: error.message,
                code: error.code,
                stack: error.stack,
                context: errorRecord.context
            });
        }
    }

    /**
     * Get system information
     * @returns {Object}
     */
    getSystemInfo() {
        return {
            platform: os.platform(),
            arch: os.arch(),
            nodeVersion: process.version,
            discordJsVersion: require('discord.js').version,
            uptime: process.uptime(),
            memory: {
                heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                external: Math.round(process.memoryUsage().external / 1024 / 1024),
                rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
            },
            cpu: {
                cores: os.cpus().length,
                load: os.loadavg()
            },
            network: {
                interfaces: Object.keys(os.networkInterfaces())
            }
        };
    }

    /**
     * Get bot status information
     * @returns {Object}
     */
    getBotStatus() {
        if (!this.client) return null;
        
        return {
            ready: this.client.isReady(),
            guilds: this.client.guilds.cache.size,
            users: this.client.users.cache.size,
            channels: this.client.channels.cache.size,
            wsStatus: this.client.ws.status,
            ping: this.client.ws.ping,
            uptime: this.client.uptime,
            commands: this.client.commands?.size || 0
        };
    }

    /**
     * Create debug embed
     * @param {string} type 
     * @returns {EmbedBuilder}
     */
    createDebugEmbed(type = 'general') {
        const embed = new EmbedBuilder()
            .setTitle('🔍 Bot Debug Information')
            .setColor(0x0099FF)
            .setTimestamp();

        switch (type) {
            case 'performance':
                const perf = this.performanceMetrics.getSummary();
                embed.setTitle('⚡ Performance Metrics')
                    .addFields(
                        { name: 'Uptime', value: `${Math.round(perf.uptime / 1000 / 60)} minutes`, inline: true },
                        { name: 'Commands Executed', value: perf.commandExecutions.toString(), inline: true },
                        { name: 'Success Rate', value: `${perf.successRate}%`, inline: true },
                        { name: 'Avg Response Time', value: `${perf.avgResponseTime}ms`, inline: true },
                        { name: 'Memory Usage', value: `${perf.memoryUsage.heapUsed}MB / ${perf.memoryUsage.heapTotal}MB`, inline: true },
                        { name: 'Errors', value: perf.errors.toString(), inline: true }
                    );
                break;

            case 'system':
                const sysInfo = this.getSystemInfo();
                embed.setTitle('🖥️ System Information')
                    .addFields(
                        { name: 'Platform', value: sysInfo.platform, inline: true },
                        { name: 'Architecture', value: sysInfo.arch, inline: true },
                        { name: 'Node.js Version', value: sysInfo.nodeVersion, inline: true },
                        { name: 'Discord.js Version', value: sysInfo.discordJsVersion, inline: true },
                        { name: 'CPU Cores', value: sysInfo.cpu.cores.toString(), inline: true },
                        { name: 'Memory Usage', value: `${sysInfo.memory.heapUsed}MB / ${sysInfo.memory.heapTotal}MB`, inline: true }
                    );
                break;

            case 'bot':
                const botStatus = this.getBotStatus();
                if (botStatus) {
                    embed.setTitle('🤖 Bot Status')
                        .addFields(
                            { name: 'Status', value: botStatus.ready ? '🟢 Ready' : '🔴 Not Ready', inline: true },
                            { name: 'Guilds', value: botStatus.guilds.toString(), inline: true },
                            { name: 'Users', value: botStatus.users.toString(), inline: true },
                            { name: 'Channels', value: botStatus.channels.toString(), inline: true },
                            { name: 'Commands', value: botStatus.commands.toString(), inline: true },
                            { name: 'Ping', value: `${botStatus.ping}ms`, inline: true }
                        );
                }
                break;

            case 'errors':
                embed.setTitle('❌ Recent Errors')
                    .setDescription(this.loggedErrors.length > 0 
                        ? 'Last 5 errors:' 
                        : 'No errors logged');
                
                this.loggedErrors.slice(0, 5).forEach((error, index) => {
                    embed.addFields({
                        name: `Error ${index + 1}`,
                        value: `**${error.message}**\nCommand: ${error.context.command || 'N/A'}\nTime: <t:${Math.floor(error.timestamp.getTime() / 1000)}:R>`,
                        inline: false
                    });
                });
                break;

            default:
                const general = this.performanceMetrics.getSummary();
                const defaultBotStatus = this.getBotStatus();
                
                embed.addFields(
                    { name: 'Bot Status', value: defaultBotStatus?.ready ? '🟢 Online' : '🔴 Offline', inline: true },
                    { name: 'Guilds', value: defaultBotStatus?.guilds?.toString() || 'N/A', inline: true },
                    { name: 'Commands', value: defaultBotStatus?.commands?.toString() || 'N/A', inline: true },
                    { name: 'Uptime', value: `${Math.round(general.uptime / 1000 / 60)} minutes`, inline: true },
                    { name: 'Success Rate', value: `${general.successRate}%`, inline: true },
                    { name: 'Memory', value: `${general.memoryUsage.heapUsed}MB`, inline: true }
                );
        }

        return embed;
    }

    /**
     * Get detailed debug information
     * @returns {Object}
     */
    getDebugInfo() {
        return {
            debugLevel: this.debugLevel,
            debugMode: this.debugMode,
            performance: this.performanceMetrics.getSummary(),
            system: this.getSystemInfo(),
            bot: this.getBotStatus(),
            recentErrors: this.loggedErrors.slice(0, 10),
            loggedErrorsCount: this.loggedErrors.length
        };
    }

    /**
     * Export debug data
     * @returns {Object}
     */
    exportDebugData() {
        return {
            timestamp: new Date().toISOString(),
            debugInfo: this.getDebugInfo(),
            performanceMetrics: {
                metrics: Array.from(this.performanceMetrics.metrics.entries()),
                responseTimes: this.performanceMetrics.responseTimes,
                memoryUsage: this.performanceMetrics.memoryUsage
            },
            errors: this.loggedErrors
        };
    }

    /**
     * Clear debug data
     */
    clearDebugData() {
        this.performanceMetrics.reset();
        this.loggedErrors = [];
        logger.info('Debug data cleared');
    }
}

module.exports = {
    DebugManager,
    DebugLevels,
    PerformanceMetrics
};
