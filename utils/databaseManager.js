/**
 * Database Manager Utility
 * Manages bot data persistence using better-sqlite3
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class DatabaseManager {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, '..', 'data', 'bot.db');
        this.initialized = false;
    }

    /**
     * Initialize the database and create tables
     */
    initialize() {
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // Initialize database
            this.db = new Database(this.dbPath);
            
            // Enable WAL mode for better concurrency
            this.db.pragma('journal_mode = WAL');
            
            // Create tables
            this.createTables();
            
            this.initialized = true;
            console.log('✅ Database initialized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            return false;
        }
    }

    /**
     * Create all necessary tables
     */
    createTables() {
        // Guilds table (simplified - only for essential data)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS guilds (
                guild_id TEXT PRIMARY KEY,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Identity roles table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS identity_roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                role_type TEXT NOT NULL,
                role_id TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(guild_id, role_type),
                FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE
            )
        `);

        // Custom texts table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS custom_texts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                section TEXT NOT NULL,
                key_name TEXT NOT NULL,
                value TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(guild_id, section, key_name),
                FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE
            )
        `);

        // Courses table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                course_name TEXT NOT NULL,
                description TEXT,
                teacher_id TEXT,
                channel_id TEXT,
                role_id TEXT,
                max_students INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE
            )
        `);

        // Course enrollments table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS course_enrollments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id INTEGER NOT NULL,
                user_id TEXT NOT NULL,
                enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active',
                UNIQUE(course_id, user_id),
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            )
        `);

        // Educational Commissions table (course sections)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS educational_commissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                commission_code TEXT NOT NULL,
                course_code TEXT NOT NULL,
                course_name TEXT NOT NULL,
                shift TEXT DEFAULT 'G',
                number TEXT NOT NULL,
                role_id TEXT NOT NULL,
                text_channel_id TEXT NOT NULL,
                notifications_channel_id TEXT NOT NULL,
                chat_channel_id TEXT NOT NULL,
                voice_channel_id TEXT NOT NULL,
                created_by TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(guild_id, commission_code),
                FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE
            )
        `);

        // Art Commissions table (for future use)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS art_commissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                price REAL,
                currency TEXT DEFAULT 'USD',
                status TEXT DEFAULT 'open',
                client_id TEXT,
                artist_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE
            )
        `);

        // Reminders table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS reminders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                channel_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                message TEXT NOT NULL,
                scheduled_time DATETIME NOT NULL,
                is_recurring BOOLEAN DEFAULT FALSE,
                recurrence_pattern TEXT,
                is_sent BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (guild_id) REFERENCES guild_configs(guild_id) ON DELETE CASCADE
            )
        `);

        // Create indexes for better performance
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_identity_roles_guild_type ON identity_roles(guild_id, role_type);
            CREATE INDEX IF NOT EXISTS idx_custom_texts_guild_section ON custom_texts(guild_id, section);
            CREATE INDEX IF NOT EXISTS idx_courses_guild_active ON courses(guild_id, is_active);
            CREATE INDEX IF NOT EXISTS idx_enrollments_course_user ON course_enrollments(course_id, user_id);
            CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_time ON reminders(scheduled_time, is_sent);
            CREATE INDEX IF NOT EXISTS idx_educational_commissions_guild_code ON educational_commissions(guild_id, commission_code);
            CREATE INDEX IF NOT EXISTS idx_educational_commissions_course ON educational_commissions(guild_id, course_code);
        `);

        console.log('✅ Database tables created successfully');
    }

    /**
     * Get guild configuration (simplified - only essential data)
     * @param {string} guildId 
     * @returns {Object|null}
     */
    getGuildConfig(guildId) {
        if (!this.initialized) return null;

        try {
            // Get guild record
            const guildStmt = this.db.prepare(`
                SELECT * FROM guilds WHERE guild_id = ?
            `);
            const guild = guildStmt.get(guildId);

            if (!guild) return null;

            // Get identity roles
            const identityRolesStmt = this.db.prepare(`
                SELECT role_type, role_id FROM identity_roles WHERE guild_id = ?
            `);
            const identityRoles = identityRolesStmt.all(guildId);

            // Get custom texts
            const customTextsStmt = this.db.prepare(`
                SELECT section, key_name, value FROM custom_texts WHERE guild_id = ?
            `);
            const customTexts = customTextsStmt.all(guildId);

            // Format the response
            const formattedConfig = {
                guildId: guild.guild_id,
                identityRoles: {},
                customTexts: {}
            };

            // Format identity roles
            identityRoles.forEach(role => {
                formattedConfig.identityRoles[role.role_type] = role.role_id;
            });

            // Format custom texts
            customTexts.forEach(text => {
                if (!formattedConfig.customTexts[text.section]) {
                    formattedConfig.customTexts[text.section] = {};
                }
                formattedConfig.customTexts[text.section][text.key_name] = text.value;
            });

            return formattedConfig;
        } catch (error) {
            console.error('❌ Error getting guild config:', error);
            return null;
        }
    }

    /**
     * Set guild configuration (simplified - only essential data)
     * @param {string} guildId 
     * @param {Object} config 
     */
    setGuildConfig(guildId, config) {
        if (!this.initialized) return false;

        try {
            this.db.transaction(() => {
                // Insert or update guild record
                const upsertGuildStmt = this.db.prepare(`
                    INSERT INTO guilds (guild_id, updated_at)
                    VALUES (?, CURRENT_TIMESTAMP)
                    ON CONFLICT(guild_id) DO UPDATE SET
                        updated_at = CURRENT_TIMESTAMP
                `);
                upsertGuildStmt.run(guildId);

                // Handle identity roles
                if (config.identityRoles) {
                    // Delete existing identity roles
                    const deleteRolesStmt = this.db.prepare(`
                        DELETE FROM identity_roles WHERE guild_id = ?
                    `);
                    deleteRolesStmt.run(guildId);

                    // Insert new identity roles
                    const insertRoleStmt = this.db.prepare(`
                        INSERT INTO identity_roles (guild_id, role_type, role_id)
                        VALUES (?, ?, ?)
                    `);

                    Object.entries(config.identityRoles).forEach(([roleType, roleId]) => {
                        if (roleId) {
                            insertRoleStmt.run(guildId, roleType, roleId);
                        }
                    });
                }

                // Handle custom texts
                if (config.customTexts) {
                    // Delete existing custom texts
                    const deleteTextsStmt = this.db.prepare(`
                        DELETE FROM custom_texts WHERE guild_id = ?
                    `);
                    deleteTextsStmt.run(guildId);

                    // Insert new custom texts
                    const insertTextStmt = this.db.prepare(`
                        INSERT INTO custom_texts (guild_id, section, key_name, value)
                        VALUES (?, ?, ?, ?)
                    `);

                    Object.entries(config.customTexts).forEach(([section, sectionTexts]) => {
                        Object.entries(sectionTexts).forEach(([key, value]) => {
                            if (value) {
                                insertTextStmt.run(guildId, section, key, value);
                            }
                        });
                    });
                }
            })();

            return true;
        } catch (error) {
            console.error('❌ Error setting guild config:', error);
            return false;
        }
    }

    /**
     * Get a specific config value from guild_configs or custom_texts
     * @param {string} guildId 
     * @param {string} key 
     * @returns {string|null}
     */
    getConfigValue(guildId, key) {
        if (!this.initialized) return null;

        try {
            // First try to get from guild_configs table
            const configColumns = [
                'moderation_channel_id', 'support_channel_id', 'doubts_channel_id',
                'announcements_channel_id', 'staff_role_id', 'moderator_role_id',
                'feedback_url', 'guidelines_url'
            ];
            
            if (configColumns.includes(key)) {
                const stmt = this.db.prepare(`
                    SELECT ${key} FROM guild_configs WHERE guild_id = ?
                `);
                const result = stmt.get(guildId);
                return result ? result[key] : null;
            } else {
                // Try to get from custom_texts table
                const stmt = this.db.prepare(`
                    SELECT value FROM custom_texts 
                    WHERE guild_id = ? AND key_name = ?
                `);
                const result = stmt.get(guildId, key);
                return result ? result.value : null;
            }
        } catch (error) {
            console.error('❌ Error getting config value:', error);
            return null;
        }
    }

    /**
     * Set a specific config value in guild_configs or custom_texts
     * @param {string} guildId 
     * @param {string} key 
     * @param {string} value 
     */
    setConfigValue(guildId, key, value) {
        if (!this.initialized) return false;

        try {
            // First ensure guild config exists
            const existingConfig = this.getGuildConfig(guildId);
            if (!existingConfig) {
                // Create basic config if it doesn't exist
                const basicConfig = { moderationChannelId: 'default' };
                this.setGuildConfig(guildId, basicConfig);
            }

            // Check if it's a standard config column
            const configColumns = [
                'moderation_channel_id', 'support_channel_id', 'doubts_channel_id',
                'announcements_channel_id', 'staff_role_id', 'moderator_role_id',
                'feedback_url', 'guidelines_url'
            ];
            
            if (configColumns.includes(key)) {
                // Update in guild_configs table
                const stmt = this.db.prepare(`
                    UPDATE guild_configs SET ${key} = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE guild_id = ?
                `);
                const result = stmt.run(value, guildId);
                return result.changes > 0;
            } else {
                // Store in custom_texts table
                const stmt = this.db.prepare(`
                    INSERT OR REPLACE INTO custom_texts (guild_id, section, key_name, value, updated_at)
                    VALUES (?, 'config', ?, ?, CURRENT_TIMESTAMP)
                `);
                const result = stmt.run(guildId, key, value);
                return result.changes > 0;
            }
        } catch (error) {
            console.error('❌ Error setting config value:', error);
            return false;
        }
    }

    /**
     * Get courses for a guild
     * @param {string} guildId 
     * @returns {Array}
     */
    getCourses(guildId) {
        if (!this.initialized) return [];

        try {
            const stmt = this.db.prepare(`
                SELECT * FROM courses WHERE guild_id = ? AND is_active = TRUE
                ORDER BY created_at DESC
            `);
            return stmt.all(guildId);
        } catch (error) {
            console.error('❌ Error getting courses:', error);
            return [];
        }
    }

    /**
     * Add a course
     * @param {string} guildId 
     * @param {Object} courseData 
     * @returns {number|null} Course ID
     */
    addCourse(guildId, courseData) {
        if (!this.initialized) return null;

        try {
            const stmt = this.db.prepare(`
                INSERT INTO courses (
                    guild_id, course_name, description, teacher_id, 
                    channel_id, role_id, max_students
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            const result = stmt.run(
                guildId,
                courseData.courseName,
                courseData.description || null,
                courseData.teacherId || null,
                courseData.channelId || null,
                courseData.roleId || null,
                courseData.maxStudents || 0
            );

            return result.lastInsertRowid;
        } catch (error) {
            console.error('❌ Error adding course:', error);
            return null;
        }
    }

    /**
     * Get reminders for a guild
     * @param {string} guildId 
     * @returns {Array}
     */
    getReminders(guildId) {
        if (!this.initialized) return [];

        try {
            const stmt = this.db.prepare(`
                SELECT * FROM reminders 
                WHERE guild_id = ? AND is_sent = FALSE
                ORDER BY scheduled_time ASC
            `);
            return stmt.all(guildId);
        } catch (error) {
            console.error('❌ Error getting reminders:', error);
            return [];
        }
    }

    /**
     * Add a reminder
     * @param {string} guildId 
     * @param {Object} reminderData 
     * @returns {number|null} Reminder ID
     */
    addReminder(guildId, reminderData) {
        if (!this.initialized) return null;

        try {
            const stmt = this.db.prepare(`
                INSERT INTO reminders (
                    guild_id, channel_id, user_id, message, 
                    scheduled_time, is_recurring, recurrence_pattern
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            const result = stmt.run(
                guildId,
                reminderData.channelId,
                reminderData.userId,
                reminderData.message,
                reminderData.scheduledTime,
                reminderData.isRecurring ? 1 : 0,
                reminderData.recurrencePattern || null
            );

            return result.lastInsertRowid;
        } catch (error) {
            console.error('❌ Error adding reminder:', error);
            return null;
        }
    }

    /**
     * Mark reminder as sent
     * @param {number} reminderId 
     */
    markReminderSent(reminderId) {
        if (!this.initialized) return false;

        try {
            const stmt = this.db.prepare(`
                UPDATE reminders SET is_sent = TRUE WHERE id = ?
            `);
            stmt.run(reminderId);
            return true;
        } catch (error) {
            console.error('❌ Error marking reminder as sent:', error);
            return false;
        }
    }

    /**
     * Get educational commission by code
     * @param {string} guildId 
     * @param {string} commissionCode 
     * @returns {Object|null}
     */
    getEducationalCommission(guildId, commissionCode) {
        if (!this.initialized) return null;

        try {
            const stmt = this.db.prepare(`
                SELECT * FROM educational_commissions 
                WHERE guild_id = ? AND commission_code = ?
            `);
            return stmt.get(guildId, commissionCode);
        } catch (error) {
            console.error('❌ Error getting educational commission:', error);
            return null;
        }
    }

    /**
     * Get all educational commissions for a guild
     * @param {string} guildId 
     * @returns {Array}
     */
    getEducationalCommissions(guildId) {
        if (!this.initialized) return [];

        try {
            const stmt = this.db.prepare(`
                SELECT * FROM educational_commissions 
                WHERE guild_id = ? 
                ORDER BY course_code, commission_code
            `);
            return stmt.all(guildId);
        } catch (error) {
            console.error('❌ Error getting educational commissions:', error);
            return [];
        }
    }

    /**
     * Add educational commission
     * @param {string} guildId 
     * @param {Object} commissionData 
     * @returns {number|null} Commission ID
     */
    addEducationalCommission(guildId, commissionData) {
        if (!this.initialized) return null;

        try {
            const stmt = this.db.prepare(`
                INSERT INTO educational_commissions (
                    guild_id, commission_code, course_code, course_name, shift, number,
                    role_id, text_channel_id, notifications_channel_id, chat_channel_id, 
                    voice_channel_id, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const result = stmt.run(
                guildId,
                commissionData.commissionCode,
                commissionData.courseCode,
                commissionData.courseName,
                commissionData.shift || 'G',
                commissionData.number,
                commissionData.roleId,
                commissionData.textChannelId,
                commissionData.notificationsChannelId,
                commissionData.chatChannelId,
                commissionData.voiceChannelId,
                commissionData.createdBy
            );

            return result.lastInsertRowid;
        } catch (error) {
            console.error('❌ Error adding educational commission:', error);
            return null;
        }
    }

    /**
     * Update educational commission
     * @param {string} guildId 
     * @param {string} commissionCode 
     * @param {Object} commissionData 
     * @returns {boolean}
     */
    updateEducationalCommission(guildId, commissionCode, commissionData) {
        if (!this.initialized) return false;

        try {
            const stmt = this.db.prepare(`
                UPDATE educational_commissions SET
                    course_name = ?,
                    role_id = ?,
                    text_channel_id = ?,
                    notifications_channel_id = ?,
                    chat_channel_id = ?,
                    voice_channel_id = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE guild_id = ? AND commission_code = ?
            `);

            const result = stmt.run(
                commissionData.courseName,
                commissionData.roleId,
                commissionData.textChannelId,
                commissionData.notificationsChannelId,
                commissionData.chatChannelId,
                commissionData.voiceChannelId,
                guildId,
                commissionCode
            );

            return result.changes > 0;
        } catch (error) {
            console.error('❌ Error updating educational commission:', error);
            return false;
        }
    }

    /**
     * Delete educational commission
     * @param {string} guildId 
     * @param {string} commissionCode 
     * @returns {boolean}
     */
    deleteEducationalCommission(guildId, commissionCode) {
        if (!this.initialized) return false;

        try {
            const stmt = this.db.prepare(`
                DELETE FROM educational_commissions 
                WHERE guild_id = ? AND commission_code = ?
            `);

            const result = stmt.run(guildId, commissionCode);
            return result.changes > 0;
        } catch (error) {
            console.error('❌ Error deleting educational commission:', error);
            return false;
        }
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            this.initialized = false;
            console.log('✅ Database connection closed');
        }
    }

    /**
     * Backup database
     * @param {string} backupPath 
     */
    backup(backupPath) {
        if (!this.initialized || !this.db) return false;

        try {
            // Validate backupPath
            if (typeof backupPath !== 'string') {
                console.error('❌ Backup path must be a string, got:', typeof backupPath);
                return false;
            }

            // Ensure database is open
            if (!this.db.open) {
                console.error('❌ Database is not open');
                return false;
            }

            // Use the correct backup method
            this.db.backup(backupPath);
            console.log(`✅ Database backed up to ${backupPath}`);
            return true;
        } catch (error) {
            console.error('❌ Database backup failed:', error);
            return false;
        }
    }
}

module.exports = DatabaseManager;
