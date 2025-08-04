/**
 * Roles Command - Community Category
 * Interactive role selection with buttons for pronouns, identities, courses, and interests
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Envía el panel de selección de roles (Solo para staff)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    cooldown: 10,

    /**
     * Execute the roles command
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

        // Create main embed
        const embed = new EmbedBuilder()
            .setTitle(embedStrings.roles.title)
            .setDescription(embedStrings.roles.description)
            .setColor(embedStrings.colors.primary)
            .addFields(
                {
                    name: embedStrings.roles.fields.pronouns.name,
                    value: embedStrings.roles.fields.pronouns.value,
                    inline: false
                },
                {
                    name: embedStrings.roles.fields.identities.name,
                    value: embedStrings.roles.fields.identities.value,
                    inline: false
                }
            )
            .setTimestamp()
            .setFooter({ text: embedStrings.roles.footer, iconURL: interaction.client.user.displayAvatarURL() });

        // Pronoun selection buttons
        const pronounRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('role_pronoun-el')
                    .setLabel('Él')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('role_pronoun-ella')
                    .setLabel('Ella')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('role_pronoun-elle')
                    .setLabel('Elle')
                    .setStyle(ButtonStyle.Primary)
            );

        // Identity selection buttons
        const identityRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('role_identity-transmasc')
                    .setLabel('Transmasc')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('role_identity-transfem')
                    .setLabel('Transfem')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('role_identity-nobinarie')
                    .setLabel('No Binarie')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('role_identity-travesti')
                    .setLabel('Travesti')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('role_identity-aliade')
                    .setLabel('Aliade')
                    .setStyle(ButtonStyle.Secondary)
            );

        // Send the role selection message
        await interaction.channel.send({
            embeds: [embed],
            components: [pronounRow, identityRow]
        });

        await interaction.reply({
            content: embedStrings.messages.success.rolesPanelSent,
            ephemeral: true
        });
    }
};