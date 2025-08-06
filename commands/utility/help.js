/**
 * Help Command - Utility Category
 * Provides guidance on bot setup and usage
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embedStrings = require('../../data/embedStrings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ayuda')
        .setDescription('Muestra información de ayuda sobre el bot y su configuración')
        .addStringOption(option =>
            option.setName('tema')
                .setDescription('Tema específico sobre el que necesitas ayuda')
                .setRequired(false)
                .addChoices(
                    { name: '📋 Configuración Inicial', value: 'setup' },
                    { name: '🎟️ Sistema de Soporte', value: 'support' },
                    { name: '📚 Comisiones y Cursos', value: 'courses' },
                    { name: '🔧 Comandos de Administración', value: 'admin' },
                    { name: '👥 Comandos de Comunidad', value: 'community' }
                )),
    
    cooldown: 30,

    /**
     * Execute the help command
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const topic = interaction.options.getString('tema');

        if (topic === 'setup') {
            await showSetupHelp(interaction);
        } else if (topic === 'support') {
            await showSupportHelp(interaction);
        } else if (topic === 'courses') {
            await showCoursesHelp(interaction);
        } else if (topic === 'admin') {
            await showAdminHelp(interaction);
        } else if (topic === 'community') {
            await showCommunityHelp(interaction);
        } else {
            await showGeneralHelp(interaction);
        }
    }
};

/**
 * Show general help information
 */
