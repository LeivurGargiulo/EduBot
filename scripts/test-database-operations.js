/**
 * Comprehensive Database Operations Test Script
 * Tests all database functionality and validates data integrity
 */

const DatabaseManager = require('../utils/databaseManager');
const path = require('path');
const fs = require('fs');

class DatabaseTester {
    constructor() {
        this.dbManager = new DatabaseManager();
        this.testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        };
        this.testGuildId = '123456789012345678';
    }

    /**
     * Log test result
     */
    logResult(testName, success, message = '', error = null) {
        this.testResults.total++;
        
        if (success) {
            this.testResults.passed++;
            console.log(`✅ ${testName}: ${message}`);
        } else {
            this.testResults.failed++;
            this.testResults.errors.push({ test: testName, message, error });
            console.log(`❌ ${testName}: ${message}`);
            if (error) {
                console.log(`   Error: ${error.message}`);
            }
        }
    }

    /**
     * Test database initialization
     */
    async testInitialization() {
        console.log('\n🔧 Testing Database Initialization...');
        
        try {
            const initialized = this.dbManager.initialize();
            this.logResult('Database Initialization', initialized, 'Database initialized successfully');
            
            if (initialized) {
                // Test database file exists
                const dbPath = path.join(__dirname, '..', 'data', 'bot.db');
                const fileExists = fs.existsSync(dbPath);
                this.logResult('Database File Exists', fileExists, 'Database file created');
                
                // Test file size
                if (fileExists) {
                    const stats = fs.statSync(dbPath);
                    const hasContent = stats.size > 0;
                    this.logResult('Database Has Content', hasContent, `Database size: ${stats.size} bytes`);
                }
            }
        } catch (error) {
            this.logResult('Database Initialization', false, 'Failed to initialize database', error);
        }
    }

    /**
     * Test guild configuration operations
     */
    async testGuildConfiguration() {
        console.log('\n📋 Testing Guild Configuration...');
        
        try {
            // Test setting basic configuration
            const basicConfig = {
                moderationChannelId: '111111111111111111',
                supportChannelId: '222222222222222222',
                staffRoleId: '333333333333333333',
                moderatorRoleId: '444444444444444444',
                feedbackUrl: 'https://example.com/feedback',
                guidelinesUrl: 'https://example.com/guidelines'
            };
            
            const setResult = this.dbManager.setGuildConfig(this.testGuildId, basicConfig);
            this.logResult('Set Basic Config', setResult, 'Basic configuration set successfully');
            
            // Test retrieving configuration
            const retrievedConfig = this.dbManager.getGuildConfig(this.testGuildId);
            const configRetrieved = !!retrievedConfig;
            this.logResult('Get Basic Config', configRetrieved, 'Configuration retrieved successfully');
            
            if (configRetrieved) {
                // Validate retrieved data
                const moderationChannelMatch = retrievedConfig.moderation_channel_id === basicConfig.moderationChannelId;
                this.logResult('Moderation Channel Match', moderationChannelMatch, 'Moderation channel ID matches');
                
                const supportChannelMatch = retrievedConfig.support_channel_id === basicConfig.supportChannelId;
                this.logResult('Support Channel Match', supportChannelMatch, 'Support channel ID matches');
                
                const staffRoleMatch = retrievedConfig.staff_role_id === basicConfig.staffRoleId;
                this.logResult('Staff Role Match', staffRoleMatch, 'Staff role ID matches');
            }
        } catch (error) {
            this.logResult('Guild Configuration', false, 'Failed to test guild configuration', error);
        }
    }

    /**
     * Test identity roles operations
     */
    async testIdentityRoles() {
        console.log('\n🎭 Testing Identity Roles...');
        
        try {
            const identityConfig = {
                moderationChannelId: '111111111111111111',
                identityRoles: {
                    'pronounEl': '555555555555555555',
                    'pronounElla': '666666666666666666',
                    'pronounElle': '777777777777777777',
                    'pronounThey': '888888888888888888'
                }
            };
            
            const setResult = this.dbManager.setGuildConfig(this.testGuildId, identityConfig);
            this.logResult('Set Identity Roles', setResult, 'Identity roles configuration set');
            
            const retrievedConfig = this.dbManager.getGuildConfig(this.testGuildId);
            const rolesRetrieved = !!retrievedConfig?.identityRoles;
            this.logResult('Get Identity Roles', rolesRetrieved, 'Identity roles retrieved');
            
            if (rolesRetrieved) {
                const rolesCount = Object.keys(retrievedConfig.identityRoles).length;
                const expectedCount = Object.keys(identityConfig.identityRoles).length;
                const countMatch = rolesCount === expectedCount;
                this.logResult('Identity Roles Count', countMatch, `Found ${rolesCount} roles (expected ${expectedCount})`);
                
                // Test specific role retrieval
                const pronounElExists = !!retrievedConfig.identityRoles['pronounEl'];
                this.logResult('Pronoun El Role', pronounElExists, 'Pronoun El role exists');
            }
        } catch (error) {
            this.logResult('Identity Roles', false, 'Failed to test identity roles', error);
        }
    }

    /**
     * Test verification configuration
     */
    async testVerificationConfig() {
        console.log('\n✅ Testing Verification Configuration...');
        
        try {
            const verificationConfig = {
                moderationChannelId: '111111111111111111',
                verification: {
                    enabled: true,
                    channelId: '999999999999999999',
                    roleId: '101010101010101010',
                    title: 'Verificación de Usuario',
                    description: 'Completa la verificación para acceder al servidor'
                }
            };
            
            const setResult = this.dbManager.setGuildConfig(this.testGuildId, verificationConfig);
            this.logResult('Set Verification Config', setResult, 'Verification configuration set');
            
            const retrievedConfig = this.dbManager.getGuildConfig(this.testGuildId);
            const verificationRetrieved = !!retrievedConfig?.verification;
            this.logResult('Get Verification Config', verificationRetrieved, 'Verification configuration retrieved');
            
            if (verificationRetrieved) {
                const enabledMatch = retrievedConfig.verification.enabled === verificationConfig.verification.enabled;
                this.logResult('Verification Enabled', enabledMatch, 'Verification enabled status matches');
                
                const channelMatch = retrievedConfig.verification.channel_id === verificationConfig.verification.channelId;
                this.logResult('Verification Channel', channelMatch, 'Verification channel ID matches');
                
                const titleMatch = retrievedConfig.verification.title === verificationConfig.verification.title;
                this.logResult('Verification Title', titleMatch, 'Verification title matches');
            }
        } catch (error) {
            this.logResult('Verification Config', false, 'Failed to test verification configuration', error);
        }
    }

    /**
     * Test custom texts operations
     */
    async testCustomTexts() {
        console.log('\n📝 Testing Custom Texts...');
        
        try {
            const customTextsConfig = {
                moderationChannelId: '111111111111111111',
                customTexts: {
                    'welcome': {
                        'title': '¡Bienvenido al servidor!',
                        'description': 'Esperamos que disfrutes tu estadía.',
                        'color': '#00ff00'
                    },
                    'rules': {
                        'title': 'Reglas del Servidor',
                        'description': 'Por favor, lee y sigue las reglas.',
                        'footer': 'Gracias por tu cooperación'
                    },
                    'support': {
                        'title': 'Sistema de Soporte',
                        'description': '¿Necesitas ayuda? Crea un ticket.'
                    }
                }
            };
            
            const setResult = this.dbManager.setGuildConfig(this.testGuildId, customTextsConfig);
            this.logResult('Set Custom Texts', setResult, 'Custom texts configuration set');
            
            const retrievedConfig = this.dbManager.getGuildConfig(this.testGuildId);
            const textsRetrieved = !!retrievedConfig?.customTexts;
            this.logResult('Get Custom Texts', textsRetrieved, 'Custom texts retrieved');
            
            if (textsRetrieved) {
                const welcomeTexts = retrievedConfig.customTexts['welcome'];
                const welcomeExists = !!welcomeTexts;
                this.logResult('Welcome Texts Exist', welcomeExists, 'Welcome custom texts exist');
                
                if (welcomeExists) {
                    const titleMatch = welcomeTexts['title'] === customTextsConfig.customTexts.welcome.title;
                    this.logResult('Welcome Title Match', titleMatch, 'Welcome title matches');
                    
                    const descriptionMatch = welcomeTexts['description'] === customTextsConfig.customTexts.welcome.description;
                    this.logResult('Welcome Description Match', descriptionMatch, 'Welcome description matches');
                }
                
                const totalTexts = Object.values(retrievedConfig.customTexts)
                    .reduce((total, section) => total + Object.keys(section).length, 0);
                const expectedTotal = Object.values(customTextsConfig.customTexts)
                    .reduce((total, section) => total + Object.keys(section).length, 0);
                const totalMatch = totalTexts === expectedTotal;
                this.logResult('Total Texts Count', totalMatch, `Found ${totalTexts} texts (expected ${expectedTotal})`);
            }
        } catch (error) {
            this.logResult('Custom Texts', false, 'Failed to test custom texts', error);
        }
    }

    /**
     * Test courses operations
     */
    async testCourses() {
        console.log('\n📚 Testing Courses...');
        
        try {
            // Ensure guild config exists first
            const basicConfig = { moderationChannelId: '111111111111111111' };
            this.dbManager.setGuildConfig(this.testGuildId, basicConfig);
            
            // Test adding courses
            const courseData1 = {
                courseName: 'Maquetado Web Básico',
                description: 'Curso introductorio de HTML y CSS',
                teacherId: '888888888888888888',
                channelId: '999999999999999999',
                roleId: '101010101010101010',
                maxStudents: 25
            };
            
            const courseId1 = this.dbManager.addCourse(this.testGuildId, courseData1);
            const course1Added = !!courseId1;
            this.logResult('Add Course 1', course1Added, `Course added with ID: ${courseId1}`);
            
            const courseData2 = {
                courseName: 'JavaScript Avanzado',
                description: 'Curso avanzado de JavaScript',
                teacherId: '999999999999999999',
                channelId: '111111111111111112',
                roleId: '111111111111111113',
                maxStudents: 20
            };
            
            const courseId2 = this.dbManager.addCourse(this.testGuildId, courseData2);
            const course2Added = !!courseId2;
            this.logResult('Add Course 2', course2Added, `Course added with ID: ${courseId2}`);
            
            // Test retrieving courses
            const courses = this.dbManager.getCourses(this.testGuildId);
            const coursesRetrieved = Array.isArray(courses);
            this.logResult('Get Courses', coursesRetrieved, `Retrieved ${courses.length} courses`);
            
            if (coursesRetrieved && courses.length > 0) {
                const courseNames = courses.map(c => c.course_name);
                const hasWebCourse = courseNames.includes('Maquetado Web Básico');
                this.logResult('Web Course Exists', hasWebCourse, 'Maquetado Web Básico course found');
                
                const hasJsCourse = courseNames.includes('JavaScript Avanzado');
                this.logResult('JS Course Exists', hasJsCourse, 'JavaScript Avanzado course found');
                
                // Test course data integrity
                const webCourse = courses.find(c => c.course_name === 'Maquetado Web Básico');
                if (webCourse) {
                    const descriptionMatch = webCourse.description === courseData1.description;
                    this.logResult('Course Description Match', descriptionMatch, 'Course description matches');
                    
                    const maxStudentsMatch = webCourse.max_students === courseData1.maxStudents;
                    this.logResult('Course Max Students Match', maxStudentsMatch, 'Course max students matches');
                }
            }
        } catch (error) {
            this.logResult('Courses', false, 'Failed to test courses', error);
        }
    }

    /**
     * Test reminders operations
     */
    async testReminders() {
        console.log('\n⏰ Testing Reminders...');
        
        try {
            // Ensure guild config exists first
            const basicConfig = { moderationChannelId: '111111111111111111' };
            this.dbManager.setGuildConfig(this.testGuildId, basicConfig);
            
            // Test adding reminders
            const reminderData1 = {
                channelId: '111111111111111111',
                userId: '222222222222222222',
                message: 'Recordatorio de clase de mañana',
                scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
                isRecurring: false
            };
            
            const reminderId1 = this.dbManager.addReminder(this.testGuildId, reminderData1);
            const reminder1Added = !!reminderId1;
            this.logResult('Add Reminder 1', reminder1Added, `Reminder added with ID: ${reminderId1}`);
            
            const reminderData2 = {
                channelId: '111111111111111111',
                userId: '333333333333333333',
                message: 'Recordatorio semanal de tarea',
                scheduledTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                isRecurring: true,
                recurrencePattern: 'weekly'
            };
            
            const reminderId2 = this.dbManager.addReminder(this.testGuildId, reminderData2);
            const reminder2Added = !!reminderId2;
            this.logResult('Add Reminder 2', reminder2Added, `Reminder added with ID: ${reminderId2}`);
            
            // Test retrieving reminders
            const reminders = this.dbManager.getReminders(this.testGuildId);
            const remindersRetrieved = Array.isArray(reminders);
            this.logResult('Get Reminders', remindersRetrieved, `Retrieved ${reminders.length} reminders`);
            
            if (remindersRetrieved && reminders.length > 0) {
                const reminderMessages = reminders.map(r => r.message);
                const hasClassReminder = reminderMessages.includes('Recordatorio de clase de mañana');
                this.logResult('Class Reminder Exists', hasClassReminder, 'Class reminder found');
                
                const hasWeeklyReminder = reminderMessages.includes('Recordatorio semanal de tarea');
                this.logResult('Weekly Reminder Exists', hasWeeklyReminder, 'Weekly reminder found');
                
                // Test reminder data integrity
                const classReminder = reminders.find(r => r.message === 'Recordatorio de clase de mañana');
                if (classReminder) {
                    const isRecurringMatch = classReminder.is_recurring === 0; // false
                    this.logResult('Class Reminder Recurring', isRecurringMatch, 'Class reminder is not recurring');
                }
                
                const weeklyReminder = reminders.find(r => r.message === 'Recordatorio semanal de tarea');
                if (weeklyReminder) {
                    const isRecurringMatch = weeklyReminder.is_recurring === 1; // true
                    this.logResult('Weekly Reminder Recurring', isRecurringMatch, 'Weekly reminder is recurring');
                }
            }
        } catch (error) {
            this.logResult('Reminders', false, 'Failed to test reminders', error);
        }
    }

    /**
     * Test specific config value operations
     */
    async testConfigValues() {
        console.log('\n🔧 Testing Config Values...');
        
        try {
            // Test setting specific config values
            const setResult1 = this.dbManager.setConfigValue(this.testGuildId, 'test_key_1', 'test_value_1');
            this.logResult('Set Config Value 1', setResult1, 'Config value 1 set successfully');
            
            const setResult2 = this.dbManager.setConfigValue(this.testGuildId, 'test_key_2', 'test_value_2');
            this.logResult('Set Config Value 2', setResult2, 'Config value 2 set successfully');
            
            // Test retrieving specific config values
            const value1 = this.dbManager.getConfigValue(this.testGuildId, 'test_key_1');
            const value1Retrieved = value1 === 'test_value_1';
            this.logResult('Get Config Value 1', value1Retrieved, `Retrieved value: ${value1}`);
            
            const value2 = this.dbManager.getConfigValue(this.testGuildId, 'test_key_2');
            const value2Retrieved = value2 === 'test_value_2';
            this.logResult('Get Config Value 2', value2Retrieved, `Retrieved value: ${value2}`);
            
            // Test non-existent value
            const nonExistentValue = this.dbManager.getConfigValue(this.testGuildId, 'non_existent_key');
            const nonExistentHandled = nonExistentValue === null;
            this.logResult('Non-existent Config Value', nonExistentHandled, 'Non-existent value returns null');
        } catch (error) {
            this.logResult('Config Values', false, 'Failed to test config values', error);
        }
    }

    /**
     * Test database backup functionality
     */
    async testBackup() {
        console.log('\n💾 Testing Database Backup...');
        
        try {
            const backupPath = path.join(__dirname, '..', 'data', 'test_backup.db');
            
            const backupResult = this.dbManager.backup(backupPath);
            this.logResult('Database Backup', backupResult, 'Database backup created successfully');
            
            if (backupResult) {
                const backupExists = fs.existsSync(backupPath);
                this.logResult('Backup File Exists', backupExists, 'Backup file created');
                
                if (backupExists) {
                    const backupStats = fs.statSync(backupPath);
                    const backupHasContent = backupStats.size > 0;
                    this.logResult('Backup Has Content', backupHasContent, `Backup size: ${backupStats.size} bytes`);
                    
                    // Clean up test backup
                    fs.unlinkSync(backupPath);
                    console.log('🗑️ Test backup file cleaned up');
                }
            }
        } catch (error) {
            this.logResult('Database Backup', false, 'Failed to test database backup', error);
        }
    }

    /**
     * Test database integrity
     */
    async testDatabaseIntegrity() {
        console.log('\n🔍 Testing Database Integrity...');
        
        try {
            // Test that all tables exist and are accessible
            const testQueries = [
                'SELECT COUNT(*) as count FROM guild_configs',
                'SELECT COUNT(*) as count FROM identity_roles',
                'SELECT COUNT(*) as count FROM verification_configs',
                'SELECT COUNT(*) as count FROM custom_texts',
                'SELECT COUNT(*) as count FROM courses',
                'SELECT COUNT(*) as count FROM course_enrollments',
                'SELECT COUNT(*) as count FROM commissions',
                'SELECT COUNT(*) as count FROM reminders'
            ];
            
            let allTablesAccessible = true;
            
            for (const query of testQueries) {
                try {
                    const result = this.dbManager.db.prepare(query).get();
                    const tableName = query.match(/FROM (\w+)/)[1];
                    this.logResult(`Table ${tableName} Accessible`, true, `Count: ${result.count}`);
                } catch (error) {
                    allTablesAccessible = false;
                    this.logResult(`Table Access`, false, `Failed to access table`, error);
                }
            }
            
            this.logResult('All Tables Accessible', allTablesAccessible, 'All database tables are accessible');
            
        } catch (error) {
            this.logResult('Database Integrity', false, 'Failed to test database integrity', error);
        }
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 Starting Comprehensive Database Tests');
        console.log('========================================');
        
        await this.testInitialization();
        await this.testGuildConfiguration();
        await this.testIdentityRoles();
        await this.testVerificationConfig();
        await this.testCustomTexts();
        await this.testCourses();
        await this.testReminders();
        await this.testConfigValues();
        await this.testBackup();
        await this.testDatabaseIntegrity();
        
        this.showResults();
    }

    /**
     * Show test results summary
     */
    showResults() {
        console.log('\n📊 Test Results Summary');
        console.log('======================');
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(2)}%`);
        
        if (this.testResults.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.errors.forEach(error => {
                console.log(`  • ${error.test}: ${error.message}`);
            });
        }
        
        if (this.testResults.failed === 0) {
            console.log('\n🎉 All database tests passed! Database is working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Please check the errors above.');
        }
        
        // Close database connection safely
        try {
            this.dbManager.close();
        } catch (error) {
            console.log('⚠️ Error closing database connection:', error.message);
        }
    }
}

// Run the tests
const tester = new DatabaseTester();
tester.runAllTests().catch(console.error);
