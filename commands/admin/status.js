/**
 * Estado Command - Admin Category
 * Unified status command for all bot systems
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('estado')
        .setDescription('Estado unificado de todos los sistemas del bot (Solo para admins)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('bot')
                .setDescription('Muestra la configuración general del bot'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('verificacion')
                .setDescription('Muestra el estado del sistema de verificación'))

        .addSubcommand(subcommand =>
            subcommand
                .setName('voz')
                .setDescription('Muestra la configuración de canales de voz dinámicos')),
    
    cooldown: 5,

    /**
     * Execute the estado command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        // Check if user has staff permission
        if (!interaction.client.configManager.hasStaffPermission(interaction.member)) {
            return interaction.reply({
                content: embedStrings.messages.errors.noStaffPermission,
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'bot':
                    await handleBotStatus(interaction);
                    break;
                case 'verificacion':
                    await handleVerificationStatus(interaction);
                    break;

                case 'voz':
                    await handleVoiceStatus(interaction);
                    break;
            }
        } catch (error) {
            console.error('❌ Error al mostrar estado:', error);
            await interaction.reply({
                content: embedStrings.messages.errors.configurationError,
                ephemeral: true
            });
        }
    }
};

/**
 * Handle bot status
 */
async function handleBotStatus(interaction) {
    const guild = interaction.guild;
    const config = interaction.client.configManager.getGuildConfig(guild.id);
    
    // Get configuration
    const verificationConfig = config.verification;
    const moderationChannel = config.moderationChannelId ? 
        guild.channels.cache.get(config.moderationChannelId) : null;
    const supportChannel = config.supportChannelId ? 
        guild.channels.cache.get(config.supportChannelId) : null;
    const doubtsChannel = config.doubtsChannelId ? 
        guild.channels.cache.get(config.doubtsChannelId) : null;
    const announcementsChannel = config.announcementsChannelId ? 
        guild.channels.cache.get(config.announcementsChannelId) : null;
    
    const staffRole = config.staffRoleId ? 
        guild.roles.cache.get(config.staffRoleId) : null;
    const moderatorRole = config.moderatorRoleId ? 
        guild.roles.cache.get(config.moderatorRoleId) : null;

    // Voice configuration
    const voiceConfig = interaction.client.dynamicVoiceConfig?.get(guild.id);
    const triggerChannel = voiceConfig ? 
        guild.channels.cache.get(voiceConfig.triggerChannelId) : null;
    


    // System health information
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const uptime = Math.floor(interaction.client.uptime / 1000 / 60);
    const reminderStatus = interaction.client.reminderSystem?.getStatus();
    
    const embed = new EmbedBuilder()
        .setTitle('🤖 Estado del Bot')
        .setColor(embedStrings.colors.info)
        .addFields(
            {
                name: '📋 Información General',
                value: `**Servidor:** ${guild.name}\n` +
                       `**Miembros:** ${guild.memberCount}\n` +
                       `**Comandos cargados:** ${interaction.client.commands.size}\n` +
                       `**Uptime:** ${uptime} minutos\n` +
                       `**Memoria:** ${memUsageMB}MB\n` +
                       `**Ping:** ${interaction.client.ws.ping}ms`,
                inline: false
            },
            {
                name: '⏰ Sistema de Recordatorios',
                value: reminderStatus ? 
                    `**Estado:** ${reminderStatus.isRunning ? '✅ Activo' : '❌ Inactivo'}\n` +
                    `**Errores:** ${reminderStatus.errorCount}/${reminderStatus.maxErrors}\n` +
                    `**Recordatorios enviados:** ${reminderStatus.sentRemindersCount}\n` +
                    `**Tiempo activo:** ${Math.floor(reminderStatus.uptime / 1000 / 60)} min` :
                    '❌ No disponible',
                inline: false
            },
            {
                name: '📺 Canales Configurados',
                value: `**Moderación:** ${moderationChannel || '❌ No configurado'}\n` +
                       `**Soporte:** ${supportChannel || '❌ No configurado'}\n` +
                       `**Dudas:** ${doubtsChannel || '❌ No configurado'}\n` +
                       `**Anuncios:** ${announcementsChannel || '❌ No configurado'}`,
                inline: true
            },
            {
                name: '👥 Roles Configurados',
                value: `**Staff:** ${staffRole || '❌ No configurado'}\n` +
                       `**Moderador:** ${moderatorRole || '❌ No configurado'}`,
                inline: true
            },
            {
                name: '🎵 Canales de Voz Dinámicos',
                value: voiceConfig ? 
                    `**Canal activador:** ${triggerChannel || '❌ Canal no encontrado'}\n` +
                    `**Plantilla:** ${voiceConfig.nameTemplate}\n` +
                    `**Límite:** ${voiceConfig.userLimit === 0 ? 'Sin límite' : voiceConfig.userLimit}\n` +
                    `**Canales activos:** ${voiceConfig.createdChannels.size}` :
                    '❌ No configurado',
                inline: false
            },

            {
                name: '🔗 Enlaces Externos',
                value: `**Feedback:** ${config.feedbackUrl ? '✅ Configurado' : '❌ No configurado'}\n` +
                       `**Directrices:** ${config.guidelinesUrl ? '✅ Configurado' : '❌ No configurado'}`,
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ 
            text: 'Bot Educativo • Estado del Sistema',
            iconURL: interaction.client.user.displayAvatarURL()
        });

    await interaction.reply({ embeds: [embed] });
}

