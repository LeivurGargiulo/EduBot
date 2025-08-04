/**
 * Configuración Command - Admin Category
 * Unified configuration command for all bot settings
 */

const { SlashCommandBuilder, EmbedBuilder, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configuracion')
        .setDescription('Configuración unificada del bot (Solo para administradores)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        // Voz subcommand group
        .addSubcommandGroup(subcommandGroup =>
            subcommandGroup
                .setName('voz')
                .setDescription('Configuración de canales de voz dinámicos')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('configurar')
                        .setDescription('Configura el canal de voz para crear canales dinámicos')
                        .addChannelOption(option =>
                            option.setName('canal')
                                .setDescription('Canal de voz que activará la creación de canales dinámicos')
                                .setRequired(true)
                                .addChannelTypes(ChannelType.GuildVoice))
                        .addStringOption(option =>
                            option.setName('nombre-plantilla')
                                .setDescription('Plantilla para el nombre de los canales (usa {usuario} para el nombre del usuario)')
                                .setRequired(false))
                        .addIntegerOption(option =>
                            option.setName('limite-usuarios')
                                .setDescription('Límite de usuarios por canal dinámico (0 = sin límite)')
                                .setRequired(false)
                                .setMinValue(0)
                                .setMaxValue(99))))
        // Roles subcommand group
        .addSubcommandGroup(subcommandGroup =>
            subcommandGroup
                .setName('roles')
                .setDescription('Configuración de roles e identidad')
                
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('staff')
                        .setDescription('Configura los roles de staff')
                        .addRoleOption(option =>
                            option.setName('staff')
                                .setDescription('Rol de staff/administradores')
                                .setRequired(false)))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('verificacion')
                        .setDescription('Configura el sistema de verificación')
                        .addChannelOption(option =>
                            option.setName('canal')
                                .setDescription('Canal donde aparecerá el mensaje de verificación')
                                .addChannelTypes(ChannelType.GuildText)
                                .setRequired(false))
                        .addRoleOption(option =>
                            option.setName('rol-verificado')
                                .setDescription('Rol que se otorga a los usuarios verificados')
                                .setRequired(false))
                        .addStringOption(option =>
                            option.setName('titulo')
                                .setDescription('Título del mensaje de verificación')
                                .setRequired(false))
                        .addStringOption(option =>
                            option.setName('descripcion')
                                .setDescription('Descripción del mensaje de verificación')
                                .setRequired(false))
                        .addBooleanOption(option =>
                            option.setName('activar')
                                .setDescription('Activar o desactivar el sistema de verificación')
                                .setRequired(false))))
        // Bot subcommand group
        .addSubcommandGroup(subcommandGroup =>
            subcommandGroup
                .setName('bot')
                .setDescription('Canales base, enlaces y parámetros generales')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('canales')
                        .setDescription('Configura los canales del bot')
                        .addChannelOption(option =>
                            option.setName('moderacion')
                                .setDescription('Canal para logs de moderación')
                                .addChannelTypes(ChannelType.GuildText)
                                .setRequired(false))
                        .addChannelOption(option =>
                            option.setName('soporte')
                                .setDescription('Canal para tickets de soporte')
                                .addChannelTypes(ChannelType.GuildText)
                                .setRequired(false)))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('enlaces')
                        .setDescription('Configura enlaces externos')
                        .addStringOption(option =>
                            option.setName('feedback')
                                .setDescription('URL del formulario de feedback')
                                .setRequired(false))
                        .addStringOption(option =>
                            option.setName('directrices')
                                .setDescription('URL de las directrices de consentimiento')
                                .setRequired(false))))
        // Textos subcommand group
        .addSubcommandGroup(subcommandGroup =>
            subcommandGroup
                .setName('textos')
                .setDescription('Textos personalizados')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('bienvenida')
                        .setDescription('Personaliza el mensaje de bienvenida'))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('verificacion')
                        .setDescription('Personaliza los textos de verificación'))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('normas')
                        .setDescription('Personaliza el mensaje de normas'))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('ver-actual')
                        .setDescription('Ver la configuración actual de textos'))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('restaurar')
                        .setDescription('Restaurar textos por defecto')
                        .addStringOption(option =>
                            option.setName('seccion')
                                .setDescription('Sección a restaurar')
                                .setRequired(true)
                                .addChoices(
                                    { name: 'Bienvenida', value: 'welcome' },
                                    { name: 'Verificación', value: 'verification' },
                                    { name: 'Normas', value: 'rules' },
                                    { name: 'Todas', value: 'all' }
                                )))),
    
    cooldown: 10,

    /**
     * Execute the configuration command
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

        const subcommandGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommandGroup) {
                case 'voz':
                    await handleVoiceConfig(interaction, subcommand);
                    break;
                case 'roles':
                    await handleRolesConfig(interaction, subcommand);
                    break;
                case 'bot':
                    await handleBotConfig(interaction, subcommand);
                    break;
                case 'textos':
                    await handleTextsConfig(interaction, subcommand);
                    break;
            }
        } catch (error) {
            console.error('❌ Error en configuración:', error);
            await interaction.reply({
                content: embedStrings.messages.errors.configurationError,
                ephemeral: true
            });
        }
    }
};

/**
 * Handle voice configuration
 */
