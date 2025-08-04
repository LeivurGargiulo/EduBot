/**
 * Enroll Command - Education Category
 * Allows users to join their assigned commission using a code
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anotarse')
        .setDescription('Únete a tu comisión usando el código asignado')
        .addStringOption(option =>
            option.setName('codigo')
                .setDescription('Código de tu comisión (ej: MBTG01)')
                .setRequired(true)
                .setMaxLength(5)
                .setMinLength(5)),
    
    cooldown: 30,

    /**
     * Execute the enroll command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const commissionCode = interaction.options.getString('codigo').toUpperCase();
        const member = interaction.member;

        // Validate commission code format
        const codeValidation = validateCommissionCode(commissionCode);
        if (!codeValidation.valid) {
            return interaction.reply({
                content: `❌ ${codeValidation.error}`,
                ephemeral: true
            });
        }

        try {
            // Check if commission exists in database/config
            const commission = getCommissionData(interaction.client, interaction.guild.id, commissionCode);
            if (!commission) {
                return interaction.reply({
                    content: embedStrings.messages.errors.commissionNotFound(commissionCode),
                    ephemeral: true
                });
            }

            // Find the commission role
            const commissionRole = interaction.guild.roles.cache.find(role => 
                role.name.toUpperCase() === commissionCode
            );

            if (!commissionRole) {
                return interaction.reply({
                    content: embedStrings.messages.errors.commissionRoleNotFound(commissionCode),
                    ephemeral: true
                });
            }

            // Check if user already has this role
            if (member.roles.cache.has(commissionRole.id)) {
                return interaction.reply({
                    content: embedStrings.messages.errors.alreadyInCommission(commissionCode),
                    ephemeral: true
                });
            }


            // Assign the commission role
            await member.roles.add(commissionRole);

            // Create success embed
            const successEmbed = new EmbedBuilder()
                .setTitle(embedStrings.commission.joined.title)
                .setDescription(embedStrings.commission.joined.description(commissionCode, commission.courseName))
                .setColor(embedStrings.colors.success)
                .addFields(
                    {
                        name: embedStrings.commission.joined.fields.details.name,
                        value: embedStrings.commission.joined.fields.details.value(
                            commission.courseName,
                            getShiftName(commission.shift),
                            commission.number
                        ),
                        inline: false
                    },
                    {
                        name: embedStrings.commission.joined.fields.access.name,
                        value: embedStrings.commission.joined.fields.access.value(commissionCode.toLowerCase()),
                        inline: false
                    }
                )
                .setFooter({ 
                    text: embedStrings.commission.joined.footer,
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });

            // Send DM confirmation
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle(embedStrings.commission.dmConfirmation.title)
                    .setDescription(embedStrings.commission.dmConfirmation.description(commissionCode, interaction.guild.name))
                    .setColor(embedStrings.colors.success)
                    .addFields({
                        name: embedStrings.commission.dmConfirmation.fields.nextSteps.name,
                        value: embedStrings.commission.dmConfirmation.fields.nextSteps.value,
                        inline: false
                    })
                    .setFooter({ text: embedStrings.commission.dmConfirmation.footer });

                await member.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(`⚠️ No se pudo enviar DM a ${member.user.tag}`);
            }

            // Log to moderation channel
            const modChannelId = interaction.client.configManager.getModerationChannelId(interaction.guild.id);
            if (modChannelId) {
                const modChannel = interaction.guild.channels.cache.get(modChannelId);
                if (modChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('📚 Usuario se Unió a Comisión')
                        .setColor(embedStrings.colors.info)
                        .addFields(
                            { name: 'Usuario', value: `${member.user.tag} (${member.user.id})`, inline: true },
                            { name: 'Comisión', value: commissionCode, inline: true },
                            { name: 'Curso', value: commission.courseName, inline: true },
                            { name: 'Fecha', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                        )
                        .setThumbnail(member.user.displayAvatarURL())
                        .setTimestamp();

                    await modChannel.send({ embeds: [logEmbed] });
                }
            }

            console.log(`📚 ${member.user.tag} se unió a la comisión ${commissionCode} en ${interaction.guild.name}`);

        } catch (error) {
            console.error('❌ Error unirse a la comisión:', error);
            await interaction.reply({
                content: embedStrings.messages.errors.commissionJoinError,
                ephemeral: true
            });
        }
    }
};

/**
 * Validate commission code format
 * @param {string} code 
 * @returns {Object} Validation result
 */
function validateCommissionCode(code) {
    if (code.length !== 5) {
        return { valid: false, error: 'El código debe tener exactamente 5 caracteres.' };
    }

    const courseCode = code.substring(0, 2);
    const shift = code.substring(2, 3);
    const number = code.substring(3, 5);

    // Validate course code
    const validCourses = ['MB', 'MI', 'TW', 'JS', 'PY', 'PH', 'IL', 'AN', 'AF', 'PR'];
    if (!validCourses.includes(courseCode)) {
        return { valid: false, error: `Código de curso inválido: ${courseCode}` };
    }

    // Validate shift
    const validShifts = ['M', 'T', 'N'];
    if (!validShifts.includes(shift)) {
        return { valid: false, error: `Turno inválido: ${shift}` };
    }


    // Validate number
    if (!/^\d{2}$/.test(number)) {
        return { valid: false, error: `Número de comisión inválido: ${number}` };
    }

    return { valid: true };
}

/**
 * Get commission data from storage
 * @param {Client} client 
 * @param {string} guildId 
 * @param {string} code 
 * @returns {Object|null}
 */
function getCommissionData(client, guildId, code) {
    const config = client.configManager.getGuildConfig(guildId);
    const commissions = config.commissions || {};
    return commissions[code] || null;
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

