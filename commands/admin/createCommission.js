/**
 * Create Commission Command - Admin Category
 * Creates a new commission with role, channels, and database entry
 */

const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crear-comision')
        .setDescription('Crea una nueva comisión con canales y rol (Solo para administradores)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('codigo')
                .setDescription('Código de la comisión (formato: CURSO-NUMERO, ej: PH-01)')
                .setRequired(true)),
    
    cooldown: 10,

    /**
     * Execute the create commission command
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

        const commissionCode = interaction.options.getString('codigo').toUpperCase();

        // Validate commission code format
        const codeValidation = validateCommissionCode(commissionCode);
        if (!codeValidation.valid) {
            return interaction.reply({
                content: `❌ ${codeValidation.error}`,
                ephemeral: true
            });
        }

        const parsedCode = parseCommissionCode(commissionCode);

        try {
            // Check if commission already exists
            const existingCommission = getCommissionData(interaction.client, interaction.guild.id, commissionCode);
            if (existingCommission) {
                return interaction.reply({
                    content: embedStrings.messages.errors.commissionAlreadyExists(commissionCode),
                    ephemeral: true
                });
            }

            // Check if course exists in database
            const courseData = getCourseData(interaction.client, interaction.guild.id, parsedCode.courseCode);
            // If course doesn't exist, we'll use the commission code as the course name
            const courseName = courseData ? courseData.name : `Curso ${parsedCode.courseCode}`;

            await interaction.deferReply();

            // Find or create "📚 Comisiones" category
            let category = interaction.guild.channels.cache.find(
                channel => channel.type === ChannelType.GuildCategory && 
                          channel.name === '📚 Comisiones'
            );

            if (!category) {
                category = await interaction.guild.channels.create({
                    name: '📚 Comisiones',
                    type: ChannelType.GuildCategory,
                    reason: 'Categoría para comisiones creada automáticamente'
                });
            }

            // Create commission role
            const commissionRole = await interaction.guild.roles.create({
                name: commissionCode,
                color: getCommissionColor(parsedCode.courseCode),
                reason: `Rol para comisión ${commissionCode}`,
                mentionable: true
            });

            // Create main text channel (for general questions and conversation)
            const textChannel = await interaction.guild.channels.create({
                name: `${commissionCode.toLowerCase()}-general`,
                type: ChannelType.GuildText,
                parent: category.id,
                topic: `Canal principal de la comisión ${commissionCode} - ${courseName} - Para dudas generales y conversación`,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: commissionRole.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.UseExternalEmojis,
                            PermissionFlagsBits.AddReactions
                        ]
                    }
                ],
                reason: `Canal principal de texto para comisión ${commissionCode}`
            });

            // Create notifications channel (announcements only, read-only for students)
            const notificationsChannel = await interaction.guild.channels.create({
                name: `${commissionCode.toLowerCase()}-anuncios`,
                type: ChannelType.GuildText,
                parent: category.id,
                topic: `Canal de anuncios de la comisión ${commissionCode} - ${courseName} - Solo para anuncios del staff`,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: commissionRole.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.ReadMessageHistory
                        ],
                        deny: [
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.AddReactions
                        ]
                    },
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions]
                    }
                ],
                reason: `Canal de anuncios para comisión ${commissionCode}`
            });

            // Create chat channel (for socializing and off-topic)
            const chatChannel = await interaction.guild.channels.create({
                name: `${commissionCode.toLowerCase()}-charla`,
                type: ChannelType.GuildText,
                parent: category.id,
                topic: `Canal de charla libre de la comisión ${commissionCode} - ${courseName} - Para socializar y temas off-topic`,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: commissionRole.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.UseExternalEmojis,
                            PermissionFlagsBits.AddReactions
                        ]
                    }
                ],
                reason: `Canal de charla libre para comisión ${commissionCode}`
            });

            // Create voice channel (for classes or oral discussions)
            const voiceChannel = await interaction.guild.channels.create({
                name: `🔊 ${commissionCode.toLowerCase()}`,
                type: ChannelType.GuildVoice,
                parent: category.id,
                topic: `Canal de voz para clases y charlas orales de la comisión ${commissionCode} - ${courseName}`,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: commissionRole.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.Connect,
                            PermissionFlagsBits.Speak,
                            PermissionFlagsBits.UseVAD
                        ]
                    }
                ],
                reason: `Canal de voz para comisión ${commissionCode}`
            });

            // Save commission to database/config
            saveCommissionData(interaction.client, interaction.guild.id, commissionCode, {
                courseCode: parsedCode.courseCode,
                courseName: courseName,
                shift: parsedCode.shift,
                number: parsedCode.number,
                roleId: commissionRole.id,
                textChannelId: textChannel.id,
                notificationsChannelId: notificationsChannel.id,
                chatChannelId: chatChannel.id,
                voiceChannelId: voiceChannel.id,
                createdAt: new Date().toISOString(),
                createdBy: interaction.user.id
            });

            // Send welcome message to the main text channel
            const welcomeEmbed = new EmbedBuilder()
                .setTitle(embedStrings.commission.welcome.title(commissionCode))
                .setDescription(embedStrings.commission.welcome.description(courseName))
                .setColor(getCommissionColor(parsedCode.courseCode))
                .addFields(
                    {
                        name: embedStrings.commission.welcome.fields.details.name,
                        value: embedStrings.commission.welcome.fields.details.value(
                            courseName,
                            getShiftName(parsedCode.shift),
                            parsedCode.number
                        ),
                        inline: false
                    },
                    {
                        name: '📋 Canales de la Comisión',
                        value: `• **${textChannel}** - Dudas generales y conversación\n• **${notificationsChannel}** - Anuncios del staff (solo lectura)\n• **${chatChannel}** - Charla libre y off-topic\n• **${voiceChannel}** - Clases y charlas orales`,
                        inline: false
                    },
                    {
                        name: embedStrings.commission.welcome.fields.instructions.name,
                        value: embedStrings.commission.welcome.fields.instructions.value,
                        inline: false
                    }
                )
                .setFooter({ 
                    text: embedStrings.commission.welcome.footer,
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            await textChannel.send({ embeds: [welcomeEmbed] });

            // Create success response
            const successEmbed = new EmbedBuilder()
                .setTitle(embedStrings.commission.created.title)
                .setDescription(embedStrings.commission.created.description(commissionCode))
                .setColor(embedStrings.colors.success)
                .addFields(
                    {
                        name: embedStrings.commission.created.fields.details.name,
                        value: embedStrings.commission.created.fields.details.value(
                            courseName,
                            getShiftName(parsedCode.shift),
                            parsedCode.number
                        ),
                        inline: false
                    },
                    {
                        name: embedStrings.commission.created.fields.resources.name,
                        value: embedStrings.commission.created.fields.resources.value(
                            commissionRole,
                            textChannel,
                            voiceChannel
                        ),
                        inline: false
                    },
                    {
                        name: '📋 Canales Creados',
                        value: `• **${textChannel}** - Canal principal\n• **${notificationsChannel}** - Anuncios\n• **${chatChannel}** - Charla libre\n• **${voiceChannel}** - Voz`,
                        inline: false
                    }
                )
                .setFooter({ text: embedStrings.commission.created.footer })
                .setTimestamp();

            await interaction.editReply({ embeds: [successEmbed] });

            // Log to moderation channel
            const modChannelId = interaction.client.configManager.getModerationChannelId(interaction.guild.id);
            if (modChannelId) {
                const modChannel = interaction.guild.channels.cache.get(modChannelId);
                if (modChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('📚 Nueva Comisión Creada')
                        .setColor(embedStrings.colors.info)
                        .addFields(
                            { name: 'Comisión', value: commissionCode, inline: true },
                            { name: 'Curso', value: courseName, inline: true },
                            { name: 'Creado por', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                            { name: 'Rol', value: commissionRole.toString(), inline: true },
                            { name: 'Canal Principal', value: textChannel.toString(), inline: true },
                            { name: 'Canal Anuncios', value: notificationsChannel.toString(), inline: true },
                            { name: 'Canal Charla', value: chatChannel.toString(), inline: true },
                            { name: 'Canal Voz', value: voiceChannel.toString(), inline: true }
                        )
                        .setTimestamp();

                    await modChannel.send({ embeds: [logEmbed] });
                }
            }

            console.log(`📚 Comisión ${commissionCode} creada por ${interaction.user.tag} en ${interaction.guild.name} con 4 canales: ${textChannel.name}, ${notificationsChannel.name}, ${chatChannel.name}, ${voiceChannel.name}`);

        } catch (error) {
            console.error('❌ Error crear la comisión:', error);
            
            let errorMessage = '❌ Error al crear la comisión. ';
            
            // Provide more specific error messages
            if (error.code === 50013) {
                errorMessage += 'El bot no tiene permisos suficientes. Verifica que tenga permisos de "Gestionar Canales", "Gestionar Roles" y "Ver Canales".';
            } else if (error.code === 50001) {
                errorMessage += 'No se puede acceder al canal. Verifica que el bot tenga permisos para ver y gestionar canales.';
            } else if (error.code === 10013) {
                errorMessage += 'El canal especificado no existe.';
            } else if (error.message.includes('Missing Permissions')) {
                errorMessage += 'Faltan permisos necesarios. Verifica que el bot tenga todos los permisos requeridos.';
            } else {
                errorMessage += 'Inténtalo de nuevo más tarde. Si el problema persiste, contacta a un administrador.';
            }
            
            if (interaction.deferred) {
                await interaction.editReply({
                    content: errorMessage
                });
            } else {
                await interaction.reply({
                    content: errorMessage,
                    ephemeral: true
                });
            }
        }
    }
};

/**
 * Validate commission code format
 * @param {string} code 
 * @returns {Object} Validation result
 */