async function handleVoiceConfig(interaction, subcommand) {
    if (subcommand === 'configurar') {
        const triggerChannel = interaction.options.getChannel('canal');
        const nameTemplate = interaction.options.getString('nombre-plantilla') || 'Canal de {usuario}';
        const userLimit = interaction.options.getInteger('limite-usuarios') || 0;

        // Check bot permissions
        const botPermissions = interaction.guild.members.me.permissions;
        if (!botPermissions.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers])) {
            return interaction.reply({
                content: embedStrings.messages.errors.noDynamicVoicePermissions,
                ephemeral: true
            });
        }

        // Check if trigger channel has proper permissions
        const channelPermissions = triggerChannel.permissionsFor(interaction.guild.members.me);
        if (!channelPermissions.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect])) {
            return interaction.reply({
                content: embedStrings.messages.errors.noTriggerChannelPermissions,
                ephemeral: true
            });
        }

        // Store configuration in client memory (in production, use a database)
        if (!interaction.client.dynamicVoiceConfig) {
            interaction.client.dynamicVoiceConfig = new Map();
        }

        interaction.client.dynamicVoiceConfig.set(interaction.guild.id, {
            triggerChannelId: triggerChannel.id,
            nameTemplate: nameTemplate,
            userLimit: userLimit,
            createdChannels: new Set()
        });

        const embed = new EmbedBuilder()
            .setTitle(embedStrings.dynamicVoice.configSuccess.title)
            .setColor(embedStrings.colors.success)
            .addFields(
                { name: embedStrings.dynamicVoice.configSuccess.fields.triggerChannel, value: `<#${triggerChannel.id}>`, inline: true },
                { name: embedStrings.dynamicVoice.configSuccess.fields.nameTemplate, value: nameTemplate, inline: true },
                { name: embedStrings.dynamicVoice.configSuccess.fields.userLimit, value: userLimit === 0 ? 'Sin límite' : userLimit.toString(), inline: true }
            )
            .setFooter({ text: embedStrings.dynamicVoice.configSuccess.footer })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}

/**
 * Handle roles configuration
 */
async function handleRolesConfig(interaction, subcommand) {
    // Initialize bot config if not exists
    if (!interaction.client.botConfig) {
        interaction.client.botConfig = new Map();
    }

    let guildConfig = interaction.client.botConfig.get(interaction.guild.id) || {};

    if (subcommand === 'staff') {
        await handleStaffRoleConfig(interaction, guildConfig);
    } else if (subcommand === 'verificacion') {
        await handleVerificationConfig(interaction, guildConfig);
    }

    // Save updated config
    interaction.client.configManager.setGuildConfig(interaction.guild.id, guildConfig);
}

/**
 * Handle bot configuration
 */
async function handleBotConfig(interaction, subcommand) {
    // Initialize bot config if not exists
    if (!interaction.client.botConfig) {
        interaction.client.botConfig = new Map();
    }

    let guildConfig = interaction.client.botConfig.get(interaction.guild.id) || {};

    if (subcommand === 'canales') {
        await handleChannelConfig(interaction, guildConfig);
    } else if (subcommand === 'enlaces') {
        await handleLinkConfig(interaction, guildConfig);
    }

    // Save updated config
    interaction.client.configManager.setGuildConfig(interaction.guild.id, guildConfig);
}

/**
 * Handle texts configuration
 */
async function handleTextsConfig(interaction, subcommand) {
    switch (subcommand) {
        case 'bienvenida':
            await handleWelcomeTextConfig(interaction);
            break;
        case 'verificacion':
            await handleVerificationTextConfig(interaction);
            break;
        case 'normas':
            await handleRulesTextConfig(interaction);
            break;
        case 'ver-actual':
            await handleViewCurrentConfig(interaction);
            break;
        case 'restaurar':
            await handleRestoreDefaults(interaction);
            break;
    }
}





/**
 * Handle staff role configuration
 */
