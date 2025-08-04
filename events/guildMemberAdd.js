/**
 * Guild Member Add Event Handler
 * Handles new member join events
 */

const { Events, EmbedBuilder } = require('discord.js');
const embedStrings = require('../data/embedStrings');

module.exports = {
    name: Events.GuildMemberAdd,
    
    /**
     * Execute function for new member join
     * @param {GuildMember} member 
     */
    async execute(member) {
        try {
            // Log new member join to moderation channel if configured
            await logMemberJoin(member);

        } catch (error) {
            console.error('❌ Error in guildMemberAdd event:', error);
        }
    }
};

/**
 * Log new member join to moderation channel
 * @param {GuildMember} member 
 */
async function logMemberJoin(member) {
    try {
        const modChannelId = member.client.configManager.getModerationChannelId(member.guild.id);
        if (!modChannelId) {
            return;
        }

        const modChannel = member.guild.channels.cache.get(modChannelId);
        if (!modChannel) return;

        const joinEmbed = new EmbedBuilder()
            .setTitle('👋 Nuevo Miembro')
            .setDescription(`${member.user.tag} se ha unido al servidor`)
            .setColor(embedStrings.colors.info)
            .addFields(
                { name: 'Usuario', value: `${member.user.tag} (${member.user.id})`, inline: true },
                { name: 'Cuenta creada', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Estado', value: '✅ Miembro activo', inline: true }
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

        await modChannel.send({ embeds: [joinEmbed] });
        console.log(`👋 Nuevo miembro registrado: ${member.user.tag} en ${member.guild.name}`);

    } catch (error) {
        console.error('❌ Error enviando log de moderación:', error);
    }
}

