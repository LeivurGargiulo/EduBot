// Load environment variables first
require('dotenv').config();

// Import required modules
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const ReminderSystem = require('./utils/reminderSystem');

/**
 * Main Discord Bot Entry Point
 * A modular Discord bot for educational communities with enhanced error handling and stability
 */

/**
 * Environment Variable Validation
 * Validates all required environment variables before bot initialization
 */
function validateEnvironment() {
    const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'];
    const optionalEnvVars = [
        'MODERATION_CHANNEL_ID', 'SUPPORT_CHANNEL_ID', 'SUPPORT_STAFF_ROLE_ID',
        'ADMIN_ROLE_ID', 'MODERATOR_ROLE_ID', 'FEEDBACK_FORM_URL',
        'DOUBTS_CHANNEL_ID', 'ANNOUNCEMENTS_CHANNEL_ID'
    ];
    
    const missingRequired = requiredEnvVars.filter(varName => !process.env[varName]);
    const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);
    
    if (missingRequired.length > 0) {
        console.error('❌ Missing required environment variables:', missingRequired.join(', '));
        console.error('💡 Please check your .env file and ensure all required variables are set.');
        process.exit(1);
    }
    
    if (missingOptional.length > 0) {
        console.warn('⚠️  Missing optional environment variables:', missingOptional.join(', '));
        console.warn('💡 Some features may not work correctly without these variables.');
    }
    
    console.log('✅ Environment validation completed');
    return true;
}

/**
 * Discord Client Configuration
 * Configures the bot with necessary intents and error handling
 */
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates
    ],
    // Add failover options for better stability
    failIfNotExists: false,
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: true
    }
});

// Collections to store commands and cooldowns
client.commands = new Collection();
client.cooldowns = new Collection();

// Configuration manager
const ConfigManager = require('./utils/configManager');
client.configManager = new ConfigManager(client);

// Reminder system
client.reminderSystem = new ReminderSystem(client);

// Dynamic voice channel configuration
client.dynamicVoiceConfig = new Map();

// Bot configuration storage (in production, use a database)
client.botConfig = new Map();

/**
 * Enhanced Command Loader
 * Dynamically loads all commands with comprehensive error handling
 */
function loadCommands() {
    const commands = [];
    const commandsPath = path.join(__dirname, 'commands');
    
    if (!fs.existsSync(commandsPath)) {
        console.error('❌ Commands directory not found!');
        console.error('💡 Please ensure the commands directory exists in the project root.');
        return [];
    }

    try {
        const commandFolders = fs.readdirSync(commandsPath);
        let loadedCount = 0;
        let errorCount = 0;

        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            
            if (!fs.statSync(folderPath).isDirectory()) {
                continue;
            }

            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                try {
                    // Clear require cache to allow hot reloading in development
                    delete require.cache[require.resolve(filePath)];
                    const command = require(filePath);
                    
                    // Validate command structure
                    if (!command.data || !command.execute) {
                        console.warn(`⚠️  Command ${file} is missing required "data" or "execute" property`);
                        errorCount++;
                        continue;
                    }

                    // Validate command data structure
                    if (!command.data.name || !command.data.description) {
                        console.warn(`⚠️  Command ${file} has invalid data structure`);
                        errorCount++;
                        continue;
                    }
                    
                    client.commands.set(command.data.name, command);
                    commands.push(command.data.toJSON());
                    console.log(`✅ Loaded command: ${command.data.name} from ${folder}/${file}`);
                    loadedCount++;
                } catch (error) {
                    console.error(`❌ Error loading command ${file}:`, error.message);
                    errorCount++;
                }
            }
        }

        console.log(`📊 Command loading summary: ${loadedCount} loaded, ${errorCount} errors`);
        return commands;
    } catch (error) {
        console.error('❌ Critical error during command loading:', error);
        return [];
    }
}

/**
 * Enhanced Event Loader
 * Dynamically loads all event handlers with error handling
 */
