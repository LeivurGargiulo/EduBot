/**
 * Reminder System
 * Handles automatic reminders for scheduled reminders
 */

const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

class ReminderSystem {
    constructor(client) {
        this.client = client;
        this.isRunning = false;
        this.cronJob = null;
        this.errorCount = 0;
        this.maxErrors = 10;
        this.lastErrorTime = null;
    }

    /**
     * Start the reminder system
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️ Reminder system is already running');
            return;
        }

        try {
            // Run every minute to check for reminders
            this.cronJob = cron.schedule('* * * * *', () => {
                this.checkReminders();
            }, {
                scheduled: false,
                timezone: 'UTC' // Always use UTC for consistency
            });

            this.cronJob.start();
            this.isRunning = true;
            this.startTime = new Date();
            console.log('⏰ Reminder system started - checking every minute');
        } catch (error) {
            console.error('❌ Failed to start reminder system:', error);
            this.isRunning = false;
        }
    }

    /**
     * Restart the reminder system after errors
     */
    async restart() {
        console.log('🔄 Restarting reminder system...');
        this.stop();
        
        // Wait a bit before restarting
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        this.errorCount = 0;
        this.start();
    }

    /**
     * Handle errors with automatic recovery
     */
    async handleError(error, context = '') {
        this.errorCount++;
        this.lastErrorTime = new Date();
        
        console.error(`❌ Reminder system error ${context}:`, {
            message: error.message,
            stack: error.stack,
            errorCount: this.errorCount,
            timestamp: new Date().toISOString()
        });

        // If too many errors, restart the system
        if (this.errorCount >= this.maxErrors) {
            console.error(`❌ Too many errors (${this.errorCount}), restarting reminder system...`);
            await this.restart();
        }
    }

