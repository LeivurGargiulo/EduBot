/**
 * Debug Command - Admin Category
 * Provides comprehensive debugging and monitoring information
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { logger } = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debug')
        .setDescription('Muestra información de depuración y monitoreo del bot')
        .addStringOption(option =>
            option.setName('tipo')
                .setDescription('Tipo de información de depuración')
                .setRequired(false)
                .addChoices(
                    { name: '📊 General', value: 'general' },
                    { name: '⚡ Rendimiento', value: 'performance' },
                    { name: '🖥️ Sistema', value: 'system' },
                    { name: '🤖 Estado del Bot', value: 'bot' },
                    { name: '❌ Errores Recientes', value: 'errors' },
                    { name: '🔧 Configuración', value: 'config' }
                ))
        .addBooleanOption(option =>
            option.setName('modo_debug')
                .setDescription('Activar/desactivar modo debug detallado')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('nivel_debug')
                .setDescription('Establecer nivel de debug (0-3)')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(3))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    cooldown: 30,

    /**
     * Execute the debug command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const startTime = Date.now();
        
        try {
            // Check if debug manager is available
            if (!interaction.client.debugManager) {
                await interaction.reply({
                    content: '❌ El sistema de depuración no está disponible.',
                    ephemeral: true
                });
                return;
            }

            const debugManager = interaction.client.debugManager;
            const tipo = interaction.options.getString('tipo') || 'general';
            const modoDebug = interaction.options.getBoolean('modo_debug');
            const nivelDebug = interaction.options.getInteger('nivel_debug');

            // Handle debug mode toggle
            if (modoDebug !== null) {
                debugManager.setDebugMode(modoDebug);
                await interaction.reply({
                    content: `🔧 Modo debug ${modoDebug ? 'activado' : 'desactivado'}.`,
                    ephemeral: true
                });
                return;
            }

            // Handle debug level setting
            if (nivelDebug !== null) {
                debugManager.setDebugLevel(nivelDebug);
                await interaction.reply({
                    content: `🔧 Nivel de debug establecido en: ${nivelDebug}`,
                    ephemeral: true
                });
                return;
            }

            // Create debug embed based on type
            let embed;
            
            switch (tipo) {
                case 'performance':
                    embed = debugManager.createDebugEmbed('performance');
                    break;
                case 'system':
                    embed = debugManager.createDebugEmbed('system');
                    break;
                case 'bot':
                    embed = debugManager.createDebugEmbed('bot');
                    break;
                case 'errors':
                    embed = debugManager.createDebugEmbed('errors');
                    break;
                case 'config':
                    embed = await createConfigDebugEmbed(interaction);
                    break;
                default:
                    embed = debugManager.createDebugEmbed('general');
            }

            // Add debug mode status to embed
            const debugInfo = debugManager.getDebugInfo();
            embed.addFields({
                name: '🔧 Debug Status',
                value: `Modo: ${debugInfo.debugMode ? '🟢 Activo' : '🔴 Inactivo'}\nNivel: ${debugInfo.debugLevel}`,
                inline: true
            });

            // Add execution time
            const executionTime = Date.now() - startTime;
            embed.addFields({
                name: '⚡ Tiempo de Ejecución',
                value: `${executionTime}ms`,
                inline: true
            });

            await interaction.reply({ embeds: [embed], ephemeral: true });

            // Log command execution
            logger.logCommand('debug', interaction.user.tag, interaction.guild.name, true, executionTime);
            
            // Record in debug manager
            debugManager.logCommandExecution('debug', executionTime, true, {
                user: interaction.user,
                guild: interaction.guild,
                channel: interaction.channel
            });

        } catch (error) {
            const executionTime = Date.now() - startTime;
            
            logger.error('Error in debug command', {
                error: error.message,
                user: interaction.user.tag,
                guild: interaction.guild?.name,
                executionTime
            });

            // Log in debug manager if available
            if (interaction.client.debugManager) {
                interaction.client.debugManager.logError(error, {
                    user: interaction.user,
                    guild: interaction.guild,
                    channel: interaction.channel,
                    command: this
                });
                interaction.client.debugManager.logCommandExecution('debug', executionTime, false, {
                    user: interaction.user,
                    guild: interaction.guild,
                    channel: interaction.channel
                });
            }

            await interaction.reply({
                content: '❌ Error al obtener información de depuración.',
                ephemeral: true
            });
        }
    }
};

/**
 * Create configuration debug embed
 * @param {ChatInputCommandInteraction} interaction 
 * @returns {EmbedBuilder}
 */
