/**
 * Enhanced Interaction Create Event Handler
 * Handles slash commands and button interactions with comprehensive error handling
 */

const { Events, Collection, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const embedStrings = require('../data/embedStrings');

module.exports = {
    name: Events.InteractionCreate,
    
    /**
     * Execute function for interaction events with enhanced error handling
     * @param {Interaction} interaction - The interaction object
     */
    async execute(interaction) {
        try {
            // Handle slash commands
            if (interaction.isChatInputCommand()) {
                await handleSlashCommand(interaction);
            }
            
            // Handle button interactions
            else if (interaction.isButton()) {
                await handleButtonInteraction(interaction);
            }
            
            // Handle select menu interactions
            else if (interaction.isAnySelectMenu()) {
                await handleSelectMenuInteraction(interaction);
            }
            
            // Handle modal submissions
            else if (interaction.isModalSubmit()) {
                await handleModalSubmission(interaction);
            }
            
        } catch (error) {
            console.error('❌ Critical error in interactionCreate event:', error);
            await sendErrorResponse(interaction, 'Se produjo un error crítico. Por favor, inténtalo de nuevo más tarde.');
        }
    }
};

/**
 * Enhanced Slash Command Handler
 * @param {ChatInputCommandInteraction} interaction 
 */
async function handleSlashCommand(interaction) {
    const startTime = Date.now();
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`❌ Command not found: ${interaction.commandName} [${new Date().toISOString()}]`);
        return await sendErrorResponse(interaction, 'Comando no encontrado.');
    }

    // Enhanced cooldown handling
    try {
        const cooldownResult = await handleCooldown(interaction, command);
        if (!cooldownResult.allowed) {
            return await interaction.reply({
                content: cooldownResult.message,
                ephemeral: true
            });
        }
    } catch (error) {
        console.error('❌ Error handling cooldown:', { error: error.message, command: interaction.commandName });
        // Continue execution even if cooldown fails
    }

    // Permission checking
    try {
        const permissionResult = await checkPermissions(interaction, command);
        if (!permissionResult.allowed) {
            return await interaction.reply({
                content: permissionResult.message,
                ephemeral: true
            });
        }
    } catch (error) {
        console.error('❌ Error checking permissions:', { error: error.message, command: interaction.commandName });
        return await sendErrorResponse(interaction, 'Error verifying permissions.');
    }

    // Execute command with comprehensive error handling
    try {
        await command.execute(interaction);
        
        const executionTime = Date.now() - startTime;
        
        // Log successful command execution
        const guild = interaction.guild ? interaction.guild.name : 'DM';
        console.log(`✅ ${interaction.user.tag} used /${command.data.name} in ${guild} (${executionTime}ms) [${new Date().toISOString()}]`);
        
        // Log slow commands
        if (executionTime > 3000) {
            console.warn(`⚠️ Slow command execution: /${command.data.name} took ${executionTime}ms`);
        }
        
    } catch (error) {
        const executionTime = Date.now() - startTime;
        console.error(`❌ Error executing ${command.data.name} (${executionTime}ms):`, {
            message: error.message,
            stack: error.stack,
            user: interaction.user.tag,
            guild: interaction.guild?.name,
            timestamp: new Date().toISOString()
        });
        
        // Send user-friendly error message
        const errorMessage = getErrorMessage(error);
        await sendErrorResponse(interaction, errorMessage);
        
        // Log to moderation channel if configured
        await logErrorToModerationChannel(interaction, command, error);
    }
}

/**
 * Enhanced error response with retry logic
 */
