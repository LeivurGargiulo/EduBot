/**
 * Configure Verification Command - Admin Category
 * Configures the verification system for new members
 */

const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configurar-verificacion')
        .setDescription('Configura el sistema de verificación de miembros (Solo para staff)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Canal donde aparecerá el mensaje de verificación')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('rol-verificado')
                .setDescription('Rol que se otorga a los usuarios verificados')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('titulo')
                .setDescription('Título del mensaje de verificación')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('descripcion')
                .setDescription('Descripción del mensaje de verificación')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('activar')
                .setDescription('Activar o desactivar el sistema de verificación')
                .setRequired(false)),
    
    cooldown: 10,

    /**
     * Execute the configure verification command
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

        const channel = interaction.options.getChannel('canal');
        const verifiedRole = interaction.options.getRole('rol-verificado');
        const title = interaction.options.getString('titulo');
        const description = interaction.options.getString('descripcion');
        const activate = interaction.options.getBoolean('activar');

        try {
            // Get current config
            let guildConfig = interaction.client.configManager.getGuildConfig(interaction.guild.id);
            
            if (!guildConfig.verification) {
                guildConfig.verification = {};
            }

            const updates = [];

            if (channel) {
                guildConfig.verification.channelId = channel.id;
                updates.push(`• Canal de verificación: ${channel}`);
            }

            if (verifiedRole) {
                guildConfig.verification.roleId = verifiedRole.id;
                updates.push(`• Rol verificado: ${verifiedRole}`);
            }

            if (title) {
                guildConfig.verification.title = title;
                updates.push(`• Título personalizado configurado`);
            }

            if (description) {
                guildConfig.verification.description = description;
                updates.push(`• Descripción personalizada configurada`);
            }

            if (activate !== null) {
                guildConfig.verification.enabled = activate;
                updates.push(`• Sistema ${activate ? 'activado' : 'desactivado'}`);
            }

            // Save config
            interaction.client.configManager.setGuildConfig(interaction.guild.id, guildConfig);

            if (updates.length === 0) {
                return interaction.reply({
                    content: '❌ No se especificaron cambios para la configuración de verificación.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('✅ Configuración de Verificación Actualizada')
                .setDescription(updates.join('\n'))
                .setColor(embedStrings.colors.success)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Error configurar verificación:', error);
            await interaction.reply({
                content: embedStrings.messages.errors.configurationError,
                ephemeral: true
            });
        }
    }
};
