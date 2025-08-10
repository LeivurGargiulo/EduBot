/**
 * Configuration Manager Utility
 * Manages bot configuration with SQLite database persistence and fallback to environment variables
 */

const DatabaseManager = require('./databaseManager');

class ConfigManager {
    constructor(client) {
        this.client = client;
        this.dbManager = new DatabaseManager();
        this.initialized = false;
    }

    /**
     * Initialize the configuration manager
     */
    async initialize() {
        if (this.initialized) return true;
        
        const success = this.dbManager.initialize();
        this.initialized = success;
        return success;
    }

    /**
     * Get configuration for a guild
     * @param {string} guildId 
     * @returns {Object} Guild configuration
     */
    getGuildConfig(guildId) {
        if (!this.initialized) {
            console.warn('⚠️  ConfigManager not initialized, falling back to in-memory storage');
            if (!this.client.botConfig) {
                this.client.botConfig = new Map();
            }
            const config = this.client.botConfig.get(guildId);
            return config || {};
        }
        
        try {
            const config = this.dbManager.getGuildConfig(guildId);
            return config || {};
        } catch (error) {
            console.error(`❌ Error getting guild config for ${guildId}:`, error);
            return {};
        }
    }

    /**
     * Set configuration for a guild
     * @param {string} guildId 
     * @param {Object} config 
     */
    setGuildConfig(guildId, config) {
        if (!this.initialized) {
            console.warn('⚠️  ConfigManager not initialized, falling back to in-memory storage');
            try {
                if (!this.client.botConfig) {
                    this.client.botConfig = new Map();
                }
                this.client.botConfig.set(guildId, config);
            } catch (error) {
                console.error(`❌ Error setting guild config for ${guildId}:`, error);
            }
            return;
        }

        try {
            const success = this.dbManager.setGuildConfig(guildId, config);
            if (!success) {
                console.error(`❌ Failed to save guild config for ${guildId} to database`);
            }
        } catch (error) {
            console.error(`❌ Error setting guild config for ${guildId}:`, error);
        }
    }

    /**
     * Get a specific config value with fallback to environment variable
     * @param {string} guildId 
     * @param {string} key 
     * @param {string} envKey 
     * @returns {string|null}
     */
    getConfigValue(guildId, key, envKey = null) {
        try {
            if (this.initialized) {
                const value = this.dbManager.getConfigValue(guildId, key);
                return value || (envKey ? process.env[envKey] : null);
            } else {
                const config = this.getGuildConfig(guildId);
                if (!config) return envKey ? process.env[envKey] : null;
                
                return config[key] || (envKey ? process.env[envKey] : null);
            }
        } catch (error) {
            console.error(`❌ Error getting config value ${key} for ${guildId}:`, error);
            return envKey ? process.env[envKey] : null;
        }
    }

    /**
     * Get moderation channel ID
     * @param {string} guildId 
     * @returns {string|null}
     */
    getModerationChannelId(guildId) {
        return this.getConfigValue(guildId, 'moderationChannelId', 'MODERATION_CHANNEL_ID');
    }

    /**
     * Get support channel ID
     * @param {string} guildId 
     * @returns {string|null}
     */
    getSupportChannelId(guildId) {
        return this.getConfigValue(guildId, 'supportChannelId', 'SUPPORT_CHANNEL_ID');
    }

    /**
     * Get staff role ID
     * @param {string} guildId 
     * @returns {string|null}
     */
    getStaffRoleId(guildId) {
        return this.getConfigValue(guildId, 'staffRoleId', 'STAFF_ROLE_ID');
    }

    /**
     * Get moderator role ID
     * @param {string} guildId 
     * @returns {string|null}
     */
    getModeratorRoleId(guildId) {
        return this.getConfigValue(guildId, 'moderatorRoleId', 'MODERATOR_ROLE_ID');
    }

    /**
     * Get feedback URL
     * @param {string} guildId 
     * @returns {string|null}
     */
    getFeedbackUrl(guildId) {
        return this.getConfigValue(guildId, 'feedbackUrl', 'FEEDBACK_FORM_URL');
    }

