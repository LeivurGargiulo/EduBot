/**
 * Enhanced Ready Event Handler
 * Fires when the bot successfully connects to Discord with comprehensive logging
 */

const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    
    /**
     * Execute function for the ready event with enhanced logging and setup
     * @param {Client} client - The Discord client instance
     */
    async execute(client) {
        try {
            console.log('🎉 ============================================');
            console.log(`🤖 Bot is ready! Connected as ${client.user.tag}`);
            console.log(`📊 Sirviendo en ${client.guilds.cache.size} servidor(es)`);
            console.log(`👥 Usuarios totales: ${client.users.cache.size}`);
            console.log(`📅 Conectado el: ${new Date().toISOString()}`);
            console.log(`💾 Memoria inicial: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
            console.log(`⚡ Node.js: ${process.version}`);
            console.log(`📦 Discord.js: ${require('discord.js').version}`);
            console.log('🎉 ============================================');
            
            // Set enhanced bot activity status with rotation
            await setRotatingActivity(client);
            
            // Log available commands with categories
            logCommandSummary(client);
            
            // Log guild information
            logGuildInformation(client);
            
            // Perform startup health checks
            await performStartupHealthChecks(client);
            
            // Setup periodic tasks
            setupPeriodicTasks(client);
            
            // Initialize global error tracking
            global.botStartTime = new Date();
            global.errorStats = {
                total: 0,
                byType: {},
                lastError: null
            };
            
            console.log('✅ Bot initialization completed successfully!');
            
        } catch (error) {
            console.error('❌ Critical error during ready event:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        }
    }
};

/**
 * Set rotating activity status for the bot
 * @param {Client} client 
 */
async function setRotatingActivity(client) {
    const activities = [
        { name: '¡Ayudando a estudiantes a aprender! 📚', type: ActivityType.Custom },
        { name: 'cursos de desarrollo web 🌐', type: ActivityType.Watching },
        { name: 'preguntas de estudiantes 👂', type: ActivityType.Listening },
        { name: 'con HTML, CSS y más 💻', type: ActivityType.Playing }
    ];
    
    let currentActivityIndex = 0;
    
    // Set initial activity
    try {
        await client.user.setActivity(activities[currentActivityIndex].name, { 
            type: activities[currentActivityIndex].type 
        });
        console.log(`✅ Estado de actividad inicial configurado: ${activities[currentActivityIndex].name}`);
    } catch (error) {
        console.error('❌ Error configuring initial bot activity:', error);
    }
    
    // Rotate activity every 10 minutes
    setInterval(async () => {
        try {
            currentActivityIndex = (currentActivityIndex + 1) % activities.length;
            await client.user.setActivity(activities[currentActivityIndex].name, { 
                type: activities[currentActivityIndex].type 
            });
            console.log(`🔄 Actividad rotada: ${activities[currentActivityIndex].name}`);
        } catch (error) {
            console.error('❌ Error rotating bot activity:', error);
        }
    }, 600000); // 10 minutes
}

/**
 * Log comprehensive command summary
 * @param {Client} client 
 */
function logCommandSummary(client) {
    console.log(`📋 Comandos cargados: ${client.commands.size}`);
    
    // Group commands by category
    const commandsByCategory = {};
    
    client.commands.forEach(command => {
        // Extract category from file path or use 'general' as default
        const category = extractCategoryFromCommand(command) || 'general';
        
        if (!commandsByCategory[category]) {
            commandsByCategory[category] = [];
        }
        
        commandsByCategory[category].push({
            name: command.data.name,
            description: command.data.description,
            cooldown: command.cooldown || 3
        });
    });
    
    // Log commands by category
    Object.entries(commandsByCategory).forEach(([category, commands]) => {
                    console.log(`\n📂 Category: ${category.toUpperCase()}`);
        commands.forEach(command => {
            console.log(`   • /${command.name} - ${command.description} (cooldown: ${command.cooldown}s)`);
        });
    });
}

/**
 * Extract category from command (helper function)
 * @param {Object} command 
 * @returns {string|null}
 */
function extractCategoryFromCommand(command) {
    // This is a simple implementation - you might want to enhance this
    // based on how your commands are structured
    if (command.data.name.includes('mod') || command.data.name.includes('ban') || command.data.name.includes('kick')) {
        return 'moderation';
    }
    if (command.data.name.includes('material') || command.data.name.includes('curso')) {
        return 'education';
    }
    if (command.data.name.includes('hola') || command.data.name.includes('roles') || command.data.name.includes('presentar')) {
        return 'community';
    }
    return 'utility';
}

/**
 * Log detailed guild information
 * @param {Client} client 
 */
function logGuildInformation(client) {
            console.log('\n🏰 Server Information:');
    
    client.guilds.cache.forEach(guild => {
        const owner = guild.members.cache.get(guild.ownerId);
        const memberCount = guild.memberCount;
        const channelCount = guild.channels.cache.size;
        const roleCount = guild.roles.cache.size;
        
        console.log(`   • ${guild.name} (ID: ${guild.id})`);
        console.log(`     - Propietario: ${owner ? owner.user.tag : 'Desconocido'}`);
        console.log(`     - Miembros: ${memberCount}`);
        console.log(`     - Canales: ${channelCount}`);
        console.log(`     - Roles: ${roleCount}`);
        console.log(`     - Creado: ${guild.createdAt.toDateString()}`);
    });
}

/**
 * Perform startup health checks
 * @param {Client} client 
 */
async function performStartupHealthChecks(client) {
    console.log('\n🔍 Realizando verificaciones de salud...');
    
    const checks = [];
    
    // Check bot permissions in each guild
    for (const guild of client.guilds.cache.values()) {
        try {
            const botMember = guild.members.me;
            const hasBasicPerms = botMember.permissions.has(['SendMessages', 'ViewChannel', 'UseSlashCommands']);
            
            checks.push({
                guild: guild.name,
                permissions: hasBasicPerms ? '✅' : '❌',
                status: hasBasicPerms ? 'OK' : 'MISSING_PERMISSIONS'
            });
            
            if (!hasBasicPerms) {
                console.warn(`⚠️  Permisos insuficientes en ${guild.name}`);
            }
        } catch (error) {
            checks.push({
                guild: guild.name,
                permissions: '❌',
                status: 'ERROR',
                error: error.message
            });
        }
    }
    
    // Check environment variables
    const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'];
    const envCheck = requiredEnvVars.every(varName => process.env[varName]);
    
    console.log(`   Variables de entorno: ${envCheck ? '✅' : '❌'}`);
    console.log(`   Permisos de servidor: ${checks.filter(c => c.status === 'OK').length}/${checks.length} OK`);
    
    // Memory usage check
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    console.log(`   Uso de memoria: ${memUsageMB}MB`);
    
    if (memUsageMB > 200) {
        console.warn(`⚠️  Alto uso de memoria detectado: ${memUsageMB}MB`);
    }
    
    console.log('✅ Verificaciones de salud completadas');
}

/**
 * Setup periodic maintenance tasks
 * @param {Client} client 
 */
function setupPeriodicTasks(client) {
    // Clean up cooldowns every hour
    setInterval(() => {
        try {
            let cleanedCount = 0;
            const now = Date.now();
            
            client.cooldowns.forEach((timestamps, commandName) => {
                timestamps.forEach((timestamp, userId) => {
                    // Remove cooldowns older than 1 hour
                    if (now - timestamp > 3600000) {
                        timestamps.delete(userId);
                        cleanedCount++;
                    }
                });
                
                // Remove empty cooldown collections
                if (timestamps.size === 0) {
                    client.cooldowns.delete(commandName);
                }
            });
            
            if (cleanedCount > 0) {
                console.log(`🧹 Limpieza de cooldowns: ${cleanedCount} entradas eliminadas`);
            }
        } catch (error) {
            console.error('❌ Error durante la limpieza de cooldowns:', error);
        }
    }, 3600000); // 1 hour
    
    // Log periodic status every 30 minutes
    setInterval(() => {
        try {
            const memUsage = process.memoryUsage();
            const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
            const uptime = Math.floor(client.uptime / 1000 / 60); // minutes
            
            console.log(`📊 Periodic status - Uptime: ${uptime}m, Memory: ${memUsageMB}MB, Servers: ${client.guilds.cache.size}`);
            
            // Update global health monitor if available
            if (global.healthMonitor) {
                global.healthMonitor.updateHeartbeat();
            }
        } catch (error) {
            console.error('❌ Error in periodic status report:', error);
        }
    }, 1800000); // 30 minutes
    
            console.log('⏰ Periodic tasks configured');
}