    /**
     * Stop the reminder system
     */
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = null;
        }
        this.isRunning = false;
        console.log('⏰ Reminder system stopped');
    }

    /**
     * Check for reminders that need to be sent
     */
    async checkReminders() {
        try {
            const now = new Date();
            const reminderTime = new Date(now.getTime() + 1 * 60 * 1000); // 1 minute from now

            // Check all guilds
            const guilds = Array.from(this.client.guilds.cache.values());
            
            // Process guilds in batches to avoid overwhelming the API
            const batchSize = 5;
            for (let i = 0; i < guilds.length; i += batchSize) {
                const batch = guilds.slice(i, i + batchSize);
                
                await Promise.allSettled(
                    batch.map(guild => 
                        this.checkGuildReminders(guild, now, reminderTime)
                    )
                );
                
                // Small delay between batches to prevent rate limiting
                if (i + batchSize < guilds.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            // Reset error count on successful run
            if (this.errorCount > 0) {
                this.errorCount = Math.max(0, this.errorCount - 1);
            }
            
        } catch (error) {
            await this.handleError(error, 'in checkReminders');
        }
    }

    /**
     * Check reminders for a specific guild
     * @param {Guild} guild 
     * @param {Date} now 
     * @param {Date} reminderTime 
     */
    async checkGuildReminders(guild, now, reminderTime) {
        try {
            if (!this.client.configManager) {
                console.warn(`⚠️ ConfigManager not available for guild ${guild.name}`);
                return;
            }

            const config = this.client.configManager.getGuildConfig(guild.id);
            if (!config) {
                return; // Skip if no config
            }
            
            const reminders = config.reminders || {};
            
            if (Object.keys(reminders).length === 0) {
                return; // Skip if no reminders
            }

            for (const [reminderId, reminderData] of Object.entries(reminders)) {
                try {
                    if (!reminderData || !reminderData.datetime) {
                        console.warn(`⚠️ Invalid reminder data for ${reminderId} in ${guild.name}`);
                        continue;
                    }

                    const reminderDateTime = new Date(reminderData.datetime);
                    
                    // Skip invalid dates
                    if (isNaN(reminderDateTime.getTime())) {
                        console.warn(`⚠️ Invalid reminder time for ${reminderId} in ${guild.name}`);
                        continue;
                    }
                    
                    // Skip past reminders
                    if (reminderDateTime <= now) {
                        // Remove past reminders
                        delete reminders[reminderId];
                        config.reminders = reminders;
                        this.client.configManager.setGuildConfig(guild.id, config);
                        console.log(`🗑️ Removed past reminder ${reminderId} in ${guild.name}`);
                        continue;
                    }

                    // Check if we need to send the reminder (within 1 minute tolerance)
                    const timeDiff = Math.abs(reminderDateTime - reminderTime);
                    
                    if (timeDiff <= 60000 && !this.hasReminderBeenSent(reminderId)) {
                        await this.sendReminder(guild, reminderId, reminderData);
                        
                        // Remove the reminder after sending
                        delete reminders[reminderId];
                        config.reminders = reminders;
                        this.client.configManager.setGuildConfig(guild.id, config);
                    }
                } catch (reminderError) {
                    console.error(`❌ Error processing reminder ${reminderId} in ${guild.name}:`, reminderError);
                }
            }
        } catch (error) {
            console.error(`❌ Error checking reminders for guild ${guild.name}:`, {
                message: error.message,
                stack: error.stack,
                guildId: guild.id,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Check if a reminder has already been sent
     * @param {string} reminderId 
     * @returns {boolean}
     */
    hasReminderBeenSent(reminderId) {
        // Simple in-memory tracking (in production, use database)
        if (!this.sentReminders) {
            this.sentReminders = new Set();
        }

        if (this.sentReminders.has(reminderId)) {
            return true;
        }

        this.sentReminders.add(reminderId);
        
        // Clean up old reminders (older than 24 hours)
        setTimeout(() => {
            this.sentReminders.delete(reminderId);
        }, 24 * 60 * 60 * 1000);

        return false;
    }

    /**
     * Send reminder message
     * @param {Guild} guild 
     * @param {string} reminderId 
     * @param {Object} reminderData 
     */
    async sendReminder(guild, reminderId, reminderData) {
        try {
            if (!reminderData.channelId) {
                console.warn(`⚠️ Missing channel ID for reminder ${reminderId} in ${guild.name}`);
                return;
            }

            const channel = guild.channels.cache.get(reminderData.channelId);
            
            if (!channel) {
                console.warn(`⚠️ Missing channel for reminder ${reminderId} in ${guild.name}`);
                return;
            }

            // Check if bot has permissions to send messages
            if (!channel.permissionsFor(guild.members.me)?.has(['SendMessages', 'ViewChannel'])) {
                console.warn(`⚠️ No permissions to send reminder in ${channel.name} for ${guild.name}`);
                return;
            }

            const reminderTime = new Date(reminderData.datetime);
            const timestamp = Math.floor(reminderTime.getTime() / 1000);
            const courseEmoji = this.getCourseEmoji(reminderData.courseCode);

            // Get role if it exists
            const role = reminderData.roleId ? guild.roles.cache.get(reminderData.roleId) : null;
            const roleMention = role ? role.toString() : '';

            const reminderMessage = roleMention ? 
                `⏰ ${roleMention} ¡Recordatorio de clase!` :
                `⏰ ¡Recordatorio de clase!`;

            const embed = new EmbedBuilder()
                .setTitle(`${courseEmoji} Recordatorio de Clase`)
                .setDescription(`**${reminderData.courseName}**`)
                .setColor(0x00FF00) // Green
                .addFields(
                    {
                        name: '📅 Horario',
                        value: `<t:${timestamp}:F>`,
                        inline: true
                    },
                    {
                        name: '👥 Participantes',
                        value: role ? role.toString() : 'Todos los interesados',
                        inline: true
                    }
                )
                .setTimestamp();

            if (reminderData.description) {
                embed.addFields({
                    name: '📝 Descripción',
                    value: reminderData.description,
                    inline: false
                });
            }

            await channel.send({
                content: reminderMessage,
                embeds: [embed]
            });

            console.log(`⏰ Sent reminder for ${reminderId} in ${guild.name} [${new Date().toISOString()}]`);

        } catch (error) {
            console.error(`❌ Error sending reminder for ${reminderId}:`, {
                message: error.message,
                stack: error.stack,
                reminderId,
                guildName: guild?.name,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get emoji for course code
     * @param {string} courseCode 
     * @returns {string}
     */
    getCourseEmoji(courseCode) {
        const emojis = {
            'MB': '📄', 'MI': '📑', 'TW': '💨', 'JS': '⚡', 'PY': '🐍',
            'PH': '🎨', 'IL': '🖌️', 'AN': '🎬', 'AF': '🎞️', 'PR': '🎥'
        };
        return emojis[courseCode] || '📚';
    }

    /**
     * Get system status
     * @returns {Object}
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            errorCount: this.errorCount,
            maxErrors: this.maxErrors,
            lastErrorTime: this.lastErrorTime,
            sentRemindersCount: this.sentReminders ? this.sentReminders.size : 0,
            startTime: this.startTime || null,
            uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0
        };
    }
}

module.exports = ReminderSystem;