    /**
     * Get doubts channel ID
     * @param {string} guildId 
     * @returns {string|null}
     */
    getDoubtsChannelId(guildId) {
        return this.getConfigValue(guildId, 'doubtsChannelId', 'DOUBTS_CHANNEL_ID');
    }

    /**
     * Get announcements channel ID
     * @param {string} guildId 
     * @returns {string|null}
     */
    getAnnouncementsChannelId(guildId) {
        return this.getConfigValue(guildId, 'announcementsChannelId', 'ANNOUNCEMENTS_CHANNEL_ID');
    }

    /**
     * Get verification channel ID from environment
     * @param {string} guildId 
     * @returns {string|null}
     */
    getVerificationChannelId(guildId) {
        // If database is not initialized, return environment variable directly
        if (!this.initialized) {
            return process.env.VERIFICATION_CHANNEL_ID || null;
        }
        return this.getConfigValue(guildId, 'verification.channelId', 'VERIFICATION_CHANNEL_ID');
    }

    /**
     * Get verified role ID from environment
     * @param {string} guildId 
     * @returns {string|null}
     */
    getVerifiedRoleId(guildId) {
        // If database is not initialized, return environment variable directly
        if (!this.initialized) {
            return process.env.VERIFIED_ROLE_ID || null;
        }
        return this.getConfigValue(guildId, 'verification.roleId', 'VERIFIED_ROLE_ID');
    }

    /**
     * Get verification title from embed strings
     * @param {string} guildId 
     * @returns {string}
     */
    getVerificationTitle(guildId) {
        const embedStrings = require('../data/embedStrings');
        // If database is not initialized, return default from embed strings
        if (!this.initialized) {
            return embedStrings.verification.defaultTitle;
        }
        return this.getCustomText(guildId, 'verification', 'title', embedStrings.verification.defaultTitle);
    }

    /**
     * Get verification description from embed strings
     * @param {string} guildId 
     * @returns {string}
     */
    getVerificationDescription(guildId) {
        const embedStrings = require('../data/embedStrings');
        // If database is not initialized, return default from embed strings
        if (!this.initialized) {
            return embedStrings.verification.defaultDescription;
        }
        return this.getCustomText(guildId, 'verification', 'description', embedStrings.verification.defaultDescription);
    }

    /**
     * Get verification button text from embed strings
     * @param {string} guildId 
     * @returns {string}
     */
    getVerificationButtonText(guildId) {
        const embedStrings = require('../data/embedStrings');
        // If database is not initialized, return default from embed strings
        if (!this.initialized) {
            return embedStrings.verification.buttonText;
        }
        return this.getCustomText(guildId, 'verification', 'buttonText', embedStrings.verification.buttonText);
    }

    /**
     * Get verification enabled status from environment
     * @param {string} guildId 
     * @returns {boolean}
     */
    isVerificationEnabledFromEnv(guildId) {
        // If database is not initialized, return environment variable directly
        if (!this.initialized) {
            const enabled = process.env.VERIFICATION_ENABLED;
            return enabled === 'true' || enabled === true;
        }
        const enabled = this.getConfigValue(guildId, 'verification.enabled', 'VERIFICATION_ENABLED');
        return enabled === 'true' || enabled === true;
    }

    /**
     * Get dynamic voice trigger channel ID from environment
     * @param {string} guildId 
     * @returns {string|null}
     */
    getDynamicVoiceTriggerChannelId(guildId) {
        return this.getConfigValue(guildId, 'dynamicVoice.triggerChannelId', 'DYNAMIC_VOICE_TRIGGER_CHANNEL_ID');
    }

    /**
     * Get dynamic voice name template from environment
     * @param {string} guildId 
     * @returns {string|null}
     */
    getDynamicVoiceNameTemplate(guildId) {
        return this.getConfigValue(guildId, 'dynamicVoice.nameTemplate', 'DYNAMIC_VOICE_NAME_TEMPLATE');
    }

