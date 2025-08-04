/**
 * Permission Management Utility
 * Centralized permission checking and validation
 */

const { PermissionFlagsBits } = require('discord.js');

/**
 * Permission Groups for easier management
 */
const PermissionGroups = {
    BASIC: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.UseSlashCommands
    ],
    MODERATION: [
        PermissionFlagsBits.ModerateMembers,
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.BanMembers,
        PermissionFlagsBits.ManageMessages
    ],
    ADMINISTRATION: [
        PermissionFlagsBits.Administrator,
        PermissionFlagsBits.ManageGuild,
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.ManageChannels
    ],
    ROLE_MANAGEMENT: [
        PermissionFlagsBits.ManageRoles
    ],
    THREAD_MANAGEMENT: [
        PermissionFlagsBits.CreatePrivateThreads,
        PermissionFlagsBits.CreatePublicThreads,
        PermissionFlagsBits.ManageThreads
    ]
};

/**
 * Permission Checker Class
 */
class PermissionChecker {
    /**
     * Check if a member has specific permissions
     * @param {GuildMember} member 
     * @param {Array|BigInt} permissions 
     * @returns {Object} Result with success status and missing permissions
     */
    static checkMemberPermissions(member, permissions) {
        if (!member || !member.permissions) {
            return {
                success: false,
                missing: Array.isArray(permissions) ? permissions : [permissions],
                message: 'No se pudo verificar los permisos del miembro.'
            };
        }

        const permissionsToCheck = Array.isArray(permissions) ? permissions : [permissions];
        const missing = [];

        for (const permission of permissionsToCheck) {
            if (!member.permissions.has(permission)) {
                missing.push(permission);
            }
        }

        return {
            success: missing.length === 0,
            missing,
            message: missing.length > 0 
                ? `Permisos faltantes: ${missing.map(p => this.getPermissionName(p)).join(', ')}`
                : 'Todos los permisos están presentes.'
        };
    }

    /**
     * Check if bot has specific permissions in a guild
     * @param {Guild} guild 
     * @param {Array|BigInt} permissions 
     * @returns {Object} Result with success status and missing permissions
     */
    static checkBotPermissions(guild, permissions) {
        if (!guild || !guild.members.me) {
            return {
                success: false,
                missing: Array.isArray(permissions) ? permissions : [permissions],
                message: 'No se pudo verificar los permisos del bot.'
            };
        }

        return this.checkMemberPermissions(guild.members.me, permissions);
    }

    /**
     * Check if bot can manage a specific role
     * @param {Guild} guild 
     * @param {Role} role 
     * @returns {Object} Result with success status and reason
     */
    static checkRoleManagement(guild, role) {
        if (!guild || !guild.members.me) {
            return {
                success: false,
                message: 'No se pudo acceder a la información del servidor.'
            };
        }

        const botMember = guild.members.me;

        // Check if bot has manage roles permission
        if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return {
                success: false,
                message: 'El bot no tiene permisos para gestionar roles.'
            };
        }

        // Check role hierarchy
        if (role.position >= botMember.roles.highest.position) {
            return {
                success: false,
                message: 'El rol está por encima del rol más alto del bot en la jerarquía.'
            };
        }

        // Check if role is managed by integration (bot roles, boosts, etc.)
        if (role.managed) {
            return {
                success: false,
                message: 'Este rol es gestionado por una integración y no se puede modificar.'
            };
        }

