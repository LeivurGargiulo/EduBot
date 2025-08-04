/**
 * Feedback Command - Utility Category
 * Sends a link to an external feedback form.
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Envía un enlace para dar tu opinión sobre la comunidad.'),
    
    cooldown: 30,

    /**
     * Execute the feedback command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const feedbackUrl = interaction.client.configManager.getFeedbackUrl(interaction.guild.id);

        if (!feedbackUrl) {
            return interaction.reply({
                content: embedStrings.messages.errors.feedbackNotConfigured,
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(embedStrings.feedback.title)
            .setDescription(embedStrings.feedback.description)
            .setColor(embedStrings.colors.primary)
            .addFields({
                name: embedStrings.feedback.fields.howItHelps.name,
                value: embedStrings.feedback.fields.howItHelps.value
            })
            .setFooter({ text: embedStrings.feedback.footer });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Enviar Feedback')
                    .setStyle(ButtonStyle.Link)
                    .setURL(feedbackUrl)
                    .setEmoji('🔗')
            );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};