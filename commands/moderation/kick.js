/**
 * Kick Command - Moderation Category
 * Kicks a user from the server.
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('expulsar')
        .setDescription('Expulsa a un usuario del servidor.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario a expulsar.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('El motivo de la expulsión.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    /**
     * Execute the kick command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('motivo') || 'No se especificó un motivo.';
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: embedStrings.messages.errors.userNotFound, ephemeral: true });
        }

        if (!member.kickable) {
            return interaction.reply({
                content: embedStrings.messages.errors.cannotKickUser,
                ephemeral: true
            });
        }

        try {
            const dmEmbed = new EmbedBuilder()
                .setTitle(embedStrings.moderation.userKicked.dmTitle(interaction.guild.name))
                .setColor(embedStrings.colors.error)
                .addFields(
                    { name: embedStrings.moderation.userKicked.fields.reason, value: reason },
                    { name: embedStrings.moderation.userKicked.fields.moderator, value: interaction.user.tag }
                )
                .setTimestamp();
            
            await targetUser.send({ embeds: [dmEmbed] }).catch(err => {
                console.log(`No se pudo enviar MD a ${targetUser.tag}. Puede que tenga los MDs desactivados.`);
            });

            await member.kick(reason);

            const successEmbed = new EmbedBuilder()
                .setTitle(embedStrings.moderation.userKicked.title)
                .setColor(embedStrings.colors.error)
                .addFields(
                    { name: embedStrings.moderation.userKicked.fields.user, value: targetUser.tag },
                    { name: embedStrings.moderation.userKicked.fields.reason, value: reason },
                    { name: embedStrings.moderation.userKicked.fields.moderator, value: interaction.user.tag }
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
                content: embedStrings.messages.success.userKicked(targetUser.tag),
                ephemeral: true
            });

        } catch (error) {
            console.error('Error expulsar al usuario:', error);
            await interaction.reply({
                content: embedStrings.messages.errors.kickError,
                ephemeral: true
            });
        }
    }
};