        return {
            success: true,
            message: 'El bot puede gestionar este rol.'
        };
    }

    /**
     * Check if a member can be moderated by another member
     * @param {GuildMember} moderator 
     * @param {GuildMember} target 
     * @param {string} action - 'kick', 'ban', 'timeout', etc.
     * @returns {Object} Result with success status and reason
     */
    static checkModerationPermissions(moderator, target, action = 'moderate') {
        if (!moderator || !target) {
            return {
                success: false,
                message: 'Información de miembros incompleta.'
            };
        }

        // Can't moderate yourself
        if (moderator.id === target.id) {
            return {
                success: false,
                message: 'No puedes moderarte a ti mismo.'
            };
        }

        // Can't moderate the guild owner
        if (target.id === target.guild.ownerId) {
            return {
                success: false,
                message: 'No se puede moderar al propietario del servidor.'
            };
        }

        // Check if moderator has higher role than target
        if (moderator.roles.highest.position <= target.roles.highest.position) {
            return {
                success: false,
                message: 'No puedes moderar a alguien con un rol igual o superior al tuyo.'
            };
        }

        // Check specific action permissions
        const actionPermissions = {
            kick: PermissionFlagsBits.KickMembers,
            ban: PermissionFlagsBits.BanMembers,
            timeout: PermissionFlagsBits.ModerateMembers,
            moderate: PermissionFlagsBits.ModerateMembers
        };

        const requiredPermission = actionPermissions[action];
        if (requiredPermission && !moderator.permissions.has(requiredPermission)) {
            return {
                success: false,
                message: `No tienes permisos para ${action} miembros.`
            };
        }

        return {
            success: true,
            message: 'Permisos de moderación válidos.'
        };
    }

    /**
     * Check if bot can perform moderation action on target
     * @param {Guild} guild 
     * @param {GuildMember} target 
     * @param {string} action 
     * @returns {Object} Result with success status and reason
     */
    static checkBotModerationPermissions(guild, target, action = 'moderate') {
        if (!guild || !guild.members.me || !target) {
            return {
                success: false,
                message: 'Información incompleta para verificar permisos.'
            };
        }

        const botMember = guild.members.me;

        // Check if bot can moderate the target
        const moderationCheck = this.checkModerationPermissions(botMember, target, action);
        if (!moderationCheck.success) {
            return moderationCheck;
        }

        // Additional check: ensure target is kickable/bannable
        if (action === 'kick' && !target.kickable) {
            return {
                success: false,
                message: 'No se puede expulsar a este miembro debido a la jerarquía de roles.'
            };
        }

        if (action === 'ban' && !target.bannable) {
            return {
                success: false,
                message: 'No se puede banear a este miembro debido a la jerarquía de roles.'
            };
        }

        if (action === 'timeout' && !target.moderatable) {
            return {
                success: false,
                message: 'No se puede silenciar a este miembro debido a la jerarquía de roles.'
            };
        }

        return {
            success: true,
            message: 'El bot puede realizar esta acción de moderación.'
        };
    }

    /**
     * Get human-readable permission name
     * @param {BigInt} permission 
     * @returns {string}
     */
    static getPermissionName(permission) {
        const permissionNames = {
            [PermissionFlagsBits.Administrator]: 'Administrador',
            [PermissionFlagsBits.ViewChannel]: 'Ver Canal',
            [PermissionFlagsBits.SendMessages]: 'Enviar Mensajes',
            [PermissionFlagsBits.UseSlashCommands]: 'Usar Comandos de Barra',
            [PermissionFlagsBits.ManageMessages]: 'Gestionar Mensajes',
            [PermissionFlagsBits.ManageRoles]: 'Gestionar Roles',
            [PermissionFlagsBits.ManageChannels]: 'Gestionar Canales',
            [PermissionFlagsBits.KickMembers]: 'Expulsar Miembros',
            [PermissionFlagsBits.BanMembers]: 'Banear Miembros',
            [PermissionFlagsBits.ModerateMembers]: 'Moderar Miembros',
            [PermissionFlagsBits.ManageGuild]: 'Gestionar Servidor',
            [PermissionFlagsBits.CreatePrivateThreads]: 'Crear Hilos Privados',
            [PermissionFlagsBits.CreatePublicThreads]: 'Crear Hilos Públicos',
            [PermissionFlagsBits.ManageThreads]: 'Gestionar Hilos'
        };

        return permissionNames[permission] || 'Permiso Desconocido';
    }

    /**
     * Get all missing permissions for a command
     * @param {GuildMember} member 
     * @param {Object} command 
     * @returns {Object} Detailed permission analysis
     */
    static analyzeCommandPermissions(member, command) {
        if (!command.data.default_member_permissions) {
            return {
                success: true,
                message: 'Este comando no requiere permisos especiales.'
            };
        }

        const requiredPermissions = command.data.default_member_permissions;
        const memberCheck = this.checkMemberPermissions(member, requiredPermissions);
        
        if (!memberCheck.success) {
            return {
                success: false,
                message: `No tienes los permisos necesarios: ${memberCheck.missing.map(p => this.getPermissionName(p)).join(', ')}`,
                missing: memberCheck.missing,
                required: requiredPermissions
            };
        }

        return {
            success: true,
            message: 'Tienes todos los permisos necesarios para este comando.'
        };
    }

    /**
     * Check if user has any of the specified roles
     * @param {GuildMember} member 
     * @param {Array<string>} roleIds 
     * @returns {Object} Result with success status
     */
    static checkRoles(member, roleIds) {
        if (!member || !roleIds || roleIds.length === 0) {
            return {
                success: false,
                message: 'Información de roles incompleta.'
            };
        }

        const hasRole = roleIds.some(roleId => member.roles.cache.has(roleId));
        
        return {
            success: hasRole,
            message: hasRole 
                ? 'El usuario tiene al menos uno de los roles requeridos.'
                : 'El usuario no tiene ninguno de los roles requeridos.'
        };
    }

    /**
     * Get comprehensive permission report for debugging
     * @param {Guild} guild 
     * @returns {Object} Detailed permission report
     */
    static getPermissionReport(guild) {
        if (!guild || !guild.members.me) {
            return { error: 'No se pudo acceder a la información del servidor.' };
        }

        const botMember = guild.members.me;
        const report = {
            botId: botMember.id,
            botTag: botMember.user.tag,
            highestRole: botMember.roles.highest.name,
            rolePosition: botMember.roles.highest.position,
            permissions: {},
            issues: []
        };

        // Check each permission group
        Object.entries(PermissionGroups).forEach(([groupName, permissions]) => {
            const groupCheck = this.checkMemberPermissions(botMember, permissions);
            report.permissions[groupName] = {
                hasAll: groupCheck.success,
                missing: groupCheck.missing.map(p => this.getPermissionName(p))
            };

            if (!groupCheck.success) {
                report.issues.push(`Grupo ${groupName}: Faltan permisos - ${groupCheck.missing.map(p => this.getPermissionName(p)).join(', ')}`);
            }
        });

        return report;
    }
}

module.exports = {
    PermissionChecker,
    PermissionGroups,
    PermissionFlagsBits
};