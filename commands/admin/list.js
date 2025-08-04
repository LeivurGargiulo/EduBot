/**
 * List Command - Admin Category
 * Unified listing command for courses and commissions
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listar')
        .setDescription('Lista cursos y comisiones del sistema')
        .addSubcommand(subcommand =>
            subcommand
                .setName('comisiones')
                .setDescription('Muestra todas las comisiones existentes')
                .addStringOption(option =>
                    option.setName('curso')
                        .setDescription('Filtrar por código de curso (opcional)')
                        .setRequired(false)
                        .setMaxLength(2)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('cursos')
                .setDescription('Muestra todos los cursos registrados')),
    
    cooldown: 5,

    /**
     * Execute the list command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'comisiones':
                    await handleListCommissions(interaction);
                    break;
                case 'cursos':
                    await handleListCourses(interaction);
                    break;
            }
        } catch (error) {
            console.error('❌ Error listar:', error);
            await interaction.reply({
                content: embedStrings.messages.errors.configurationError,
                ephemeral: true
            });
        }
    }
};

/**
 * Handle listing commissions
 */
async function handleListCommissions(interaction) {
    const courseFilter = interaction.options.getString('curso')?.toUpperCase();

    const config = interaction.client.configManager.getGuildConfig(interaction.guild.id);
    const commissions = config.commissions || {};
    const courses = config.courses || {};

    let filteredCommissions = Object.entries(commissions);

    // Apply course filter if provided
    if (courseFilter) {
        filteredCommissions = filteredCommissions.filter(([code, data]) => 
            data.courseCode === courseFilter
        );
    }

    if (filteredCommissions.length === 0) {
        const noCommissionsEmbed = new EmbedBuilder()
            .setTitle(embedStrings.commission.list.noCommissions.title)
            .setDescription(courseFilter ? 
                embedStrings.commission.list.noCommissions.descriptionFiltered(courseFilter) :
                embedStrings.commission.list.noCommissions.description
            )
            .setColor(embedStrings.colors.warning)
            .addFields({
                name: embedStrings.commission.list.noCommissions.fields.howToCreate.name,
                value: embedStrings.commission.list.noCommissions.fields.howToCreate.value,
                inline: false
            })
            .setFooter({ text: embedStrings.commission.list.noCommissions.footer });

        return interaction.reply({ embeds: [noCommissionsEmbed] });
    }

    // Group commissions by course
    const commissionsByCourse = {};
    filteredCommissions.forEach(([code, data]) => {
        if (!commissionsByCourse[data.courseCode]) {
            commissionsByCourse[data.courseCode] = [];
        }
        commissionsByCourse[data.courseCode].push({ code, ...data });
    });

    // Create main embed
    const listEmbed = new EmbedBuilder()
        .setTitle(courseFilter ? 
            embedStrings.commission.list.titleFiltered(courseFilter) :
            embedStrings.commission.list.title
        )
        .setDescription(embedStrings.commission.list.description(filteredCommissions.length))
        .setColor(embedStrings.colors.info)
        .setTimestamp()
        .setFooter({ 
            text: embedStrings.commission.list.footer,
            iconURL: interaction.client.user.displayAvatarURL()
        });

    // Add fields for each course
    Object.entries(commissionsByCourse).forEach(([courseCode, courseCommissions]) => {
        const courseName = courses[courseCode]?.name || `Curso ${courseCode}`;
        
        const commissionList = courseCommissions
            .sort((a, b) => a.code.localeCompare(b.code))
            .map(commission => {
                const role = interaction.guild.roles.cache.get(commission.roleId);
                const textChannel = interaction.guild.channels.cache.get(commission.textChannelId);
                const memberCount = role ? role.members.size : 0;
                
                return `**${commission.code}** - ${getShiftName(commission.shift)} (${memberCount} miembros)\n` +
                       `${textChannel ? `📝 ${textChannel}` : '❌ Canal no encontrado'}`;
            })
            .join('\n\n');

        listEmbed.addFields({
            name: `📚 ${courseName} (${courseCommissions.length} comisiones)`,
            value: commissionList || 'Sin comisiones',
            inline: false
        });
    });

    // Add summary field
    const totalMembers = filteredCommissions.reduce((total, [code, data]) => {
        const role = interaction.guild.roles.cache.get(data.roleId);
        return total + (role ? role.members.size : 0);
    }, 0);

    listEmbed.addFields({
        name: embedStrings.commission.list.fields.summary.name,
        value: embedStrings.commission.list.fields.summary.value(
            filteredCommissions.length,
            Object.keys(commissionsByCourse).length,
            totalMembers
        ),
        inline: false
    });

    await interaction.reply({ embeds: [listEmbed] });
}

/**
 * Handle listing courses
 */
async function handleListCourses(interaction) {
    const config = interaction.client.configManager.getGuildConfig(interaction.guild.id);
    const courses = config.courses || {};
    const commissions = config.commissions || {};

    if (Object.keys(courses).length === 0) {
        const noCoursesEmbed = new EmbedBuilder()
            .setTitle(embedStrings.course.list.noCourses.title)
            .setDescription(embedStrings.course.list.noCourses.description)
            .setColor(embedStrings.colors.warning)
            .addFields({
                name: embedStrings.course.list.noCourses.fields.howToAdd.name,
                value: embedStrings.course.list.noCourses.fields.howToAdd.value,
                inline: false
            })
            .setFooter({ text: embedStrings.course.list.noCourses.footer });

        return interaction.reply({ embeds: [noCoursesEmbed] });
    }

    // Count commissions per course
    const commissionCounts = {};
    Object.values(commissions).forEach(commission => {
        commissionCounts[commission.courseCode] = (commissionCounts[commission.courseCode] || 0) + 1;
    });

    // Create course list
    const courseList = Object.entries(courses)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([code, data]) => {
            const commissionCount = commissionCounts[code] || 0;
            const createdBy = interaction.guild.members.cache.get(data.createdBy);
            const createdDate = new Date(data.createdAt).toLocaleDateString('es-ES');
            
            return `**${code}** - ${data.name}\n` +
                   `📊 ${commissionCount} comisión${commissionCount !== 1 ? 'es' : ''}\n` +
                   `👤 Creado por: ${createdBy ? createdBy.displayName : 'Usuario desconocido'}\n` +
                   `📅 Fecha: ${createdDate}`;
        })
        .join('\n\n');

    const listEmbed = new EmbedBuilder()
        .setTitle(embedStrings.course.list.title)
        .setDescription(embedStrings.course.list.description(Object.keys(courses).length))
        .setColor(embedStrings.colors.info)
        .addFields({
            name: embedStrings.course.list.fields.courses.name,
            value: courseList,
            inline: false
        })
        .setTimestamp()
        .setFooter({ 
            text: embedStrings.course.list.footer,
            iconURL: interaction.client.user.displayAvatarURL()
        });

    // Add summary
    const totalCommissions = Object.values(commissionCounts).reduce((sum, count) => sum + count, 0);
    listEmbed.addFields({
        name: embedStrings.course.list.fields.summary.name,
        value: embedStrings.course.list.fields.summary.value(
            Object.keys(courses).length,
            totalCommissions
        ),
        inline: false
    });

    await interaction.reply({ embeds: [listEmbed] });
}

/**
 * Get shift name in Spanish
 * @param {string} shift 
 * @returns {string}
 */
function getShiftName(shift) {
    const shifts = {
        'M': 'Mañana',
        'T': 'Tarde', 
        'N': 'Noche'
    };
    return shifts[shift] || shift;
} 