function loadEvents() {
    const eventsPath = path.join(__dirname, 'events');
    
    if (!fs.existsSync(eventsPath)) {
        console.error('❌ Events directory not found!');
        console.error('💡 Please ensure the events directory exists in the project root.');
        return;
    }

    try {
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        let loadedCount = 0;
        let errorCount = 0;

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            try {
                // Clear require cache for hot reloading
                delete require.cache[require.resolve(filePath)];
                const event = require(filePath);
                
                // Validate event structure
                if (!event.name || !event.execute) {
                    console.warn(`⚠️  Event ${file} is missing required "name" or "execute" property`);
                    errorCount++;
                    continue;
                }
                
                // Register event with error wrapping
                if (event.once) {
                    client.once(event.name, async (...args) => {
                        try {
                            await event.execute(...args);
                        } catch (error) {
                            console.error(`❌ Error in event ${event.name}:`, error);
                        }
                    });
                } else {
                    client.on(event.name, async (...args) => {
                        try {
                            await event.execute(...args);
                        } catch (error) {
                            console.error(`❌ Error in event ${event.name}:`, error);
                        }
                    });
                }
                
                console.log(`✅ Loaded event: ${event.name} from ${file}`);
                loadedCount++;
            } catch (error) {
                console.error(`❌ Error loading event ${file}:`, error.message);
                errorCount++;
            }
        }

        console.log(`📊 Event loading summary: ${loadedCount} loaded, ${errorCount} errors`);
    } catch (error) {
        console.error('❌ Critical error during event loading:', error);
    }
}

/**
 * Enhanced Command Deployment
 * Registers slash commands with improved error handling and retry logic
 */