async function handleStaffRoleConfig(interaction, config) {
    const staffRole = interaction.options.getRole('staff');

    const updates = [];

    if (staffRole) {
        config.staffRoleId = staffRole.id;
        updates.push(`• Rol de staff: ${staffRole}`);
    }

    if (updates.length === 0) {
        return interaction.reply({
            content: '❌ No se especificaron roles para configurar.',
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder()
        .setTitle('✅ Configuración de Roles de Staff Actualizada')
        .setDescription(updates.join('\n'))
        .setColor(embedStrings.colors.success)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

/**
 * Handle verification configuration
 */
async function handleVerificationConfig(interaction, config) {
    const channel = interaction.options.getChannel('canal');
    const verifiedRole = interaction.options.getRole('rol-verificado');
    const title = interaction.options.getString('titulo');
    const description = interaction.options.getString('descripcion');
    const activate = interaction.options.getBoolean('activar');

    if (!config.verification) {
        config.verification = {};
    }

    const updates = [];

    if (channel) {
        config.verification.channelId = channel.id;
        updates.push(`• Canal de verificación: ${channel}`);
    }

    if (verifiedRole) {
        config.verification.roleId = verifiedRole.id;
        updates.push(`• Rol verificado: ${verifiedRole}`);
    }

    if (title) {
        config.verification.title = title;
        updates.push(`• Título personalizado configurado`);
    }

    if (description) {
        config.verification.description = description;
        updates.push(`• Descripción personalizada configurada`);
    }

    if (activate !== null) {
        config.verification.enabled = activate;
        updates.push(`• Sistema ${activate ? 'activado' : 'desactivado'}`);
    }

    if (updates.length === 0) {
        return interaction.reply({
            content: '❌ No se especificaron cambios para la configuración de verificación.',
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder()
        .setTitle('✅ Configuración de Verificación Actualizada')
        .setDescription(updates.join('\n'))
        .setColor(embedStrings.colors.success)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

/**
 * Handle channel configuration
 */
async function handleChannelConfig(interaction, config) {
    const moderationChannel = interaction.options.getChannel('moderacion');
    const supportChannel = interaction.options.getChannel('soporte');

    const updates = [];

    if (moderationChannel) {
        config.moderationChannelId = moderationChannel.id;
        updates.push(`• Canal de moderación: ${moderationChannel}`);
    }

    if (supportChannel) {
        config.supportChannelId = supportChannel.id;
        updates.push(`• Canal de soporte: ${supportChannel}`);
    }

    if (updates.length === 0) {
        return interaction.reply({
            content: '❌ No se especificaron canales para configurar.',
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder()
        .setTitle('✅ Configuración de Canales Actualizada')
        .setDescription(updates.join('\n'))
        .setColor(embedStrings.colors.success)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

/**
 * Handle link configuration
 */
async function handleLinkConfig(interaction, config) {
    const feedbackUrl = interaction.options.getString('feedback');
    const guidelinesUrl = interaction.options.getString('directrices');

    const updates = [];

    if (feedbackUrl) {
        // Basic URL validation
        try {
            new URL(feedbackUrl);
            config.feedbackUrl = feedbackUrl;
            updates.push(`• URL de feedback actualizada`);
        } catch {
            return interaction.reply({
                content: '❌ La URL de feedback no es válida.',
                ephemeral: true
            });
        }
    }

    if (guidelinesUrl) {
        try {
            new URL(guidelinesUrl);
            config.guidelinesUrl = guidelinesUrl;
            updates.push(`• URL de directrices actualizada`);
        } catch {
            return interaction.reply({
                content: '❌ La URL de directrices no es válida.',
                ephemeral: true
            });
        }
    }

    if (updates.length === 0) {
        return interaction.reply({
            content: '❌ No se especificaron enlaces para configurar.',
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder()
        .setTitle('✅ Configuración de Enlaces Actualizada')
        .setDescription(updates.join('\n'))
        .setColor(embedStrings.colors.success)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

/**
 * Handle welcome text configuration
 */
async function handleWelcomeTextConfig(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('welcome_text_modal')
        .setTitle('Configurar Texto de Bienvenida');

    const titleInput = new TextInputBuilder()
        .setCustomId('welcome_title')
        .setLabel('Título del mensaje de bienvenida')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(256)
        .setPlaceholder('Ej: ¡Bienvenido a nuestra comunidad!')
        .setRequired(false);

    const descriptionInput = new TextInputBuilder()
        .setCustomId('welcome_description')
        .setLabel('Descripción del mensaje de bienvenida')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(2000)
        .setPlaceholder('Escribe aquí la descripción completa...')
        .setRequired(false);

    const footerInput = new TextInputBuilder()
        .setCustomId('welcome_footer')
        .setLabel('Pie de página del mensaje')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(256)
        .setPlaceholder('Ej: ¡Gracias por unirte!')
        .setRequired(false);

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
    const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);
    const thirdActionRow = new ActionRowBuilder().addComponents(footerInput);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

    await interaction.showModal(modal);
}

/**
 * Handle verification text configuration
 */
async function handleVerificationTextConfig(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('verification_text_modal')
        .setTitle('Configurar Texto de Verificación');

    const titleInput = new TextInputBuilder()
        .setCustomId('verification_title')
        .setLabel('Título del mensaje de verificación')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(256)
        .setPlaceholder('Ej: Verificación de Miembro')
        .setRequired(false);

    const descriptionInput = new TextInputBuilder()
        .setCustomId('verification_description')
        .setLabel('Descripción del mensaje de verificación')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(2000)
        .setPlaceholder('Escribe las instrucciones de verificación...')
        .setRequired(false);

    const buttonTextInput = new TextInputBuilder()
        .setCustomId('verification_button')
        .setLabel('Texto del botón de verificación')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(80)
        .setPlaceholder('Ej: Verificarme')
        .setRequired(false);

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
    const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);
    const thirdActionRow = new ActionRowBuilder().addComponents(buttonTextInput);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

    await interaction.showModal(modal);
}

/**
 * Handle rules text configuration
 */
async function handleRulesTextConfig(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('rules_text_modal')
        .setTitle('Configurar Texto de Normas');

    const titleInput = new TextInputBuilder()
        .setCustomId('rules_title')
        .setLabel('Título del mensaje de normas')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(256)
        .setPlaceholder('Ej: Normas de la Comunidad')
        .setRequired(false);

    const descriptionInput = new TextInputBuilder()
        .setCustomId('rules_description')
        .setLabel('Descripción del mensaje de normas')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(2000)
        .setPlaceholder('Escribe la introducción a las normas...')
        .setRequired(false);

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
    const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);

    modal.addComponents(firstActionRow, secondActionRow);

    await interaction.showModal(modal);
}

/**
 * Handle viewing current configuration
 */
async function handleViewCurrentConfig(interaction) {
    const config = interaction.client.configManager.getGuildConfig(interaction.guild.id);
    const customTexts = config.customTexts || {};

    const embed = new EmbedBuilder()
        .setTitle('📝 Configuración Actual de Textos')
        .setColor(embedStrings.colors.info)
        .addFields(
            {
                name: '👋 Bienvenida',
                value: `**Título:** ${customTexts.welcome?.title ? '✅ Personalizado' : '❌ Por defecto'}\n` +
                       `**Descripción:** ${customTexts.welcome?.description ? '✅ Personalizada' : '❌ Por defecto'}\n` +
                       `**Pie de página:** ${customTexts.welcome?.footer ? '✅ Personalizado' : '❌ Por defecto'}`,
                inline: true
            },
            {
                name: '🔐 Verificación',
                value: `**Título:** ${customTexts.verification?.title ? '✅ Personalizado' : '❌ Por defecto'}\n` +
                       `**Descripción:** ${customTexts.verification?.description ? '✅ Personalizada' : '❌ Por defecto'}\n` +
                       `**Botón:** ${customTexts.verification?.buttonText ? '✅ Personalizado' : '❌ Por defecto'}`,
                inline: true
            },
            {
                name: '📋 Normas',
                value: `**Título:** ${customTexts.rules?.title ? '✅ Personalizado' : '❌ Por defecto'}\n` +
                       `**Descripción:** ${customTexts.rules?.description ? '✅ Personalizada' : '❌ Por defecto'}`,
                inline: true
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Bot Educativo • Configuración de Textos' });

    await interaction.reply({ embeds: [embed] });
}

/**
 * Handle restoring default texts
 */
async function handleRestoreDefaults(interaction) {
    const section = interaction.options.getString('seccion');
    const config = interaction.client.configManager.getGuildConfig(interaction.guild.id);
    
    if (!config.customTexts) {
        config.customTexts = {};
    }

    let restoredSections = [];

    switch (section) {
        case 'welcome':
            delete config.customTexts.welcome;
            restoredSections.push('Bienvenida');
            break;
        case 'verification':
            delete config.customTexts.verification;
            restoredSections.push('Verificación');
            break;
        case 'rules':
            delete config.customTexts.rules;
            restoredSections.push('Normas');
            break;
        case 'all':
            config.customTexts = {};
            restoredSections.push('Todas las secciones');
            break;
    }

    interaction.client.configManager.setGuildConfig(interaction.guild.id, config);

    const embed = new EmbedBuilder()
        .setTitle('✅ Textos Restaurados')
        .setDescription(`Se han restaurado los textos por defecto para: **${restoredSections.join(', ')}**`)
        .setColor(embedStrings.colors.success)
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
} 