    /**
     * Get dynamic voice user limit from environment
     * @param {string} guildId 
     * @returns {number}
     */
    getDynamicVoiceUserLimit(guildId) {
        const limit = this.getConfigValue(guildId, 'dynamicVoice.userLimit', 'DYNAMIC_VOICE_USER_LIMIT');
        return limit ? parseInt(limit) : 0;
    }

    /**
     * Get identity role ID
     * @param {string} guildId 
     * @param {string} roleType 
     * @returns {string|null}
     */
    getIdentityRoleId(guildId, roleType) {
        const config = this.getGuildConfig(guildId);
        const identityRoles = config.identityRoles || {};
        
        // Fallback to environment variables
        const envMap = {
            'pronounEl': 'PRONOUN_EL_ROLE_ID',
            'pronounElla': 'PRONOUN_ELLA_ROLE_ID',
            'pronounElle': 'PRONOUN_ELLE_ROLE_ID',
            'transmasc': 'IDENTITY_TRANSMASC_ROLE_ID',
            'transfem': 'IDENTITY_TRANSFEM_ROLE_ID',
            'nobinarie': 'IDENTITY_NOBINARIE_ROLE_ID',
            'travesti': 'IDENTITY_TRAVESTI_ROLE_ID',
            'aliade': 'IDENTITY_ALIADE_ROLE_ID'
        };

        return identityRoles[roleType] || process.env[envMap[roleType]];
    }

    /**
     * Get verification configuration
     * @param {string} guildId 
     * @returns {Object|null}
     */
    getVerificationConfig(guildId) {
        // If database is not initialized, return basic config with embed strings
        if (!this.initialized) {
            return {
                channelId: this.getVerificationChannelId(guildId),
                roleId: this.getVerifiedRoleId(guildId),
                title: this.getVerificationTitle(guildId),
                description: this.getVerificationDescription(guildId),
                buttonText: this.getVerificationButtonText(guildId),
                enabled: this.isVerificationEnabledFromEnv(guildId)
            };
        }
        
        const config = this.getGuildConfig(guildId);
        const dbConfig = config.verification || {};
        
        // Merge with environment variables and embed strings
        return {
            channelId: dbConfig.channelId || this.getVerificationChannelId(guildId),
            roleId: dbConfig.roleId || this.getVerifiedRoleId(guildId),
            title: this.getVerificationTitle(guildId),
            description: this.getVerificationDescription(guildId),
            buttonText: this.getVerificationButtonText(guildId),
            enabled: dbConfig.enabled !== undefined ? dbConfig.enabled : this.isVerificationEnabledFromEnv(guildId)
        };
    }

    /**
     * Check if verification system is enabled
     * @param {string} guildId 
     * @returns {boolean}
     */
    isVerificationEnabled(guildId) {
        const verificationConfig = this.getVerificationConfig(guildId);
        const fromConfig = verificationConfig && verificationConfig.enabled;
        const fromEnv = this.isVerificationEnabledFromEnv(guildId);
        return fromConfig || fromEnv;
    }

    /**
     * Check if user has staff permissions
     * @param {GuildMember} member 
     * @returns {boolean}
     */
    hasStaffPermission(member) {
        if (!member || !member.guild) {
            return false;
        }
        
        const staffRoleId = this.getStaffRoleId(member.guild.id);
        
        // If no staff role is configured, check for Administrator permission as fallback
        if (!staffRoleId) {
            return member.permissions.has('Administrator');
        }
        
        return member.roles.cache.has(staffRoleId);
    }

    /**
     * Get custom text for a section
     * @param {string} guildId 
     * @param {string} section 
     * @param {string} key 
     * @param {string} defaultValue 
     * @returns {string}
     */
    getCustomText(guildId, section, key, defaultValue) {
        const config = this.getGuildConfig(guildId);
        const customTexts = config.customTexts || {};
        const sectionTexts = customTexts[section] || {};
        return sectionTexts[key] || defaultValue;
    }



