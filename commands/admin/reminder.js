/**
 * Reminder Command - Admin Category
 * Manages reminders for classes
 */

const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recordatorio')
        .setDescription('Gestiona recordatorios para clases y eventos')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('crear')
                .setDescription('Crea un recordatorio único para una clase')
                .addStringOption(option =>
                    option.setName('curso')
                        .setDescription('Código del curso (ej: MB, JS, TW)')
                        .setRequired(true)
                        .setMaxLength(2))
                .addStringOption(option =>
                    option.setName('fecha-hora')
                        .setDescription('Fecha y hora (formato: YYYY-MM-DD HH:MM)')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('Canal donde enviar el recordatorio')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('descripcion')
                        .setDescription('Descripción del recordatorio')
                        .setRequired(true)
                        .setMaxLength(500)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('listar')
                .setDescription('Muestra próximos recordatorios')
                .addStringOption(option =>
                    option.setName('curso')
                        .setDescription('Filtrar por código de curso (opcional)')
                        .setRequired(false)
                        .setMaxLength(2)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('borrar')
                .setDescription('Elimina un recordatorio')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('ID del recordatorio a eliminar')
                        .setRequired(true))),
    
    cooldown: 5,

    /**
     * Execute the reminder command
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

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'crear':
                    await this.createReminder(interaction);
                    break;
                case 'listar':
                    await this.listReminders(interaction);
                    break;
                case 'borrar':
                    await this.deleteReminder(interaction);
                    break;
                default:
                    await interaction.reply({
                        content: '❌ Subcomando no válido',
                        ephemeral: true
                    });
            }
        } catch (error) {
            console.error('❌ Error in Reminder Command:', error);
            await interaction.reply({
                content: embedStrings.messages.errors.reminderError,
                ephemeral: true
            });
        }
    },

    /**
     * Create a new reminder
     * @param {ChatInputCommandInteraction} interaction 
     */
    async createReminder(interaction) {
        const courseCode = interaction.options.getString('curso').toUpperCase();
        const dateTimeString = interaction.options.getString('fecha-hora');
        const channel = interaction.options.getChannel('canal');
        const description = interaction.options.getString('descripcion');

        // Validate course exists
        const config = interaction.client.configManager.getGuildConfig(interaction.guild.id);
        const courses = config.courses || {};
        const courseData = courses[courseCode];
        
        if (!courseData) {
            return interaction.reply({
                content: embedStrings.messages.errors.courseNotRegistered(courseCode),
                ephemeral: true
            });
        }

        // Parse and validate datetime
        const reminderDateTime = parseDateTime(dateTimeString);
        if (!reminderDateTime) {
            return interaction.reply({
                content: embedStrings.messages.errors.invalidDateTimeFormat,
                ephemeral: true
            });
        }

        // Check if datetime is in the future
        if (reminderDateTime <= new Date()) {
            return interaction.reply({
                content: embedStrings.messages.errors.pastDateTime,
                ephemeral: true
            });
        }

        // Generate unique reminder ID
        const reminderId = generateReminderId();

        // Find course role if it exists
        const courseRole = interaction.guild.roles.cache.find(role => 
            role.name.includes(courseCode) || role.name.includes(courseData.name)
        );

        // Create reminder object
        const reminderData = {
            courseCode: courseCode,
            courseName: courseData.name,
            datetime: reminderDateTime.toISOString(),
            channelId: channel.id,
            description: description,
            roleId: courseRole ? courseRole.id : null,
            createdBy: interaction.user.id,
            createdAt: new Date().toISOString()
        };

        // Save reminder to config
        if (!config.reminders) {
            config.reminders = {};
        }
        config.reminders[reminderId] = reminderData;
        interaction.client.configManager.setGuildConfig(interaction.guild.id, config);

        // Create success embed
        const timestamp = Math.floor(reminderDateTime.getTime() / 1000);
        const courseEmoji = getCourseEmoji(courseCode);

        const successEmbed = new EmbedBuilder()
            .setTitle(embedStrings.reminders.reminderCreated.title)
            .setDescription(embedStrings.reminders.reminderCreated.description(reminderId))
            .setColor(embedStrings.colors.success)
            .addFields(
                {
                    name: embedStrings.reminders.reminderCreated.fields.details.name,
                    value: `${courseEmoji} **${courseData.name}** (${courseCode})\n` +
                           `📅 <t:${timestamp}:F>\n` +
                           `🕒 <t:${timestamp}:R>`,
                    inline: false
                },
                {
                    name: embedStrings.reminders.reminderCreated.fields.notification.name,
                    value: `📍 ${channel}\n` +
                           `${courseRole ? `👥 ${courseRole}` : '👥 Sin rol específico'}`,
                    inline: true
                }
            )
            .setFooter({ 
                text: embedStrings.reminders.reminderCreated.footer,
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        if (description) {
            successEmbed.addFields({
                name: embedStrings.reminders.reminderCreated.fields.description.name,
                value: description,
                inline: false
            });
        }

        await interaction.reply({ embeds: [successEmbed] });

        // Log to moderation channel
        const modChannelId = interaction.client.configManager.getModerationChannelId(interaction.guild.id);
        if (modChannelId) {
            const modChannel = interaction.guild.channels.cache.get(modChannelId);
            if (modChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('⏰ Nuevo Recordatorio Creado')
                    .setColor(embedStrings.colors.info)
                    .addFields(
                        { name: 'Recordatorio ID', value: reminderId, inline: true },
                        { name: 'Curso', value: `${courseData.name} (${courseCode})`, inline: true },
                        { name: 'Fecha', value: `<t:${timestamp}:F>`, inline: true },
                        { name: 'Creado por', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                        { name: 'Canal', value: channel.toString(), inline: true },
                        { name: 'Rol', value: courseRole ? courseRole.toString() : 'Ninguno', inline: true }
                    )
                    .setTimestamp();

                await modChannel.send({ embeds: [logEmbed] });
            }
        }

        console.log(`⏰ Recordatorio ${reminderId} creado por ${interaction.user.tag} en ${interaction.guild.name}`);
    },

    /**
     * List reminders
     * @param {ChatInputCommandInteraction} interaction 
     */
    async listReminders(interaction) {
        const courseFilter = interaction.options.getString('curso')?.toUpperCase();

        const config = interaction.client.configManager.getGuildConfig(interaction.guild.id);
        const reminders = config.reminders || {};

        let filteredReminders = Object.entries(reminders)
            .map(([id, reminder]) => ({ id, ...reminder }));

        // Apply course filter
        if (courseFilter) {
            filteredReminders = filteredReminders.filter(reminder => reminder.courseCode === courseFilter);
        }

        // Filter future reminders only
        const now = new Date();
        filteredReminders = filteredReminders.filter(reminder => new Date(reminder.datetime) > now);

        // Sort by datetime
        filteredReminders.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

        if (filteredReminders.length === 0) {
            const noRemindersEmbed = new EmbedBuilder()
                .setTitle(embedStrings.reminders.remindersList.noReminders.title)
                .setDescription(courseFilter ? 
                    embedStrings.reminders.remindersList.noReminders.descriptionFiltered(courseFilter) :
                    embedStrings.reminders.remindersList.noReminders.description
                )
                .setColor(embedStrings.colors.warning)
                .setFooter({ text: embedStrings.reminders.remindersList.footer });

            return interaction.reply({ embeds: [noRemindersEmbed] });
        }

        // Create main embed
        const embed = new EmbedBuilder()
            .setTitle(courseFilter ? 
                embedStrings.reminders.remindersList.titleFiltered(courseFilter) :
                embedStrings.reminders.remindersList.title
            )
            .setDescription(embedStrings.reminders.remindersList.description(filteredReminders.length))
            .setColor(embedStrings.colors.info)
            .setTimestamp()
            .setFooter({ 
                text: embedStrings.reminders.remindersList.footer,
                iconURL: interaction.client.user.displayAvatarURL()
            });

        // Add reminders (limit to 10)
        const remindersList = filteredReminders.slice(0, 10).map(reminder => {
            const reminderDate = new Date(reminder.datetime);
            const timestamp = Math.floor(reminderDate.getTime() / 1000);
            const courseEmoji = getCourseEmoji(reminder.courseCode);
            const role = reminder.roleId ? interaction.guild.roles.cache.get(reminder.roleId) : null;
            
            return `${courseEmoji} **${reminder.courseName}** (${reminder.courseCode})\n` +
                   `📅 <t:${timestamp}:f> • <t:${timestamp}:R>\n` +
                   `👥 ${role ? role.name : 'Sin rol específico'}\n` +
                   `🆔 \`${reminder.id}\``;
        }).join('\n\n');

        embed.addFields({
            name: `⏰ Próximos Recordatorios (${filteredReminders.length})`,
            value: remindersList,
            inline: false
        });

        await interaction.reply({ embeds: [embed] });
    },

    /**
     * Delete a reminder
     * @param {ChatInputCommandInteraction} interaction 
     */
    async deleteReminder(interaction) {
        const reminderId = interaction.options.getString('id');

        const config = interaction.client.configManager.getGuildConfig(interaction.guild.id);
        const reminders = config.reminders || {};
        
        // Check if reminder exists
        const reminderData = reminders[reminderId];
        if (!reminderData) {
            return interaction.reply({
                content: embedStrings.messages.errors.reminderNotFound(reminderId),
                ephemeral: true
            });
        }

        // Delete the reminder
        delete reminders[reminderId];
        config.reminders = reminders;
        interaction.client.configManager.setGuildConfig(interaction.guild.id, config);

        // Create success embed
        const reminderDate = new Date(reminderData.datetime);
        const timestamp = Math.floor(reminderDate.getTime() / 1000);
        const courseEmoji = getCourseEmoji(reminderData.courseCode);

        const successEmbed = new EmbedBuilder()
            .setTitle(embedStrings.reminders.reminderDeleted.title)
            .setDescription(embedStrings.reminders.reminderDeleted.description(reminderId))
            .setColor(embedStrings.colors.error)
            .addFields({
                name: embedStrings.reminders.reminderDeleted.fields.deletedReminder.name,
                value: `${courseEmoji} **${reminderData.courseName}** (${reminderData.courseCode})\n` +
                       `📅 <t:${timestamp}:F>\n` +
                       `🕒 <t:${timestamp}:R>`,
                inline: false
            })
            .setFooter({ 
                text: embedStrings.reminders.reminderDeleted.footer,
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed] });

        // Log to moderation channel
        const modChannelId = interaction.client.configManager.getModerationChannelId(interaction.guild.id);
        if (modChannelId) {
            const modChannel = interaction.guild.channels.cache.get(modChannelId);
            if (modChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('🗑️ Recordatorio Eliminado')
                    .setColor(embedStrings.colors.error)
                    .addFields(
                        { name: 'Recordatorio ID', value: reminderId, inline: true },
                        { name: 'Curso', value: `${reminderData.courseName} (${reminderData.courseCode})`, inline: true },
                        { name: 'Fecha original', value: `<t:${timestamp}:F>`, inline: true },
                        { name: 'Eliminado por', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true }
                    )
                    .setTimestamp();

                await modChannel.send({ embeds: [logEmbed] });
            }
        }

        console.log(`🗑️ Recordatorio ${reminderId} eliminado por ${interaction.user.tag} en ${interaction.guild.name}`);
    }
};

/**
 * Parse datetime string in format YYYY-MM-DD HH:MM
 * @param {string} dateTimeString 
 * @returns {Date|null}
 */
function parseDateTime(dateTimeString) {
    const regex = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/;
    const match = dateTimeString.match(regex);
    
    if (!match) return null;
    
    const [, year, month, day, hour, minute] = match;
    const date = new Date(year, month - 1, day, hour, minute);
    
    // Validate the date is valid
    if (isNaN(date.getTime())) return null;
    
    return date;
}

/**
 * Generate unique reminder ID
 * @returns {string}
 */
function generateReminderId() {
    return `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get emoji for course code
 * @param {string} courseCode 
 * @returns {string}
 */
function getCourseEmoji(courseCode) {
    const emojis = {
        'MB': '📄', 'MI': '📑', 'TW': '💨', 'JS': '⚡', 'PY': '🐍',
        'PH': '🎨', 'IL': '🖌️', 'AN': '🎬', 'AF': '🎞️', 'PR': '🎥'
    };
    return emojis[courseCode] || '📚';
} 
