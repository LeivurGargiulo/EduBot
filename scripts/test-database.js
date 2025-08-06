/**
 * Database Test Script
 * Tests the database functionality for the Discord bot
 */

const DatabaseManager = require('../utils/databaseManager');

async function testDatabase() {
    console.log('🧪 Testing Database Functionality');
    console.log('================================');
    
    const dbManager = new DatabaseManager();
    
    try {
        // Initialize database
        console.log('\n1. Initializing database...');
        const initialized = dbManager.initialize();
        if (!initialized) {
            console.error('❌ Failed to initialize database');
            return;
        }
        console.log('✅ Database initialized successfully');
        
        // Test guild configuration
        console.log('\n2. Testing guild configuration...');
        const testGuildId = '123456789012345678';
        
        // Set test configuration
        const testConfig = {
            moderationChannelId: '111111111111111111',
            supportChannelId: '222222222222222222',
            staffRoleId: '333333333333333333',
            identityRoles: {
                'pronounEl': '444444444444444444',
                'pronounElla': '555555555555555555'
            },
            verification: {
                enabled: true,
                channelId: '666666666666666666',
                roleId: '777777777777777777',
                title: 'Test Verification',
                description: 'Test verification description'
            },
            customTexts: {
                'welcome': {
                    'title': 'Welcome to our server!',
                    'description': 'We hope you enjoy your stay.'
                }
            }
        };
        
        const setResult = dbManager.setGuildConfig(testGuildId, testConfig);
        console.log('✅ Test configuration set:', setResult ? 'Success' : 'Failed');
        
        // Get configuration
        const retrievedConfig = dbManager.getGuildConfig(testGuildId);
        console.log('✅ Configuration retrieved:', retrievedConfig ? 'Success' : 'Failed');
        
        if (retrievedConfig) {
            console.log('  - Moderation channel:', retrievedConfig.moderation_channel_id);
            console.log('  - Support channel:', retrievedConfig.support_channel_id);
            console.log('  - Identity roles count:', Object.keys(retrievedConfig.identityRoles).length);
            console.log('  - Verification enabled:', retrievedConfig.verification.enabled);
            console.log('  - Custom texts count:', Object.keys(retrievedConfig.customTexts).length);
        }
        
        // Test courses
        console.log('\n3. Testing courses...');
        const courseData = {
            courseName: 'Test Course',
            description: 'A test course for database testing',
            teacherId: '888888888888888888',
            channelId: '999999999999999999',
            roleId: '101010101010101010',
            maxStudents: 25
        };
        
        // Ensure guild config exists first (for foreign key constraint)
        const basicConfig = {
            moderationChannelId: '111111111111111111',
            supportChannelId: '222222222222222222'
        };
        dbManager.setGuildConfig(testGuildId, basicConfig);
        
        const courseId = dbManager.addCourse(testGuildId, courseData);
        console.log('✅ Course added:', courseId ? `ID: ${courseId}` : 'Failed');
        
        const courses = dbManager.getCourses(testGuildId);
        console.log('✅ Courses retrieved:', courses.length, 'courses found');
        
        // Test reminders
        console.log('\n4. Testing reminders...');
        const reminderData = {
            channelId: '111111111111111111',
            userId: '222222222222222222',
            message: 'Test reminder message',
            scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
            isRecurring: false
        };
        
        const reminderId = dbManager.addReminder(testGuildId, reminderData);
        console.log('✅ Reminder added:', reminderId ? `ID: ${reminderId}` : 'Failed');
        
        const reminders = dbManager.getReminders(testGuildId);
        console.log('✅ Reminders retrieved:', reminders.length, 'reminders found');
        
        // Test specific config values
        console.log('\n5. Testing specific config values...');
        const moderationChannel = dbManager.getConfigValue(testGuildId, 'moderation_channel_id');
        console.log('✅ Moderation channel ID:', moderationChannel);
        
        const setResult2 = dbManager.setConfigValue(testGuildId, 'test_key', 'test_value');
        console.log('✅ Set test config value:', setResult2 ? 'Success' : 'Failed');
        
        const testValue = dbManager.getConfigValue(testGuildId, 'test_key');
        console.log('✅ Retrieved test config value:', testValue);
        
        // Test database backup
        console.log('\n6. Testing database backup...');
        const path = require('path');
        const backupPath = path.join(__dirname, '..', 'data', 'test_backup.db');
        const backupResult = dbManager.backup(backupPath);
        console.log('✅ Database backup:', backupResult ? 'Success' : 'Failed');
        
        if (backupResult) {
            const fs = require('fs');
            if (fs.existsSync(backupPath)) {
                fs.unlinkSync(backupPath);
                console.log('✅ Test backup file cleaned up');
            }
        }
        
        console.log('\n🎉 All database tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Database test failed:', error);
    } finally {
        // Close database connection
        console.log('\n🔒 Database connection closed');
    }
}

// Run the test
testDatabase().catch(console.error);
