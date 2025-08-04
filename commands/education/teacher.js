/**
 * Teacher Command - Education Category
 * Shows information about a teacher with an embed
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embedStrings = require('../../data/embedStrings');
const teachersData = require('../../data/teachersData');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profesor')
        .setDescription('Muestra información sobre un profesor')
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Nombre del profesor')
                .setRequired(true)
                .setAutocomplete(true)),
    
    cooldown: 5,

    /**
     * Execute the teacher command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const teacherName = interaction.options.getString('nombre').toLowerCase();
        const teacher = teachersData[teacherName];

        if (!teacher) {
            return interaction.reply({
                content: embedStrings.messages.errors.teacherNotFound,
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`👨‍🏫 ${teacher.name}`)
            .setDescription(teacher.description)
            .setColor(teacher.color || embedStrings.colors.primary)
            .setThumbnail(teacher.avatar || null)
            .addFields(
                {
                    name: embedStrings.teacher.fields.specialties.name,
                    value: teacher.specialties.join('\n• '),
                    inline: true
                },
                {
                    name: embedStrings.teacher.fields.experience.name,
                    value: teacher.experience,
                    inline: true
                },
                {
                    name: embedStrings.teacher.fields.courses.name,
                    value: teacher.courses.join('\n• '),
                    inline: false
                }
            )
            .setTimestamp()
            .setFooter({ 
                text: embedStrings.teacher.footer, 
                iconURL: interaction.client.user.displayAvatarURL() 
            });

        // Add contact info if available
        if (teacher.contact && teacher.contact.length > 0) {
            embed.addFields({
                name: embedStrings.teacher.fields.contact.name,
                value: teacher.contact.join('\n'),
                inline: false
            });
        }

        // Add fun fact if available
        if (teacher.funFact) {
            embed.addFields({
                name: embedStrings.teacher.fields.funFact.name,
                value: teacher.funFact,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    /**
     * Handle autocomplete for teacher names
     * @param {AutocompleteInteraction} interaction 
     */
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const teachers = Object.keys(teachersData);
        
        const filtered = teachers.filter(teacher => 
            teachersData[teacher].name.toLowerCase().includes(focusedValue)
        ).slice(0, 25);

        await interaction.respond(
            filtered.map(teacher => ({
                name: teachersData[teacher].name,
                value: teacher
            }))
        );
    }
};
