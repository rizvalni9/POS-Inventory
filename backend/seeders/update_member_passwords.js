const dotenv = require('dotenv');
dotenv.config();

const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { Member } = require('../models');

async function updateMemberPasswords() {
  try {
    console.log('[Script] Connecting to database...');
    await sequelize.authenticate();
    console.log('[Script] Synchronizing Member model with database (adding password_hash column if not exists)...');
    
    // Add password_hash column to members table if not exists
    await sequelize.query(`
      ALTER TABLE members ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL AFTER joined_date;
    `).catch(err => {
      // In MySQL < 8.0, IF NOT EXISTS might not be supported in ALTER TABLE, so try standard ADD COLUMN
      return sequelize.query(`ALTER TABLE members ADD COLUMN password_hash VARCHAR(255) NULL AFTER joined_date;`).catch(() => {});
    });

    const defaultPassword = '123456';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(defaultPassword, salt);

    console.log('[Script] Updating all existing members with default password "123456"...');
    const [affectedRows] = await sequelize.query(`
      UPDATE members SET password_hash = :hash WHERE password_hash IS NULL OR password_hash = '';
    `, {
      replacements: { hash }
    });

    console.log(`[Script] Success! Updated ${affectedRows.affectedRows || affectedRows} members with initial password.`);
    
    const members = await Member.findAll({ attributes: ['id', 'name', 'phone', 'member_code', 'tier', 'points'] });
    console.log('\n[Member Login Data]:');
    members.forEach(m => {
      console.log(`- Nama: ${m.name} | No. HP: ${m.phone} | Kode: ${m.member_code} | Password: ${defaultPassword}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('[Script Error]:', error);
    process.exit(1);
  }
}

updateMemberPasswords();