async function createConfigDebugEmbed(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('🔧 Configuración del Bot')
        .setColor(0x0099FF)
        .setTimestamp();

    try {
        // Get guild configuration
        const guildConfig = interaction.client.configManager?.getGuildConfig?.(interaction.guild.id);
        
        if (guildConfig) {
            embed.addFields(
                { 
                    name: '📋 Configuración General', 
                    value: `Canal de Moderación: ${guildConfig.moderation_channel_id ? `<#${guildConfig.moderation_channel_id}>` : 'No configurado'}\nCanal de Soporte: ${guildConfig.support_channel_id ? `<#${guildConfig.support_channel_id}>` : 'No configurado'}`, 
                    inline: false 
                },
                { 
                    name: '👥 Roles', 
                    value: `Staff: ${guildConfig.staff_role_id ? `<@&${guildConfig.staff_role_id}>` : 'No configurado'}\nModerador: ${guildConfig.moderator_role_id ? `<@&${guildConfig.moderator_role_id}>` : 'No configurado'}`, 
                    inline: true 
                },
                { 
                    name: '✅ Verificación', 
                    value: `Activa: ${guildConfig.verification?.enabled ? 'Sí' : 'No'}\nCanal: ${guildConfig.verification?.channel_id ? `<#${guildConfig.verification.channel_id}>` : 'No configurado'}`, 
                    inline: true 
                }
            );

            // Add identity roles info
            if (guildConfig.identityRoles && Object.keys(guildConfig.identityRoles).length > 0) {
                const identityRolesText = Object.entries(guildConfig.identityRoles)
                    .map(([type, roleId]) => `${type}: <@&${roleId}>`)
                    .join('\n');
                
                embed.addFields({
                    name: '🎭 Roles de Identidad',
                    value: identityRolesText,
                    inline: false
                });
            }

            // Add custom texts info
            if (guildConfig.customTexts && Object.keys(guildConfig.customTexts).length > 0) {
                const customTextsCount = Object.values(guildConfig.customTexts)
                    .reduce((total, section) => total + Object.keys(section).length, 0);
                
                embed.addFields({
                    name: '📝 Textos Personalizados',
                    value: `${customTextsCount} textos configurados`,
                    inline: true
                });
            }
        } else {
            embed.setDescription('❌ No se encontró configuración para este servidor.');
        }

        // Add environment variables status
        const envStatus = {
            DISCORD_TOKEN: !!process.env.DISCORD_TOKEN,
            CLIENT_ID: !!process.env.CLIENT_ID,
            GUILD_ID: !!process.env.GUILD_ID,
            MODERATION_CHANNEL_ID: !!process.env.MODERATION_CHANNEL_ID,
            SUPPORT_CHANNEL_ID: !!process.env.SUPPORT_CHANNEL_ID
        };

        const envStatusText = Object.entries(envStatus)
            .map(([key, value]) => `${key}: ${value ? '✅' : '❌'}`)
            .join('\n');

        embed.addFields({
            name: '🔐 Variables de Entorno',
            value: envStatusText,
            inline: false
        });

    } catch (error) {
        embed.setDescription(`❌ Error al obtener configuración: ${error.message}`);
    }

    return embed;
}

