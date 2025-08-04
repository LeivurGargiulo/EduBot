/**
 * Report Command - Moderation Category
 * Allows moderators to file a formal report against a user.
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reporte')
        .setDescription('Reporta a un usuario a la moderación de forma privada.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario a reportar.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('El motivo del reporte.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), // Only moderators can use it

    /**
     * Execute the report command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('motivo');
        const reporter = interaction.user;

        const modChannelId = interaction.client.configManager.getModerationChannelId(interaction.guild.id);
        if (!modChannelId) {
            return interaction.reply({
                content: embedStrings.messages.errors.moderationChannelNotConfigured,
                ephemeral: true
            });
        }

        const modChannel = await interaction.guild.channels.fetch(modChannelId).catch(() => null);
        if (!modChannel) {
            return interaction.reply({
                content: embedStrings.messages.errors.moderationChannelNotFound,
                ephemeral: true
            });
        }

        const reportEmbed = new EmbedBuilder()
            .setTitle(embedStrings.moderation.userReport.title)
            .setColor(embedStrings.colors.error)
            .addFields(
                { name: `👤 ${embedStrings.moderation.userReport.fields.reportedUser}`, value: `${targetUser.tag} (${targetUser.id})`, inline: false },
                { name: `👮‍♂️ ${embedStrings.moderation.userReport.fields.reportedBy}`, value: `${reporter.tag} (${reporter.id})`, inline: false },
                { name: `📝 ${embedStrings.moderation.userReport.fields.reason}`, value: reason, inline: false }
            )
            .setThumbnail(targetUser.displayAvatarURL())
            .setTimestamp();

        try {
            await modChannel.send({ embeds: [reportEmbed] });
            await interaction.reply({
                content: embedStrings.messages.success.reportSent(targetUser.tag),
                ephemeral: true
            });
        } catch (error) {
            console.error('Error sending report:', error);
            await interaction.reply({
                content: embedStrings.messages.errors.reportSendError,
                ephemeral: true
            });
        }
    }
};

