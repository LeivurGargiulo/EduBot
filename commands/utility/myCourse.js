/**
 * My Course Command - Utility Category
 * Shows user's enrolled courses based on their roles
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mi curso')
        .setDescription('Ve tus cursos inscritos y tu progreso'),
    
    cooldown: 5,

    /**
     * Execute the my course command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const member = interaction.member;
        
        // Define course role mappings
        const courseRoles = {
            'Maquetado Web Nivel I': {
                name: 'Maquetado Web Nivel I',
                emoji: '📄',
                color: 0xE44D26,
                description: 'Aprendiendo los fundamentos de HTML y CSS para construir tus primeras páginas web.',
                resources: [
                    'Estructura de HTML',
                    'Selectores de CSS',
                    'Modelo de Caja (Box Model)',
                    'Flexbox',
                    'Responsive Design Básico'
                ]
            },
            'Maquetado Web Nivel II': {
                name: 'Maquetado Web Nivel II',
                emoji: '📑',
                color: 0x1572B6,
                description: 'Avanzando en tus habilidades de maquetado con técnicas modernas y complejas.',
                resources: [
                    'CSS Grid',
                    'Animaciones y Transiciones',
                    'SASS/SCSS',
                    'Metodologías (BEM)',
                    'Optimización de Rendimiento'
                ]
            },
            'Tailwind CSS': {
                name: 'Tailwind CSS',
                emoji: '💨',
                color: 0x38B2AC,
                description: 'Dominando el framework CSS utility-first para un desarrollo rápido y responsivo.',
                resources: [
                    'Configuración de Tailwind',
                    'Clases de Utilidad (Utility Classes)',
                    'Diseño Responsivo',
                    'Personalización de Tema',
                    'Componentes con @apply'
                ]
            }
        };

        // Find user's course roles
        const userCourseRoles = member.roles.cache.filter(role => 
            courseRoles.hasOwnProperty(role.name)
        );

        // Create base embed
        const embed = new EmbedBuilder()
            .setTitle(embedStrings.userCourses.title(member.displayName))
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: embedStrings.userCourses.footer, iconURL: interaction.client.user.displayAvatarURL() });

        if (userCourseRoles.size === 0) {
            embed.setDescription(embedStrings.userCourses.noCourses.description)
                .setColor(embedStrings.colors.red)
                .addFields({
                    name: embedStrings.userCourses.noCourses.fields.getStarted.name,
                    value: embedStrings.userCourses.noCourses.fields.getStarted.value,
                    inline: false
                });
        } else {
            embed.setDescription(embedStrings.userCourses.withCourses.description(userCourseRoles.size))
                .setColor(embedStrings.colors.success);

            // Add each course as a field
            userCourseRoles.forEach(role => {
                const courseInfo = courseRoles[role.name];
                embed.addFields({
                    name: `${courseInfo.emoji} ${courseInfo.name}`,
                    value: `${courseInfo.description}\n\n**Temas Cubiertos:**\n• ${courseInfo.resources.join('\n• ')}`,
                    inline: false
                });
            });

            // Add additional info fields
            embed.addFields(
                {
                    name: embedStrings.userCourses.withCourses.fields.quickAccess.name,
                    value: embedStrings.userCourses.withCourses.fields.quickAccess.value,
                    inline: true
                },
                {
                    name: embedStrings.userCourses.withCourses.fields.community.name,
                    value: embedStrings.userCourses.withCourses.fields.community.value,
                    inline: true
                },
                {
                    name: embedStrings.userCourses.withCourses.fields.progress.name,
                    value: embedStrings.userCourses.withCourses.fields.progress.value,
                    inline: true
                }
            );
        }

        // Add other relevant roles
        const otherRoles = member.roles.cache.filter(role => 
            role.name !== '@everyone' && 
            !courseRoles.hasOwnProperty(role.name) &&
            !role.managed // Exclude bot roles
        );

        if (otherRoles.size > 0) {
            const roleList = otherRoles.map(role => role.name).slice(0, 8).join(', ');
            embed.addFields({
                name: embedStrings.userCourses.otherRoles.name,
                value: roleList,
                inline: false
            });
        }

        // Add member stats
        const joinedAt = member.joinedAt ? 
            `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : 
            'Desconocido';

        embed.addFields({
            name: embedStrings.userCourses.memberStats.name,
            value: embedStrings.userCourses.memberStats.value(joinedAt, member.roles.cache.size - 1), // -1 to exclude @everyone
            inline: false
        });

        await interaction.reply({ embeds: [embed] });
    }
};
