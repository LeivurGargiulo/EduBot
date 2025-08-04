/**
 * Add Course Command - Admin Category
 * Adds a new course to the database with its code and name
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('agregar-curso')
        .setDescription('Agrega un nuevo curso a la base de datos (Solo para administradores)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('codigo')
                .setDescription('Código del curso (ej: UX)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Nombre completo del curso')
                .setRequired(true)),
    
    cooldown: 5,

    /**
     * Execute the add course command
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

        const courseCode = interaction.options.getString('codigo').toUpperCase();
        const courseName = interaction.options.getString('nombre');

        // Validate course code format (letters only)
        if (!/^[A-Z]+$/.test(courseCode)) {
            return interaction.reply({
                content: embedStrings.messages.errors.invalidCourseCode,
                ephemeral: true
            });
        }

        try {
            // Check if course already exists
            const existingCourse = getCourseData(interaction.client, interaction.guild.id, courseCode);
            if (existingCourse) {
                return interaction.reply({
                    content: embedStrings.messages.errors.courseAlreadyExists(courseCode, existingCourse.name),
                    ephemeral: true
                });
            }

            // Save course to database/config
            saveCourseData(interaction.client, interaction.guild.id, courseCode, {
                name: courseName,
                code: courseCode,
                createdAt: new Date().toISOString(),
                createdBy: interaction.user.id
            });

            // Create success embed
            const successEmbed = new EmbedBuilder()
                .setTitle(embedStrings.course.added.title)
                .setDescription(embedStrings.course.added.description(courseCode, courseName))
                .setColor(embedStrings.colors.success)
                .addFields(
                    {
                        name: embedStrings.course.added.fields.details.name,
                        value: embedStrings.course.added.fields.details.value(courseCode, courseName),
                        inline: false
                    },
                    {
                        name: embedStrings.course.added.fields.usage.name,
                        value: embedStrings.course.added.fields.usage.value(courseCode),
                        inline: false
                    }
                )
                .setFooter({ 
                    text: embedStrings.course.added.footer,
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
                        .setTitle('📚 Nuevo Curso Agregado')
                        .setColor(embedStrings.colors.info)
                        .addFields(
                            { name: 'Código', value: courseCode, inline: true },
                            { name: 'Nombre', value: courseName, inline: true },
                            { name: 'Agregado por', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                            { name: 'Fecha', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                        )
                        .setTimestamp();

                    await modChannel.send({ embeds: [logEmbed] });
                }
            }

            console.log(`📚 Curso ${courseCode} (${courseName}) agregado por ${interaction.user.tag} en ${interaction.guild.name}`);

        } catch (error) {
            console.error('❌ Error al agregar el curso:', error);
            await interaction.reply({
                content: embedStrings.messages.errors.courseAddError,
                ephemeral: true
            });
        }
    }
};

/**
 * Get course data from storage
 * @param {Client} client 
 * @param {string} guildId 
 * @param {string} courseCode 
 * @returns {Object|null}
 */
function getCourseData(client, guildId, courseCode) {
    const config = client.configManager.getGuildConfig(guildId);
    const courses = config.courses || {};
    return courses[courseCode] || null;
}

/**
 * Save course data to storage
 * @param {Client} client 
 * @param {string} guildId 
 * @param {string} courseCode 
 * @param {Object} data 
 */
function saveCourseData(client, guildId, courseCode, data) {
    const config = client.configManager.getGuildConfig(guildId);
    if (!config.courses) {
        config.courses = {};
    }
    config.courses[courseCode] = data;
    client.configManager.setGuildConfig(guildId, config);
} 