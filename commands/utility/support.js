/**
 * Support Command - Utility Category
 * Creates a private support ticket for a user.
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('soporte')
        .setDescription('Crea un ticket de soporte privado para recibir ayuda.')
        .addStringOption(option =>
            option.setName('categoria')
                .setDescription('Selecciona la categoría de tu consulta.')
                .setRequired(true)
                .addChoices(
                    { name: '❓ Dudas sobre Cursos', value: 'dudas_cursos' },
                    { name: '⚙️ Ayuda Técnica (Bot/Discord)', value: 'ayuda_tecnica' },
                    { name: '👤 Reportar a un usuario', value: 'reportar_usuario' },
                    { name: '💡 Sugerencias', value: 'sugerencias' },
                    { name: '➕ Otro', value: 'otro' }
                ))
        .addStringOption(option =>
            option.setName('descripcion')
                .setDescription('Describe tu problema o consulta en detalle.')
                .setRequired(true)
                .setMaxLength(1500)),
    
    cooldown: 60, // 1 minute cooldown

    /**
     * Execute the support command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const category = interaction.options.getString('categoria');
        const description = interaction.options.getString('descripcion');
        const user = interaction.user;

        const supportChannelId = interaction.client.configManager.getSupportChannelId(interaction.guild.id);
        const supportRoleId = interaction.client.configManager.getStaffRoleId(interaction.guild.id);

        // Check if support system is configured
        if (!supportChannelId) {
            return interaction.reply({
                content: '❌ El canal de soporte no está configurado. Por favor, contacta a un administrador para configurar el sistema de soporte.',
                ephemeral: true
            });
        }

        if (!supportRoleId) {
            return interaction.reply({
                content: '❌ El rol de staff de soporte no está configurado. Por favor, contacta a un administrador para configurar el sistema de soporte.',
                ephemeral: true
            });
        }

        const supportChannel = interaction.guild.channels.cache.get(supportChannelId);
        if (!supportChannel) {
            return interaction.reply({
                content: '❌ El canal de soporte configurado no existe. Por favor, contacta a un administrador para verificar la configuración.',
                ephemeral: true
            });
        }

        if (supportChannel.type !== ChannelType.GuildText) {
            return interaction.reply({
                content: '❌ El canal de soporte configurado no es un canal de texto válido. Por favor, contacta a un administrador.',
                ephemeral: true
            });
        }

        try {
            const categoryMap = {
                dudas_cursos: '❓ Dudas sobre Cursos',
                ayuda_tecnica: '⚙️ Ayuda Técnica',
                reportar_usuario: '👤 Reportar a un usuario',
                sugerencias: '💡 Sugerencias',
                otro: '➕ Otro'
            };

            // Create a private thread for the ticket
            const thread = await supportChannel.threads.create({
                name: `Ticket-${user.username}-${Date.now()}`.slice(0, 100),
                type: ChannelType.PrivateThread,
                reason: `Ticket de soporte para ${user.tag}`,
            });

            // Create the ticket embed
            const ticketEmbed = new EmbedBuilder()
                .setTitle(embedStrings.supportTicket.title)
                .setColor(embedStrings.colors.primary)
                .addFields(
                    { name: `👤 ${embedStrings.supportTicket.fields.user}`, value: `${user.tag} (${user.id})`, inline: true },
                    { name: `📂 ${embedStrings.supportTicket.fields.category}`, value: categoryMap[category], inline: true },
                    { name: `🕒 ${embedStrings.supportTicket.fields.created}`, value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    { name: `📝 ${embedStrings.supportTicket.fields.description}`, value: description, inline: false },
                    { name: `🚦 ${embedStrings.supportTicket.fields.status}`, value: embedStrings.supportTicket.statusOpen, inline: false }
                )
                .setThumbnail(user.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: `${embedStrings.supportTicket.footerPrefix}${thread.id}` });

            // Create action buttons for staff
            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ticket_close_${thread.id}`)
                        .setLabel('Cerrar Ticket')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒')
                );

            // Send initial message in the thread
            await thread.send({
                content: embedStrings.messages.info.ticketWelcome(supportRoleId, user),
                embeds: [ticketEmbed],
                components: [actionRow]
            });

            // Send confirmation to the user
            await interaction.reply({
                content: embedStrings.messages.success.ticketCreated(thread.toString()),
                ephemeral: true
            });

        } catch (error) {
            console.error('❌ Error crear el ticket de soporte:', error);
            try {
                await interaction.reply({
                    content: embedStrings.messages.errors.ticketCreateError,
                    ephemeral: true
                });
            } catch (replyError) {
                console.error('❌ Failed to send error reply:', replyError);
            }
        }
    }
};