async function sendErrorResponseWithRetry(interaction, message, retries = 2) {
    for (let i = 0; i <= retries; i++) {
        try {
            return await sendErrorResponse(interaction, message);
        } catch (error) {
            if (i === retries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

/**
 * Enhanced Cooldown Handler
 * @param {ChatInputCommandInteraction} interaction 
 * @param {Object} command 
 * @returns {Object} Result object with allowed status and message
 */
async function handleCooldown(interaction, command) {
    const { cooldowns } = interaction.client;
    
    if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

    if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
            const expiredTimestamp = Math.round(expirationTime / 1000);
            return {
                allowed: false,
                message: `⏰ Por favor espera, estás en cooldown para \`${command.data.name}\`. Podrás usarlo de nuevo <t:${expiredTimestamp}:R>.`
            };
        }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    
    return { allowed: true };
}

/**
 * Enhanced Permission Checker
 * @param {ChatInputCommandInteraction} interaction 
 * @param {Object} command 
 * @returns {Object} Result object with allowed status and message
 */
async function checkPermissions(interaction, command) {
    // Skip permission check for DMs
    if (!interaction.guild) {
        return { allowed: true };
    }

    // Skip if no member (shouldn't happen but safety check)
    if (!interaction.member) {
        return { allowed: false, message: '❌ No se pudo verificar los permisos del miembro.' };
    }

    // Check if command has permission requirements
    if (!command.data.default_member_permissions) {
        return { allowed: true };
    }

    const member = interaction.member;
    const requiredPermissions = command.data.default_member_permissions;

    // Check if user has required permissions
    if (!member.permissions.has(requiredPermissions)) {
        return {
            allowed: false,
            message: '❌ No tienes los permisos necesarios para usar este comando.'
        };
    }

    // Check if bot has required permissions
    const botMember = interaction.guild.members.me;
    if (!botMember.permissions.has(requiredPermissions)) {
        return {
            allowed: false,
            message: '❌ El bot no tiene los permisos necesarios para ejecutar este comando.'
        };
    }

    return { allowed: true };
}

/**
 * Enhanced Button Interaction Handler
 * @param {ButtonInteraction} interaction 
 */
async function handleButtonInteraction(interaction) {
    try {
        const [action, type, ...rest] = interaction.customId.split('_');
        
        // Validate customId format
        if (!action || !type) {
            throw new Error(`Invalid customId format: ${interaction.customId}`);
        }
        
        switch (action) {
            case 'role':
                await handleRoleToggle(interaction, `${type}_${rest.join('_')}`);
                break;
            case 'intro':
                await handleIntroInteraction(interaction, type);
                break;
            case 'ticket':
                const threadId = rest.join('_');
                if (!threadId) {
                    await interaction.reply({
                        content: embedStrings.messages.errors.invalidAction,
                        ephemeral: true
                    });
                    return;
                }
                await handleTicketInteraction(interaction, type, threadId);
                break;
            case 'verify':
                await handleVerificationInteraction(interaction, type);
                break;
            case 'text':
                await handleTextConfigInteraction(interaction, type);
                break;

            default:
                await interaction.reply({
                    content: '❌ Interacción de botón desconocida.',
                    ephemeral: true
                });
        }
    } catch (error) {
        console.error('❌ Error handling button interaction:', {
            customId: interaction.customId,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        await sendErrorResponse(interaction, 'Error al procesar la interacción del botón.');
    }
}

/**
 * Handle Select Menu Interactions
 * @param {SelectMenuInteraction} interaction 
 */
async function handleSelectMenuInteraction(interaction) {
    try {
        if (interaction.customId === 'search_select_music') {
            await interaction.reply({
                content: '🚧 Funcionalidad de música no disponible.',
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: '🚧 Funcionalidad de menú de selección en desarrollo.',
                ephemeral: true
            });
        }
    } catch (error) {
        console.error('❌ Error handling select menu interaction:', error);
        await sendErrorResponse(interaction, 'Error al procesar el menú de selección.');
    }
}

/**
 * Handle Modal Submissions
 * @param {ModalSubmitInteraction} interaction 
 */
async function handleModalSubmission(interaction) {
    try {
        const modalId = interaction.customId;
        
        if (modalId.endsWith('_text_modal')) {
            await handleTextConfigModal(interaction, modalId);
        } else {
            await interaction.reply({
                content: '🚧 Funcionalidad de modal en desarrollo.',
                ephemeral: true
            });
        }
    } catch (error) {
        console.error('❌ Error handling modal submission:', error);
        await sendErrorResponse(interaction, 'Error processing form.');
    }
}

/**
 * Handle Autocomplete Interactions
 * @param {AutocompleteInteraction} interaction 
 */
async function handleAutocompleteInteraction(interaction) {
    try {
        const command = interaction.client.commands.get(interaction.commandName);
        
        if (!command || !command.autocomplete) {
            return;
        }
        
        await command.autocomplete(interaction);
    } catch (error) {
        console.error('❌ Error handling autocomplete:', error);
    }
}

/**
 * Handle Text Configuration Modal Submissions
 * @param {ModalSubmitInteraction} interaction 
 * @param {string} modalId 
 */
async function handleTextConfigModal(interaction, modalId) {
    try {
        // Check if user has staff role
        if (!interaction.client.configManager || !interaction.client.configManager.hasStaffPermission(interaction.member)) {
            return interaction.reply({
                content: embedStrings.messages.errors.noStaffPermission,
                ephemeral: true
            });
        }

        const config = interaction.client.configManager.getGuildConfig(interaction.guild.id);
        if (!config.customTexts) {
            config.customTexts = {};
        }

        let sectionName = '';
        let updates = [];

        if (modalId === 'welcome_text_modal') {
            sectionName = 'Bienvenida';
            if (!config.customTexts.welcome) config.customTexts.welcome = {};
            
            const title = interaction.fields.getTextInputValue('welcome_title');
            const description = interaction.fields.getTextInputValue('welcome_description');
            const footer = interaction.fields.getTextInputValue('welcome_footer');

            if (title) {
                config.customTexts.welcome.title = title;
                updates.push('• Título actualizado');
            }
            if (description) {
                config.customTexts.welcome.description = description;
                updates.push('• Descripción actualizada');
            }
            if (footer) {
                config.customTexts.welcome.footer = footer;
                updates.push('• Pie de página actualizado');
            }
        }
        else if (modalId === 'verification_text_modal') {
            sectionName = 'Verificación';
            if (!config.customTexts.verification) config.customTexts.verification = {};
            
            const title = interaction.fields.getTextInputValue('verification_title');
            const description = interaction.fields.getTextInputValue('verification_description');
            const buttonText = interaction.fields.getTextInputValue('verification_button');

            if (title) {
                config.customTexts.verification.title = title;
                updates.push('• Título actualizado');
            }
            if (description) {
                config.customTexts.verification.description = description;
                updates.push('• Descripción actualizada');
            }
            if (buttonText) {
                config.customTexts.verification.buttonText = buttonText;
                updates.push('• Texto del botón actualizado');
            }
        }
        else if (modalId === 'rules_text_modal') {
            sectionName = 'Normas';
            if (!config.customTexts.rules) config.customTexts.rules = {};
            
            const title = interaction.fields.getTextInputValue('rules_title');
            const description = interaction.fields.getTextInputValue('rules_description');

            if (title) {
                config.customTexts.rules.title = title;
                updates.push('• Título actualizado');
            }
            if (description) {
                config.customTexts.rules.description = description;
                updates.push('• Descripción actualizada');
            }
        }

        if (updates.length === 0) {
            return interaction.reply({
                content: '❌ No se proporcionaron cambios para actualizar.',
                ephemeral: true
            });
        }

        // Save configuration
        interaction.client.configManager.setGuildConfig(interaction.guild.id, config);

        const embed = new EmbedBuilder()
            .setTitle(`✅ Textos de ${sectionName} Actualizados`)
            .setDescription(updates.join('\n'))
            .setColor(embedStrings.colors.success)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('❌ Error handling text config modal:', error);
        await sendErrorResponse(interaction, 'Error al procesar la configuración de textos.');
    }
}

/**
 * Enhanced Ticket System Handler
 * @param {ButtonInteraction} interaction
 * @param {string} type - The action type (e.g., 'close')
 * @param {string} threadId - The ID of the ticket thread
 */
async function handleTicketInteraction(interaction, type, threadId) {
    try {
        const supportRoleId = interaction.client.configManager.getStaffRoleId(interaction.guild.id);
        
        // Check permissions
        if (!interaction.member.roles.cache.has(supportRoleId) && 
            !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({
                content: embedStrings.messages.errors.noPermission,
                ephemeral: true
            });
        }

        const thread = interaction.channel;
        if (thread.id !== threadId) {
            return await interaction.reply({ 
                content: embedStrings.messages.errors.invalidAction, 
                ephemeral: true 
            });
        }

        if (type === 'close') {
            await interaction.reply({ 
                content: embedStrings.messages.success.ticketClosing, 
                ephemeral: false 
            });
            
            setTimeout(async () => {
                try {
                    await thread.setLocked(true);
                    await thread.setArchived(true);
                } catch (error) {
                    console.error('Error closing ticket:', error);
                    await interaction.followUp({ 
                        content: embedStrings.messages.errors.ticketArchiveError, 
                        ephemeral: true 
                    });
                }
            }, 5000);
        }
    } catch (error) {
        console.error('❌ Error in ticket interaction:', error);
        try {
            await sendErrorResponse(interaction, 'Error al procesar la acción del ticket.');
        } catch (sendError) {
            console.error('❌ Failed to send error response:', sendError);
        }
    }
}

/**
 * Handle Verification Interactions
 * @param {ButtonInteraction} interaction 
 * @param {string} type 
 */
async function handleVerificationInteraction(interaction, type) {
    try {
        if (type === 'user') {
            const config = interaction.client.configManager.getGuildConfig(interaction.guild.id);
            const verificationConfig = config.verification;

            if (!verificationConfig || !verificationConfig.enabled) {
                return await interaction.reply({
                    content: embedStrings.messages.errors.verificationNotEnabled,
                    ephemeral: true
                });
            }

            const role = interaction.guild.roles.cache.get(verificationConfig.roleId);
            if (!role) {
                return await interaction.reply({
                    content: embedStrings.messages.errors.verificationRoleNotFound,
                    ephemeral: true
                });
            }

            // Check if user already has the role
            if (interaction.member.roles.cache.has(role.id)) {
                return await interaction.reply({
                    content: embedStrings.messages.errors.alreadyVerified,
                    ephemeral: true
                });
            }

            // Add the verified role
            await interaction.member.roles.add(role);

            // Create success embed
            const successEmbed = new EmbedBuilder()
                .setTitle(embedStrings.verification.success.title)
                .setDescription(embedStrings.verification.success.description(role.name))
                .setColor(embedStrings.colors.success)
                .addFields(
                    {
                        name: embedStrings.verification.success.fields.access.name,
                        value: embedStrings.verification.success.fields.access.value,
                        inline: false
                    },
                    {
                        name: embedStrings.verification.success.fields.nextSteps.name,
                        value: embedStrings.verification.success.fields.nextSteps.value,
                        inline: false
                    }
                )
                .setFooter({ text: embedStrings.verification.success.footer })
                .setTimestamp();

            await interaction.reply({
                embeds: [successEmbed],
                ephemeral: true
            });

            // Log verification to moderation channel
            const modChannelId = interaction.client.configManager.getModerationChannelId(interaction.guild.id);
            if (modChannelId) {
                const modChannel = interaction.guild.channels.cache.get(modChannelId);
                if (modChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('✅ Usuario Verificado')
                        .setDescription(`${interaction.user.tag} se ha verificado exitosamente`)
                        .setColor(embedStrings.colors.success)
                        .addFields(
                            { name: 'Usuario', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                            { name: 'Rol otorgado', value: role.name, inline: true },
                            { name: 'Fecha', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                        )
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setTimestamp();

                    await modChannel.send({ embeds: [logEmbed] });
                }
            }

            console.log(`✅ ${interaction.user.tag} se verificó en ${interaction.guild.name}`);
        }
    } catch (error) {
        console.error('❌ Error en verificación:', error);
        await sendErrorResponse(interaction, embedStrings.messages.errors.verificationError);
    }
}



/**
 * Enhanced Introduction Guide Handler
 * @param {ButtonInteraction} interaction 
 * @param {string} type 
 */
async function handleIntroInteraction(interaction, type) {
    try {
        if (type === 'example') {
            const exampleEmbed = new EmbedBuilder()
                .setTitle(embedStrings.introExample.title)
                .setDescription(embedStrings.introExample.description)
                .setColor(embedStrings.colors.success)
                .setFooter({ text: embedStrings.introExample.footer });

            return await interaction.reply({
                embeds: [exampleEmbed],
                ephemeral: true
            });
        } 
        

    } catch (error) {
        console.error('❌ Error in intro interaction:', error);
        await sendErrorResponse(interaction, 'Error al procesar la guía de presentación.');
    }
}

/**
 * Enhanced Role Toggle Handler
 * @param {ButtonInteraction} interaction 
 * @param {string} roleType 
 */
async function handleRoleToggle(interaction, roleType) {
    try {
        const member = interaction.member;
        const guild = interaction.guild;
        
        const roleMap = {
            'pronoun-el': { 
                id: interaction.client.configManager.getIdentityRoleId(interaction.guild.id, 'pronounEl'), 
                name: 'Pronombres: Él' 
            },
            'pronoun-ella': { 
                id: interaction.client.configManager.getIdentityRoleId(interaction.guild.id, 'pronounElla'), 
                name: 'Pronombres: Ella' 
            },
            'pronoun-elle': { 
                id: interaction.client.configManager.getIdentityRoleId(interaction.guild.id, 'pronounElle'), 
                name: 'Pronombres: Elle' 
            },
            'identity-transmasc': { 
                id: interaction.client.configManager.getIdentityRoleId(interaction.guild.id, 'transmasc'), 
                name: 'Transmasc' 
            },
            'identity-transfem': { 
                id: interaction.client.configManager.getIdentityRoleId(interaction.guild.id, 'transfem'), 
                name: 'Transfem' 
            },
            'identity-nobinarie': { 
                id: interaction.client.configManager.getIdentityRoleId(interaction.guild.id, 'nobinarie'), 
                name: 'No Binarie' 
            },
            'identity-travesti': { 
                id: interaction.client.configManager.getIdentityRoleId(interaction.guild.id, 'travesti'), 
                name: 'Travesti' 
            },
            'identity-aliade': { 
                id: interaction.client.configManager.getIdentityRoleId(interaction.guild.id, 'aliade'), 
                name: 'Aliade' 
            }
        };

        const roleData = roleMap[roleType];
        if (!roleData) {
            return await interaction.reply({ 
                content: embedStrings.messages.errors.invalidRoleSelection, 
                ephemeral: true 
            });
        }

        if (!roleData.id) {
            return await interaction.reply({ 
                content: embedStrings.messages.errors.roleNotConfigured(roleData.name), 
                ephemeral: true 
            });
        }

        const role = guild.roles.cache.get(roleData.id);
        if (!role) {
            return await interaction.reply({ 
                content: embedStrings.messages.errors.roleNotFound(roleData.name), 
                ephemeral: true 
            });
        }

        // Check bot permissions
        if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return await interaction.reply({
                content: embedStrings.messages.errors.noManageRolesPermission,
                ephemeral: true
            });
        }

        // Check role hierarchy
        if (role.position >= guild.members.me.roles.highest.position) {
            return await interaction.reply({
                content: embedStrings.messages.errors.roleHierarchyError,
                ephemeral: true
            });
        }

        if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
            await interaction.reply({ 
                content: embedStrings.messages.success.roleRemoved(role.name), 
                ephemeral: true 
            });
        } else {
            await member.roles.add(role);
            await interaction.reply({ 
                content: embedStrings.messages.success.roleAdded(role.name), 
                ephemeral: true 
            });
        }
    } catch (error) {
        console.error('❌ Error adding/removing role:', error);
        await sendErrorResponse(interaction, embedStrings.messages.errors.roleManagementError);
    }
}

/**
 * Enhanced Error Response Handler
 * @param {Interaction} interaction 
 * @param {string} message 
 */
async function sendErrorResponse(interaction, message) {
    // Ensure message is not empty
    const safeMessage = message && message.trim() ? message.trim() : 'Se produjo un error inesperado.';
    
    const errorResponse = {
        content: `❌ ${safeMessage}`,
        ephemeral: true
    };

    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorResponse);
        } else {
            await interaction.reply(errorResponse);
        }
    } catch (error) {
        console.error('❌ Failed to send error response:', error);
    }
}

/**
 * Get User-Friendly Error Message
 * @param {Error} error 
 * @returns {string} User-friendly error message
 */
function getErrorMessage(error) {
    // Discord API specific errors
    if (error.code) {
        switch (error.code) {
            case 10062: // Unknown interaction
                return 'Esta interacción ha expirado. Por favor, inténtalo de nuevo.';
            case 50013: // Missing permissions
                return 'El bot no tiene los permisos necesarios para realizar esta acción.';
            case 50001: // Missing access
                return 'El bot no tiene acceso a este recurso.';
            case 10008: // Unknown message
                return 'El mensaje no fue encontrado.';
            case 10003: // Unknown channel
                return 'El canal no fue encontrado.';
            case 50035: // Invalid form body
                return 'Los datos proporcionados no son válidos.';
            default:
                return 'Se produjo un error inesperado. Por favor, inténtalo de nuevo.';
        }
    }

    // Generic error handling
    if (error.message.includes('timeout')) {
        return 'La operación tardó demasiado tiempo. Por favor, inténtalo de nuevo.';
    }

    return 'Se produjo un error inesperado. Por favor, inténtalo de nuevo más tarde.';
}

/**
 * Log Error to Moderation Channel
 * @param {ChatInputCommandInteraction} interaction 
 * @param {Object} command 
 * @param {Error} error 
 */
async function logErrorToModerationChannel(interaction, command, error) {
    try {
        const modChannelId = interaction.client.configManager.getModerationChannelId(interaction.guild.id);
        if (!modChannelId) return;

        const modChannel = interaction.guild?.channels.cache.get(modChannelId);
        if (!modChannel) return;

        const errorEmbed = new EmbedBuilder()
            .setTitle('🚨 Error de Comando')
            .setColor(0xFF0000)
            .addFields(
                { name: 'Comando', value: command.data.name, inline: true },
                { name: 'Usuario', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                { name: 'Canal', value: `${interaction.channel.name} (${interaction.channel.id})`, inline: true },
                { name: 'Error', value: `\`\`\`${error.message.slice(0, 1000)}\`\`\``, inline: false }
            )
            .setTimestamp();

        await modChannel.send({ embeds: [errorEmbed] });
    } catch (logError) {
        console.error('❌ Failed to log error to moderation channel:', logError);
    }
}

