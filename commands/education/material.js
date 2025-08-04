/**
 * Material Command - Education Category
 * Returns course material links in an embed format
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const courseMaterials = require('../../data/courseMaterials'); // Import the centralized data
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('material')
        .setDescription('Obtén enlaces a los materiales del curso')
        .addStringOption(option =>
            option.setName('curso')
                .setDescription('Selecciona el curso')
                .setRequired(true)
                .addChoices(
                    { name: 'Maquetado Web Nivel I', value: 'maquetado1' },
                    { name: 'Maquetado Web Nivel II', value: 'maquetado2' },
                    { name: 'Tailwind CSS', value: 'tailwind' }
                )),
    
    cooldown: 5,

    /**
     * Execute the material command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const curso = interaction.options.getString('curso');

        const courseData = courseMaterials[curso];
        if (!courseData) {
            return interaction.reply({
                content: embedStrings.messages.errors.courseNotFound,
                ephemeral: true
            });
        }

        // Create embed
        const embed = new EmbedBuilder()
            .setTitle(`📚 ${courseData.name} - Materiales`)
            .setDescription(courseData.description)
            .setColor(courseData.color)
            .setTimestamp()
            .setFooter({ text: 'Bot Educativo', iconURL: interaction.client.user.displayAvatarURL() });

        // Show general materials
        embed.addFields({
            name: '📋 Materiales Generales',
            value: courseData.materials.general.map(material => 
                `**[${material.name}](${material.url})**\n${material.description}`
            ).join('\n\n'),
            inline: false
        });

        // Show available class topics
        const classTopics = Object.entries(courseData.materials.classes)
            .map(([classNum, materials]) => `**Clase ${classNum}:** ${materials.map(m => m.name).join(' / ')}`)
            .join('\n');

        if (classTopics) {
            embed.addFields({
                name: '📖 Temario del Curso',
                value: classTopics,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    }
};