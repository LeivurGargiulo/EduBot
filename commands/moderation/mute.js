/**
 * Mute Command - Moderation Category
 * Temporarily mutes a user.
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

// Helper function to parse time strings like "10m", "1h", "7d"
function parseTime(timeString) {
    if (!timeString) return null;
    const timeRegex = /^(\d+)([smhd])$/;
    const match = timeString.toLowerCase().match(timeRegex);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2];
    
    const unitMap = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };

    const duration = value * unitMap[unit];
    
    // Discord's max timeout is 28 days (2419200000 ms)
    if (duration > 2419200000) return null;
    
    return duration;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('silenciar')
        .setDescription('Silencia temporalmente a un usuario.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario a silenciar.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tiempo')
                .setDescription('Duración del silencio (e.g., 10m, 1h, 7d). Máximo 28d.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('El motivo del silencio.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    /**
     * Execute the mute command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario');
        const timeString = interaction.options.getString('tiempo');
        const reason = interaction.options.getString('motivo') || 'No se especificó un motivo.';
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: embedStrings.messages.errors.userNotFound, ephemeral: true });
        }

        if (member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: embedStrings.messages.errors.cannotMuteAdmin, ephemeral: true });
        }

        const duration = parseTime(timeString);

        if (!duration) {
            return interaction.reply({
                content: embedStrings.messages.errors.invalidTimeFormat,
                ephemeral: true
            });
        }

        try {
            await member.timeout(duration, reason);

            const successEmbed = new EmbedBuilder()
                .setTitle(embedStrings.moderation.userMuted.title)
                .setColor(embedStrings.colors.warning)
                .addFields(
                    { name: embedStrings.moderation.userMuted.fields.user, value: targetUser.tag },
                    { name: embedStrings.moderation.userMuted.fields.duration, value: timeString },
                    { name: embedStrings.moderation.userMuted.fields.reason, value: reason },
                    { name: embedStrings.moderation.userMuted.fields.moderator, value: interaction.user.tag }
                )
                .setTimestamp();

            const modChannelId = interaction.client.configManager.getModerationChannelId(interaction.guild.id);
            if (modChannelId) {
                const modChannel = await interaction.guild.channels.fetch(modChannelId).catch(() => null);
                if (modChannel) {
                    await modChannel.send({ embeds: [successEmbed] });
                }
            }

            await interaction.reply({
               content: embedStrings.messages.success.userMuted(targetUser.tag, timeString),
                ephemeral: true
            });

        } catch (error) {
            console.error('Error silenciar al usuario:', error);
            await interaction.reply({
               content: embedStrings.messages.errors.cannotMuteUser,
                ephemeral: true
            });
        }
    }
};
