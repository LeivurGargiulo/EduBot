/**
 * Voice State Update Event Handler
 * Handles dynamic voice channel creation and cleanup
 */

const { Events, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: Events.VoiceStateUpdate,
    
    /**
     * Execute function for voice state updates
     * @param {VoiceState} oldState 
     * @param {VoiceState} newState 
     */
    async execute(oldState, newState) {
        try {
            const guild = newState.guild;
            
            // Get configuration from environment variables
            const triggerChannelId = newState.client.configManager.getDynamicVoiceTriggerChannelId(guild.id);
            const nameTemplate = newState.client.configManager.getDynamicVoiceNameTemplate(guild.id);
            const userLimit = newState.client.configManager.getDynamicVoiceUserLimit(guild.id);
            
            if (!triggerChannelId) return;

            // Initialize dynamic voice config if not exists
            if (!newState.client.dynamicVoiceConfig) {
                newState.client.dynamicVoiceConfig = new Map();
            }
            
            let config = newState.client.dynamicVoiceConfig.get(guild.id);
            if (!config) {
                config = {
                    triggerChannelId: triggerChannelId,
                    nameTemplate: nameTemplate || 'Canal de {usuario}',
                    userLimit: userLimit || 0,
                    createdChannels: new Set()
                };
                newState.client.dynamicVoiceConfig.set(guild.id, config);
            }

            // Handle user joining the trigger channel
            if (newState.channelId === config.triggerChannelId && oldState.channelId !== config.triggerChannelId) {
                await handleTriggerChannelJoin(newState, config);
            }

            // Handle user leaving a dynamic channel
            if (oldState.channel && config.createdChannels.has(oldState.channelId)) {
                await handleDynamicChannelLeave(oldState, config);
            }

            // Clean up deleted channels from config
            cleanupDeletedChannels(config, guild);
            
        } catch (error) {
            console.error('❌ Error in voiceStateUpdate event:', error);
        }
    }
};

/**
 * Handle user joining the trigger channel
 * @param {VoiceState} voiceState 
 * @param {Object} config 
 */
async function handleTriggerChannelJoin(voiceState, config) {
    try {
        const guild = voiceState.guild;
        const member = voiceState.member;
        const triggerChannel = guild.channels.cache.get(config.triggerChannelId);
        
        if (!triggerChannel) return;

        // Create new dynamic voice channel
        const channelName = config.nameTemplate.replace('{usuario}', member.displayName);
        
        const newChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: triggerChannel.parent,
            userLimit: config.userLimit,
            permissionOverwrites: [
                {
                    id: member.id,
                    allow: [
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.MoveMembers,
                        PermissionFlagsBits.MuteMembers,
                        PermissionFlagsBits.DeafenMembers
                    ]
                }
            ]
        });

        // Add to created channels set
        config.createdChannels.add(newChannel.id);

        // Move user to the new channel
        await member.voice.setChannel(newChannel);

        console.log(`🎵 Dynamic channel created: ${channelName} for ${member.displayName}`);

    } catch (error) {
        console.error('❌ Error creating dynamic channel:', error);
    }
}

/**
 * Handle user leaving a dynamic channel
 * @param {VoiceState} voiceState 
 * @param {Object} config 
 */
async function handleDynamicChannelLeave(voiceState, config) {
    try {
        const channel = voiceState.channel;
        
        // Check if channel is empty
        if (channel.members.size === 0) {
            // Remove from config
            config.createdChannels.delete(channel.id);
            
            // Delete the channel
            await channel.delete('Canal dinámico vacío');
            
            console.log(`🗑️ Dynamic channel deleted: ${channel.name}`);
        }
        
    } catch (error) {
        console.error('❌ Error deleting dynamic channel:', error);
    }
}

/**
 * Clean up deleted channels from config
 * @param {Object} config 
 * @param {Guild} guild 
 */
function cleanupDeletedChannels(config, guild) {
    const channelsToRemove = [];
    
    for (const channelId of config.createdChannels) {
        if (!guild.channels.cache.has(channelId)) {
            channelsToRemove.push(channelId);
        }
    }
    
    channelsToRemove.forEach(channelId => {
        config.createdChannels.delete(channelId);
    });
    
    if (channelsToRemove.length > 0) {
        console.log(`🧹 Cleanup: ${channelsToRemove.length} dynamic channels removed from configuration`);
    }
}

