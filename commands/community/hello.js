/**
 * Hello Command - Community Category
 * Sends a welcome embed message.
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hola')
        .setDescription('Envía el mensaje de bienvenida al canal (Solo para staff)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    cooldown: 10,

    /**
     * Execute the hello command
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

        const doubtsChannelId = interaction.client.configManager.getDoubtsChannelId(interaction.guild.id);
        const announcementsChannelId = interaction.client.configManager.getAnnouncementsChannelId(interaction.guild.id);

        const doubtsChannelMention = doubtsChannelId ? `<#${doubtsChannelId}>` : '`#canal-dudas` (no configurado)';
        const announcementsChannelMention = announcementsChannelId ? `<#${announcementsChannelId}>` : '`#anuncios` (no configurado)';

        // Get custom texts or use defaults
        const customTitle = interaction.client.configManager.getCustomText(
            interaction.guild.id, 'welcome', 'title', embedStrings.welcome.title
        );
        const customDescription = interaction.client.configManager.getCustomText(
            interaction.guild.id, 'welcome', 'description', embedStrings.welcome.description
        );
        const customFooter = interaction.client.configManager.getCustomText(
            interaction.guild.id, 'welcome', 'footer', embedStrings.welcome.footer
        );

        // Create the welcome embed using centralized strings
        const welcomeEmbed = new EmbedBuilder()
            .setColor(embedStrings.colors.primary)
            .setTitle(customTitle)
            .setDescription(customDescription)
            .addFields(
                {
                    name: embedStrings.welcome.fields.howToStart.name,
                    value: embedStrings.welcome.fields.howToStart.value,
                    inline: false
                },
                {
                    name: embedStrings.welcome.fields.rules.name,
                    value: embedStrings.welcome.fields.rules.value,
                    inline: false
                },
                {
                    name: embedStrings.welcome.fields.importantLinks.name,
                    value: embedStrings.welcome.fields.importantLinks.value(doubtsChannelMention, announcementsChannelMention),
                    inline: false
                }
            )
            .setFooter({ 
                text: customFooter, 
                iconURL: interaction.client.user.displayAvatarURL() 
            });

        // Send the embed to the current channel
        await interaction.channel.send({ embeds: [welcomeEmbed] });

        // Send a confirmation reply to the admin
        await interaction.reply({
            content: embedStrings.messages.success.welcomeSent,
            ephemeral: true
        });
    }
};