    /**
     * Initialize default configuration for a guild
     * @param {string} guildId 
     */
    initializeGuildConfig(guildId) {
        const existingConfig = this.getGuildConfig(guildId);
        if (Object.keys(existingConfig).length === 0) {
            this.setGuildConfig(guildId, {
                moderationChannelId: null,
                supportChannelId: null,
                doubtsChannelId: null,
                announcementsChannelId: null,
                staffRoleId: null,
                moderatorRoleId: null,
                feedbackUrl: null,
                guidelinesUrl: null,
                identityRoles: {},
                verification: {
                    enabled: false,
                    channelId: null,
                    roleId: null,
                    title: null,
                    description: null
                },
                customTexts: {},
                courses: {},
                commissions: {},
                reminders: {}
            });
        }
    }

    /**
     * Get courses for a guild
     * @param {string} guildId 
     * @returns {Array}
     */
    getCourses(guildId) {
        if (!this.initialized) return [];
        return this.dbManager.getCourses(guildId);
    }

    /**
     * Add a course
     * @param {string} guildId 
     * @param {Object} courseData 
     * @returns {number|null} Course ID
     */
    addCourse(guildId, courseData) {
        if (!this.initialized) return null;
        return this.dbManager.addCourse(guildId, courseData);
    }

    /**
     * Get reminders for a guild
     * @param {string} guildId 
     * @returns {Array}
     */
    getReminders(guildId) {
        if (!this.initialized) return [];
        return this.dbManager.getReminders(guildId);
    }

    /**
     * Add a reminder
     * @param {string} guildId 
     * @param {Object} reminderData 
     * @returns {number|null} Reminder ID
     */
    addReminder(guildId, reminderData) {
        if (!this.initialized) return null;
        return this.dbManager.addReminder(guildId, reminderData);
    }

    /**
     * Mark reminder as sent
     * @param {number} reminderId 
     * @returns {boolean}
     */
    markReminderSent(reminderId) {
        if (!this.initialized) return false;
        return this.dbManager.markReminderSent(reminderId);
    }

    /**
     * Get educational commission by code
     * @param {string} guildId 
     * @param {string} commissionCode 
     * @returns {Object|null}
     */
    getEducationalCommission(guildId, commissionCode) {
        if (!this.initialized) return null;
        return this.dbManager.getEducationalCommission(guildId, commissionCode);
    }

    /**
     * Get all educational commissions for a guild
     * @param {string} guildId 
     * @returns {Array}
     */
    getEducationalCommissions(guildId) {
        if (!this.initialized) return [];
        return this.dbManager.getEducationalCommissions(guildId);
    }

    /**
     * Add educational commission
     * @param {string} guildId 
     * @param {Object} commissionData 
     * @returns {number|null} Commission ID
     */
    addEducationalCommission(guildId, commissionData) {
        if (!this.initialized) return null;
        return this.dbManager.addEducationalCommission(guildId, commissionData);
    }

    /**
     * Update educational commission
     * @param {string} guildId 
     * @param {string} commissionCode 
     * @param {Object} commissionData 
     * @returns {boolean}
     */
    updateEducationalCommission(guildId, commissionCode, commissionData) {
        if (!this.initialized) return false;
        return this.dbManager.updateEducationalCommission(guildId, commissionCode, commissionData);
    }

    /**
     * Delete educational commission
     * @param {string} guildId 
     * @param {string} commissionCode 
     * @returns {boolean}
     */
    deleteEducationalCommission(guildId, commissionCode) {
        if (!this.initialized) return false;
        return this.dbManager.deleteEducationalCommission(guildId, commissionCode);
    }

    /**
     * Close database connection
     */
    close() {
        if (this.dbManager) {
            this.dbManager.close();
            this.initialized = false;
        }
    }

    /**
     * Backup database
     * @param {string} backupPath 
     * @returns {boolean}
     */
    backup(backupPath) {
        if (!this.initialized) return false;
        return this.dbManager.backup(backupPath);
    }
}

module.exports = ConfigManager;