function validateCommissionCode(code) {
    // Validate format: COURSE-NUMBER (e.g., PH-01, MB-02)
    if (!code || code.length === 0) {
        return { valid: false, error: 'El código no puede estar vacío.' };
    }

    // Check if it follows the format COURSE-NUMBER
    const parts = code.split('-');
    if (parts.length !== 2) {
        return { valid: false, error: 'El código debe seguir el formato: CURSO-NUMERO (ej: PH-01)' };
    }

    const courseCode = parts[0];
    const number = parts[1];

    // Validate course code (letters only)
    if (!/^[A-Z]+$/.test(courseCode)) {
        return { valid: false, error: 'El código del curso debe contener solo letras mayúsculas.' };
    }

    // Validate number (digits only)
    if (!/^\d+$/.test(number)) {
        return { valid: false, error: 'El número debe contener solo dígitos.' };
    }

    return { valid: true };
}

/**
 * Parse commission code into components
 * @param {string} code 
 * @returns {Object}
 */
function parseCommissionCode(code) {
    // Parse format: COURSE-NUMBER (e.g., PH-01)
    const parts = code.split('-');
    const courseCode = parts[0];
    const number = parts[1];
    
    return {
        courseCode: courseCode,
        shift: 'G', // General shift (not used in new format)
        number: number
    };
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
 * Save commission data to storage
 * @param {Client} client 
 * @param {string} guildId 
 * @param {string} code 
 * @param {Object} data 
 */
function saveCommissionData(client, guildId, code, data) {
    const config = client.configManager.getGuildConfig(guildId);
    if (!config.commissions) {
        config.commissions = {};
    }
    config.commissions[code] = data;
    client.configManager.setGuildConfig(guildId, config);
}

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
 * Get commission color based on course
 * @param {string} courseCode 
 * @returns {number}
 */
function getCommissionColor(courseCode) {
    const colors = {
        'MB': 0xE44D26, // Orange (HTML)
        'MI': 0x1572B6, // Blue (CSS)
        'TW': 0x38B2AC, // Teal (Tailwind)
        'JS': 0xF7DF1E, // Yellow (JavaScript)
        'PY': 0x3776AB, // Blue (Python)
        'PH': 0x31A8FF, // Blue (Photoshop)
        'IL': 0xFF9A00, // Orange (Illustrator)
        'AN': 0x9999FF, // Purple (Animation)
        'AF': 0x9999FF, // Purple (After Effects)
        'PR': 0x9999FF  // Purple (Premiere)
    };
    
    // For flexible course codes, use a hash-based color generation
    if (colors[courseCode]) {
        return colors[courseCode];
    }
    
    // Generate a consistent color based on the course code
    let hash = 0;
    for (let i = 0; i < courseCode.length; i++) {
        hash = courseCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash) % 0xFFFFFF;
    return color;
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
        'N': 'Noche',
        'G': 'General'
    };
    return shifts[shift] || shift;
}