async function deployCommands(retryCount = 0) {
    const maxRetries = 3;
    const commands = loadCommands();
    
    if (!commands || commands.length === 0) {
        console.warn('⚠️  No commands found to deploy');
        return false;
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

        // Use guild commands for faster updates during development
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
        return true;
    } catch (error) {
        console.error(`❌ Error deploying commands (attempt ${retryCount + 1}/${maxRetries + 1}):`, error.message);
        
        // Retry logic for transient errors
        if (retryCount < maxRetries && (error.code === 50013 || error.code === 0)) {
            console.log(`🔄 Retrying command deployment in 5 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return deployCommands(retryCount + 1);
        }
        
        return false;
    }
}

/**
 * Bot Health Check System
 * Monitors bot health and implements automatic recovery
 */
class BotHealthMonitor {
    constructor(client) {
        this.client = client;
        this.lastHeartbeat = Date.now();
        this.healthCheckInterval = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    start() {
        // Health check every 30 seconds
        this.healthCheckInterval = setInterval(() => {
            this.performHealthCheck();
        }, 30000);

        console.log('💓 Health monitoring started');
    }

    stop() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        console.log('💓 Health monitoring stopped');
    }

    performHealthCheck() {
        const now = Date.now();
        const timeSinceLastHeartbeat = now - this.lastHeartbeat;
        
        // If no heartbeat for 2 minutes, consider unhealthy
        if (timeSinceLastHeartbeat > 120000) {
            console.warn('⚠️  Bot appears unhealthy - no heartbeat for 2+ minutes');
            this.attemptRecovery();
        }

        // Log memory usage
        const memUsage = process.memoryUsage();
        const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        
        if (memUsageMB > 500) {
            console.warn(`⚠️  High memory usage detected: ${memUsageMB}MB`);
        }
    }

    updateHeartbeat() {
        this.lastHeartbeat = Date.now();
        this.reconnectAttempts = 0; // Reset on successful heartbeat
    }

    async attemptRecovery() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached. Manual intervention required.');
            return;
        }

        this.reconnectAttempts++;
        console.log(`🔄 Attempting recovery (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

        try {
            if (this.client.ws.status !== 0) { // Not ready
                await this.client.destroy();
                await new Promise(resolve => setTimeout(resolve, 5000));
                await this.client.login(process.env.DISCORD_TOKEN);
            }
        } catch (error) {
            console.error('❌ Recovery attempt failed:', error.message);
        }
    }
}

/**
 * Enhanced Error Handlers
 * Comprehensive error handling for all types of errors
 */
function setupErrorHandlers(client, healthMonitor) {
    // Discord client error handlers
    client.on('error', (error) => {
        console.error('❌ Discord client error:', {
            message: error.message,
            code: error.code,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    });

    client.on('warn', (warning) => {
        console.warn('⚠️  Discord client warning:', {
            message: warning,
            timestamp: new Date().toISOString()
        });
    });

    client.on('shardError', (error) => {
        console.error('❌ Shard error:', {
            message: error.message,
            code: error.code,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    });

    client.on('shardReconnecting', () => {
        console.log(`🔄 Shard reconnecting... [${new Date().toISOString()}]`);
    });

    client.on('shardReady', () => {
        console.log(`✅ Shard ready [${new Date().toISOString()}]`);
        healthMonitor.updateHeartbeat();
    });

    // Rate limit handling
    client.on('rateLimit', (rateLimitData) => {
        console.warn('⚠️  Rate limit hit:', {
            timeout: rateLimitData.timeout,
            limit: rateLimitData.limit,
            method: rateLimitData.method,
            path: rateLimitData.path,
            route: rateLimitData.route,
            timestamp: new Date().toISOString()
        });
    });

    // Debug events for connection issues
    client.on('debug', (info) => {
        // Only log important debug info to avoid spam
        if (info.includes('Heartbeat') || info.includes('Session') || info.includes('Ready')) {
            console.debug(`🔍 Debug: ${info} [${new Date().toISOString()}]`);
        }
    });

    // Process error handlers
    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection:', {
            reason: reason,
            promise: promise,
            stack: reason?.stack,
            timestamp: new Date().toISOString()
        });
        
        // Log to file if available
        if (global.logger) {
            global.logger.error('Unhandled Rejection', { reason, promise });
        }
    });

    process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        // Log to file if available
        if (global.logger) {
            global.logger.error('Uncaught Exception', { error });
        }
        
        // Graceful shutdown on uncaught exceptions
        gracefulShutdown(1);
    });

    process.on('SIGINT', () => {
        console.log(`\n🛑 Received SIGINT. Graceful shutdown... [${new Date().toISOString()}]`);
        gracefulShutdown(0);
    });

    process.on('SIGTERM', () => {
        console.log(`\n🛑 Received SIGTERM. Graceful shutdown... [${new Date().toISOString()}]`);
        gracefulShutdown(0);
    });

    // Memory monitoring
    setInterval(() => {
        const memUsage = process.memoryUsage();
        const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        
        // Log memory usage if it's getting high
        if (memUsageMB > 300) {
            console.warn(`⚠️  High memory usage: ${memUsageMB}MB [${new Date().toISOString()}]`);
        }
        
        // Force garbage collection if memory is very high
        if (memUsageMB > 500 && global.gc) {
            console.log(`🗑️ Forcing garbage collection at ${memUsageMB}MB`);
            global.gc();
        }
    }, 60000); // Check every minute
}

/**
 * Graceful Shutdown Handler
 * Ensures clean shutdown of all resources
 */
async function gracefulShutdown(exitCode = 0) {
    console.log('🔄 Initiating graceful shutdown...');
    
    try {
        // Stop health monitoring
        if (global.healthMonitor) {
            global.healthMonitor.stop();
        }

        // Stop reminder system
        if (client.reminderSystem) {
            client.reminderSystem.stop();
        }

        // Close database connection
        if (client.configManager) {
            client.configManager.close();
            console.log('✅ Database connection closed');
        }

        // Destroy Discord client
        if (client && client.destroy) {
            await client.destroy();
            console.log('✅ Discord client destroyed');
        }

        console.log('✅ Graceful shutdown completed');
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
    } finally {
        process.exit(exitCode);
    }
}

/**
 * Main Bot Initialization
 * Enhanced initialization with comprehensive error handling
 */
async function initializeBot() {
    console.log('🚀 Starting Discord Bot...');
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log(`🔧 Node.js version: ${process.version}`);
    console.log(`📦 Discord.js version: ${require('discord.js').version}`);
    
    try {
        // Validate environment
        validateEnvironment();
        
        // Initialize health monitor
        const healthMonitor = new BotHealthMonitor(client);
        global.healthMonitor = healthMonitor;
        
        // Setup error handlers
        setupErrorHandlers(client, healthMonitor);
        
        // Load events first (they need to be ready before login)
        console.log('📂 Loading events...');
        loadEvents();
        
        // Deploy commands
        console.log('⚙️  Deploying commands...');
        const deploySuccess = await deployCommands();
        if (!deploySuccess) {
            console.warn('⚠️  Command deployment failed, but continuing with bot startup...');
        }
        
        // Initialize database
        console.log('🗄️  Initializing database...');
        const dbInitialized = await client.configManager.initialize();
        if (!dbInitialized) {
            console.warn('⚠️  Database initialization failed, continuing with in-memory storage');
        } else {
            console.log('✅ Database initialized successfully');
        }
        
        // Login to Discord
        console.log('🔐 Logging in to Discord...');
        await client.login(process.env.DISCORD_TOKEN);
        
        // Start health monitoring after successful login
        healthMonitor.start();
        
        // Start reminder system
        client.reminderSystem.start();
        
        console.log('🎉 Bot initialization completed successfully!');
        
    } catch (error) {
        console.error('❌ Critical error during bot initialization:', error);
        console.error('💡 Please check your configuration and try again.');
        process.exit(1);
    }
}

// Initialize the bot
initializeBot().catch(error => {
    console.error('❌ Failed to initialize bot:', error);
    process.exit(1);
});