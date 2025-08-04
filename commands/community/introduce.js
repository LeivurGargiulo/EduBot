/**
 * Introduce Command - Community Category
 * Interactive user introduction guide
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('presentarme')
        .setDescription('Envía la guía para presentarse a la comunidad (Solo para administradores)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    cooldown: 10,

    /**
     * Execute the introduce command
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

        // Create introduction guide embed
        const embed = new EmbedBuilder()
            .setTitle(embedStrings.introduction.title)
            .setDescription(embedStrings.introduction.description)
            .setColor(embedStrings.colors.info)
            .addFields(
                {
                    name: embedStrings.introduction.fields.template.name,
                    value: embedStrings.introduction.fields.template.value,
                    inline: false
                },
                {
                    name: embedStrings.introduction.fields.tips.name,
                    value: embedStrings.introduction.fields.tips.value,
                    inline: true
                },
                {
                    name: embedStrings.introduction.fields.greatIntro.name,
                    value: embedStrings.introduction.fields.greatIntro.value,
                    inline: true
                }
            )
            .setTimestamp()
            .setFooter({ text: embedStrings.introduction.footer, iconURL: interaction.client.user.displayAvatarURL() });

        // Create action buttons
        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('intro_example')
                    .setLabel('Ver Ejemplo')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('👁️'),
                new ButtonBuilder()
                    .setCustomId('intro_roles')
                    .setLabel('Configurar mis Roles')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎭')
            );

        await interaction.channel.send({
            embeds: [embed],
            components: [actionRow]
        });

        await interaction.reply({
            content: embedStrings.messages.success.introGuideSent,
            ephemeral: true
        });
    }
};