async function showGeneralHelp(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('🤖 Bot de Educación - Ayuda General')
        .setDescription('¡Bienvenido al bot educativo! Aquí tienes información sobre las diferentes funcionalidades disponibles.')
        .setColor(embedStrings.colors.primary)
        .addFields(
            {
                name: '📋 Configuración Inicial',
                value: 'Configura los canales, roles y sistemas básicos del bot',
                inline: true
            },
            {
                name: '🎟️ Sistema de Soporte',
                value: 'Configura y usa el sistema de tickets de soporte',
                inline: true
            },
            {
                name: '📚 Comisiones y Cursos',
                value: 'Gestiona cursos, comisiones y materiales educativos',
                inline: true
            },
            {
                name: '🔧 Comandos de Administración',
                value: 'Herramientas para administradores y moderadores',
                inline: true
            },
            {
                name: '👥 Comandos de Comunidad',
                value: 'Funciones para todos los miembros del servidor',
                inline: true
            },
            {
                name: '🛠️ Comandos de Utilidad',
                value: 'Herramientas útiles para el día a día',
                inline: true
            }
        )
        .addFields({
            name: '💡 ¿Cómo obtener ayuda específica?',
            value: 'Usa `/ayuda tema:[tema]` para obtener información detallada sobre un tema específico.\n\nEjemplos:\n• `/ayuda tema:setup` - Configuración inicial\n• `/ayuda tema:support` - Sistema de soporte\n• `/ayuda tema:courses` - Comisiones y cursos'
        })
        .setFooter({ text: 'Bot Educativo • Sistema de Ayuda' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

/**
 * Show setup help information
 */
async function showSetupHelp(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('📋 Configuración Inicial del Bot')
        .setDescription('Guía paso a paso para configurar el bot correctamente.')
        .setColor(embedStrings.colors.info)
        .addFields(
            {
                name: '1️⃣ Configurar Canales Base',
                value: '```/configuracion bot canales moderacion:#canal-moderacion soporte:#canal-soporte```\nEsto configura los canales para logs de moderación y tickets de soporte.',
                inline: false
            },
            {
                name: '2️⃣ Configurar Roles de Staff',
                value: '```/configuracion roles staff staff:@RolStaff```\nEsto configura el rol que tendrá acceso a comandos administrativos.',
                inline: false
            },
            {
                name: '3️⃣ Configurar Sistema de Verificación',
                value: '```/configuracion roles verificacion canal:#verificacion rol-verificado:@Verificado activar:true```\nEsto activa el sistema de verificación automática.',
                inline: false
            },
            {
                name: '4️⃣ Agregar Cursos',
                value: '```/agregar-curso codigo:MB nombre:"Maquetado Web Básico"```\nAgrega los cursos que se impartirán en el servidor.',
                inline: false
            },
            {
                name: '5️⃣ Crear Comisiones',
                value: '```/crear-comision codigo:MB-01```\nCrea las comisiones para cada curso usando el formato CURSO-NÚMERO.',
                inline: false
            }
        )
        .addFields({
            name: '✅ Verificar Configuración',
            value: 'Usa `/configuracion ver` para ver el estado actual de toda la configuración.'
        })
        .setFooter({ text: 'Bot Educativo • Configuración Inicial' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

/**
 * Show support system help
 */
async function showSupportHelp(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('🎟️ Sistema de Soporte - Configuración y Uso')
        .setDescription('Guía completa para configurar y usar el sistema de tickets de soporte.')
        .setColor(embedStrings.colors.success)
        .addFields(
            {
                name: '🔧 Configuración del Sistema',
                value: '**Paso 1:** Configurar el canal de soporte\n```/configuracion bot canales soporte:#soporte```\n\n**Paso 2:** Configurar el rol de staff\n```/configuracion roles staff staff:@StaffSoporte```',
                inline: false
            },
            {
                name: '🎫 Crear un Ticket',
                value: 'Los usuarios pueden crear tickets usando:\n```/soporte categoria:dudas_cursos descripcion:Mi consulta aquí```\n\n**Categorías disponibles:**\n• ❓ Dudas sobre Cursos\n• ⚙️ Ayuda Técnica\n• 👤 Reportar a un usuario\n• 💡 Sugerencias\n• ➕ Otro',
                inline: false
            },
            {
                name: '🔒 Gestionar Tickets',
                value: '• Los tickets se crean como hilos privados\n• Solo el staff y el usuario pueden ver el ticket\n• Usa el botón "Cerrar Ticket" para archivar el hilo\n• Los tickets se crean automáticamente en el canal configurado',
                inline: false
            },
            {
                name: '⚠️ Solución de Problemas',
                value: '**Error:** "El sistema de soporte no está configurado"\n**Solución:** Ejecuta los comandos de configuración mencionados arriba.\n\n**Error:** "El canal de soporte configurado no existe"\n**Solución:** Verifica que el canal existe y el bot tiene permisos.',
                inline: false
            }
        )
        .setFooter({ text: 'Bot Educativo • Sistema de Soporte' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

/**
 * Show courses help information
 */
async function showCoursesHelp(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('📚 Sistema de Comisiones y Cursos')
        .setDescription('Guía para gestionar cursos, comisiones y materiales educativos.')
        .setColor(embedStrings.colors.maquetado1)
        .addFields(
            {
                name: '📝 Agregar un Curso',
                value: '```/agregar-curso codigo:MB nombre:"Maquetado Web Básico"```\n\n**Formato del código:** Solo letras mayúsculas (ej: MB, JS, PY)',
                inline: false
            },
            {
                name: '🏗️ Crear una Comisión',
                value: '```/crear-comision codigo:MB-01```\n\n**Formato:** CURSO-NÚMERO (ej: MB-01, JS-02, PY-01)\n\n**Se crean automáticamente:**\n• Rol de la comisión\n• Canal de texto general\n• Canal de anuncios\n• Canal de charla libre\n• Canal de voz',
                inline: false
            },
            {
                name: '👥 Inscribir Estudiantes',
                value: 'Los estudiantes se inscriben usando:\n```/anotarse```\n\nEl bot buscará su información en la base de datos y les asignará el rol correspondiente.',
                inline: false
            },
            {
                name: '📖 Materiales de Curso',
                value: '```/material curso:MB```\n\nMuestra los materiales disponibles para el curso especificado.',
                inline: false
            },
            {
                name: '📊 Ver Información',
                value: '```/mi-curso``` - Ver tus cursos inscritos\n```/listar-comisiones``` - Listar todas las comisiones\n```/listar-cursos``` - Listar todos los cursos',
                inline: false
            }
        )
        .setFooter({ text: 'Bot Educativo • Sistema de Cursos' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

/**
 * Show admin help information
 */
async function showAdminHelp(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('🔧 Comandos de Administración')
        .setDescription('Herramientas disponibles para administradores y moderadores.')
        .setColor(embedStrings.colors.warning)
        .addFields(
            {
                name: '⚙️ Configuración',
                value: '```/configuracion``` - Configuración unificada del bot\n```/status``` - Ver estado del bot y configuración',
                inline: false
            },
            {
                name: '📚 Gestión de Cursos',
                value: '```/agregar-curso``` - Agregar nuevo curso\n```/crear-comision``` - Crear nueva comisión\n```/listar-cursos``` - Ver todos los cursos\n```/listar-comisiones``` - Ver todas las comisiones',
                inline: false
            },
            {
                name: '👮 Moderación',
                value: '```/expulsar``` - Expulsar usuario\n```/silenciar``` - Silenciar usuario\n```/reportar``` - Reportar usuario',
                inline: false
            },
            {
                name: '📢 Comunicación',
                value: '```/normas``` - Enviar panel de normas\n```/presentarme``` - Enviar guía de presentación\n```/recordatorio``` - Crear recordatorios',
                inline: false
            },
            {
                name: '🔐 Verificación',
                value: '```/enviar-verificacion``` - Enviar mensaje de verificación',
                inline: false
            }
        )
        .setFooter({ text: 'Bot Educativo • Comandos de Administración' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

/**
 * Show community help information
 */
async function showCommunityHelp(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('👥 Comandos de Comunidad')
        .setDescription('Funciones disponibles para todos los miembros del servidor.')
        .setColor(embedStrings.colors.info)
        .addFields(
            {
                name: '🎓 Educación',
                value: '```/anotarse``` - Inscribirse en cursos\n```/material``` - Ver materiales de curso\n```/mi-curso``` - Ver tus cursos inscritos',
                inline: false
            },
            {
                name: '🎟️ Soporte',
                value: '```/soporte``` - Crear ticket de soporte\n```/feedback``` - Enviar feedback',
                inline: false
            },
            {
                name: '👋 Presentación',
                value: '```/hola``` - Saludar al bot\n\nLos administradores pueden usar:\n```/presentarme``` - Enviar guía de presentación',
                inline: false
            },
            {
                name: '📋 Información',
                value: '```/ayuda``` - Ver esta guía de ayuda\n```/inscripciones``` - Información sobre inscripciones',
                inline: false
            }
        )
        .setFooter({ text: 'Bot Educativo • Comandos de Comunidad' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
} 