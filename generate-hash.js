const bcrypt = require('bcryptjs');

bcrypt.hash('admin123', 10).then(hash => {
  console.log('Generated hash for admin123:');
  console.log(hash);
  console.log('');
  console.log('SQL command to insert admin user:');
  console.log(`INSERT INTO users (email, name, role, status, password_hash) VALUES ('admin@lawfirm.com', 'System Administrator', 'admin', 'approved', '${hash}') ON CONFLICT (email) DO UPDATE SET password_hash = '${hash}';`);
});
