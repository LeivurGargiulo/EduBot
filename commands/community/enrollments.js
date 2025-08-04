/**
 * Enrollments Command - Community Category
 * Provides instructions on how to sign up for courses.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inscripciones')
        .setDescription('Muestra las instrucciones para inscribirse a los cursos.'),
    
    cooldown: 5,

    /**
     * Execute the enrollments command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle(embedStrings.registration.title)
            .setDescription(embedStrings.registration.description)
            .setColor(embedStrings.colors.green)
            .addFields(
                {
                    name: embedStrings.registration.fields.steps.name,
                    value: embedStrings.registration.fields.steps.value
                },
                {
                    name: embedStrings.registration.fields.afterRegistration.name,
                    value: embedStrings.registration.fields.afterRegistration.value
                }
            )
            .setFooter({
                text: embedStrings.registration.footer
            });

        await interaction.reply({ embeds: [embed] });
    }
};
