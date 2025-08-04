/**
 * Configuration Manager Utility
 * Manages bot configuration with fallback to environment variables
 */

class ConfigManager {
    constructor(client) {
        this.client = client;
    }

    /**
     * Get configuration for a guild
     * @param {string} guildId 
     * @returns {Object} Guild configuration
     */
    getGuildConfig(guildId) {
        if (!this.client.botConfig) {
            this.client.botConfig = new Map();
        }
        
        try {
            const config = this.client.botConfig.get(guildId);
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
        try {
            if (!this.client.botConfig) {
                this.client.botConfig = new Map();
            }
            this.client.botConfig.set(guildId, config);
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
            const config = this.getGuildConfig(guildId);
            if (!config) return envKey ? process.env[envKey] : null;
            
            return config[key] || (envKey ? process.env[envKey] : null);
        } catch (error) {
            console.error(`❌ Error getting config value ${key} for ${guildId}:`, error);
        return config[key] || (envKey ? process.env[envKey] : null);
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
        return this.getConfigValue(guildId, 'staffRoleId', 'SUPPORT_STAFF_ROLE_ID');
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
        const config = this.getGuildConfig(guildId);
        return config.verification || null;
    }

    /**
     * Check if verification system is enabled
     * @param {string} guildId 
     * @returns {boolean}
     */
    isVerificationEnabled(guildId) {
        const verificationConfig = this.getVerificationConfig(guildId);
        return verificationConfig && verificationConfig.enabled;
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
}

module.exports = ConfigManager;