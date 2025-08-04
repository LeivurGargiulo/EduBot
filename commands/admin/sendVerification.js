/**
 * Send Verification Command - Admin Category
 * Sends the verification message to the configured channel
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enviar-verificacion')
        .setDescription('Envía el mensaje de verificación al canal configurado (Solo para staff)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    cooldown: 10,

    /**
     * Execute the send verification command
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

        const config = interaction.client.configManager.getGuildConfig(interaction.guild.id);
        const verificationConfig = config.verification;

        if (!verificationConfig || !verificationConfig.enabled) {
            return interaction.reply({
                content: embedStrings.messages.errors.verificationNotEnabled,
                ephemeral: true
            });
        }

        if (!verificationConfig.channelId || !verificationConfig.roleId) {
            return interaction.reply({
                content: embedStrings.messages.errors.verificationNotConfigured,
                ephemeral: true
            });
        }

        const channel = interaction.guild.channels.cache.get(verificationConfig.channelId);
        const role = interaction.guild.roles.cache.get(verificationConfig.roleId);

        if (!channel) {
            return interaction.reply({
                content: embedStrings.messages.errors.verificationChannelNotFound,
                ephemeral: true
            });
        }

        if (!role) {
            return interaction.reply({
                content: embedStrings.messages.errors.verificationRoleNotFound,
                ephemeral: true
            });
        }

        try {
            // Get custom texts or use defaults
            const customTitle = interaction.client.configManager.getCustomText(
                interaction.guild.id, 'verification', 'title', 
                verificationConfig.title || embedStrings.verification.defaultTitle
            );
            const customDescription = interaction.client.configManager.getCustomText(
                interaction.guild.id, 'verification', 'description',
                verificationConfig.description || embedStrings.verification.defaultDescription
            );
            const customButtonText = interaction.client.configManager.getCustomText(
                interaction.guild.id, 'verification', 'buttonText',
                embedStrings.verification.buttonText
            );

            // Create verification embed
            const embed = new EmbedBuilder()
                .setTitle(customTitle)
                .setDescription(customDescription)
                .setColor(embedStrings.colors.primary)
                .addFields({
                    name: embedStrings.verification.fields.instructions.name,
                    value: embedStrings.verification.fields.instructions.value,
                    inline: false
                })
                .setFooter({ 
                    text: embedStrings.verification.footer,
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            // Create verification button
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('verify_user')
                        .setLabel(customButtonText)
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('✅')
                );

            // Send verification message
            await channel.send({
                embeds: [embed],
                components: [row]
            });

            await interaction.reply({
                content: embedStrings.messages.success.verificationSent(channel),
                ephemeral: true
            });

        } catch (error) {
            console.error('❌ Error enviar mensaje de verificación:', error);
            await interaction.reply({
                content: embedStrings.messages.errors.verificationSendError,
                ephemeral: true
            });
        }
    }
};