/**
 * Handle verification status
 */
async function handleVerificationStatus(interaction) {
    const config = interaction.client.configManager.getGuildConfig(interaction.guild.id);
    const verificationConfig = config.verification || {};

    const channel = verificationConfig.channelId ? 
        interaction.guild.channels.cache.get(verificationConfig.channelId) : null;
    const role = verificationConfig.roleId ? 
        interaction.guild.roles.cache.get(verificationConfig.roleId) : null;

    // Count verified members
    const verifiedCount = role ? role.members.size : 0;
    const totalMembers = interaction.guild.memberCount;
    const unverifiedCount = totalMembers - verifiedCount;

    const embed = new EmbedBuilder()
        .setTitle('🔐 Estado del Sistema de Verificación')
        .setColor(verificationConfig.enabled ? embedStrings.colors.success : embedStrings.colors.warning)
        .addFields(
            {
                name: '⚙️ Configuración',
                value: `**Estado:** ${verificationConfig.enabled ? '✅ Activado' : '❌ Desactivado'}\n` +
                       `**Canal:** ${channel || '❌ No configurado'}\n` +
                       `**Rol:** ${role || '❌ No configurado'}`,
                inline: false
            },
            {
                name: '📊 Estadísticas',
                value: `**Miembros totales:** ${totalMembers}\n` +
                       `**Verificados:** ${verifiedCount}\n` +
                       `**Sin verificar:** ${unverifiedCount}`,
                inline: true
            },
            {
                name: '📝 Personalización',
                value: `**Título:** ${verificationConfig.title ? '✅ Personalizado' : '❌ Por defecto'}\n` +
                       `**Descripción:** ${verificationConfig.description ? '✅ Personalizada' : '❌ Por defecto'}`,
                inline: true
            }
        )
        .setTimestamp()
        .setFooter({ 
            text: 'Bot Educativo • Sistema de Verificación',
            iconURL: interaction.client.user.displayAvatarURL()
        });

    await interaction.reply({ embeds: [embed] });
}



/**
 * Handle voice status
 */
async function handleVoiceStatus(interaction) {
    const config = interaction.client.dynamicVoiceConfig?.get(interaction.guild.id);

    if (!config) {
        return interaction.reply({
            content: embedStrings.messages.info.noDynamicVoiceConfig,
            ephemeral: true
        });
    }

    const triggerChannel = interaction.guild.channels.cache.get(config.triggerChannelId);
    const activeChannels = Array.from(config.createdChannels)
        .map(channelId => interaction.guild.channels.cache.get(channelId))
        .filter(channel => channel) // Filter out deleted channels
        .length;

    const embed = new EmbedBuilder()
        .setTitle(embedStrings.dynamicVoice.status.title)
        .setColor(embedStrings.colors.info)
        .addFields(
            { 
                name: embedStrings.dynamicVoice.status.fields.triggerChannel, 
                value: triggerChannel ? `<#${triggerChannel.id}>` : 'Canal no encontrado', 
                inline: true 
            },
            { 
                name: embedStrings.dynamicVoice.status.fields.nameTemplate, 
                value: config.nameTemplate, 
                inline: true 
            },
            { 
                name: embedStrings.dynamicVoice.status.fields.userLimit, 
                value: config.userLimit === 0 ? 'Sin límite' : config.userLimit.toString(), 
                inline: true 
            },
            { 
                name: embedStrings.dynamicVoice.status.fields.activeChannels, 
                value: activeChannels.toString(), 
                inline: true 
            }
        )
        .setFooter({ text: embedStrings.dynamicVoice.status.footer })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
} 