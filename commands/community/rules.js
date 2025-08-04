/**
 * Rules Command - Community Category
 * Displays community rules embed
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('normas')
        .setDescription('Envía las normas y directrices de la comunidad (Solo para staff)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    cooldown: 5,

    /**
     * Execute the rules command
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

        // Get custom texts or use defaults
        const customTitle = interaction.client.configManager.getCustomText(
            interaction.guild.id, 'rules', 'title', embedStrings.rules.title
        );
        const customDescription = interaction.client.configManager.getCustomText(
            interaction.guild.id, 'rules', 'description', embedStrings.rules.description
        );

        // Create comprehensive rules embed
        const rulesEmbed = new EmbedBuilder()
            .setTitle(customTitle)
            .setDescription(customDescription)
            .setColor(embedStrings.colors.primary)
            .addFields(
                {
                    name: embedStrings.rules.fields.respect.name,
                    value: embedStrings.rules.fields.respect.value,
                    inline: false
                },
                {
                    name: embedStrings.rules.fields.communication.name,
                    value: embedStrings.rules.fields.communication.value,
                    inline: false
                },
                {
                    name: embedStrings.rules.fields.learning.name,
                    value: embedStrings.rules.fields.learning.value,
                    inline: false
                },
                {
                    name: embedStrings.rules.fields.privacy.name,
                    value: embedStrings.rules.fields.privacy.value,
                    inline: false
                },
                {
                    name: embedStrings.rules.fields.content.name,
                    value: embedStrings.rules.fields.content.value,
                    inline: false
                },
                {
                    name: embedStrings.rules.fields.technical.name,
                    value: embedStrings.rules.fields.technical.value,
                    inline: false
                }
            )
            .setTimestamp()
            .setFooter({ text: embedStrings.rules.footer, iconURL: interaction.client.user.displayAvatarURL() });

        // Create consequences embed
        const consequencesEmbed = new EmbedBuilder()
            .setTitle(embedStrings.consequences.title)
            .setDescription(embedStrings.consequences.description)
            .setColor(embedStrings.colors.red)
            .addFields(
                {
                    name: embedStrings.consequences.fields.warnings.name,
                    value: embedStrings.consequences.fields.warnings.value,
                    inline: true
                },
                {
                    name: embedStrings.consequences.fields.serious.name,
                    value: embedStrings.consequences.fields.serious.value,
                    inline: true
                },
                {
                    name: embedStrings.consequences.fields.appeal.name,
                    value: embedStrings.consequences.fields.appeal.value,
                    inline: false
                }
            )
            .setFooter({ text: embedStrings.consequences.footer });

        // Create helpful commands embed
        const commandsEmbed = new EmbedBuilder()
            .setTitle(embedStrings.helpfulCommands.title)
            .setDescription(embedStrings.helpfulCommands.description)
            .setColor(embedStrings.colors.success)
            .addFields(
                {
                    name: embedStrings.helpfulCommands.fields.gettingStarted.name,
                    value: embedStrings.helpfulCommands.fields.gettingStarted.value,
                    inline: true
                },
                {
                    name: embedStrings.helpfulCommands.fields.learning.name,
                    value: embedStrings.helpfulCommands.fields.learning.value,
                    inline: true
                },
                {
                    name: embedStrings.helpfulCommands.fields.community.name,
                    value: embedStrings.helpfulCommands.fields.community.value,
                    inline: true
                }
            );

        await interaction.channel.send({
            embeds: [rulesEmbed, consequencesEmbed, commandsEmbed]
        });

        await interaction.reply({
            content: embedStrings.messages.success.rulesSent,
            ephemeral: true
        });
    }
};
