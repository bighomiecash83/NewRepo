// create_admin_user.js
// Firebase Admin SDK script to create Freezzo with admin claim
// 
// Usage:
//   1. Download service account JSON from Firebase Console → Project Settings → Service Accounts
//   2. Save as ./serviceAccountKey.json in this directory
//   3. npm install firebase-admin
//   4. node create_admin_user.js

const admin = require('firebase-admin');
const fs = require('fs');

// Load service account key
const serviceAccountPath = './serviceAccountKey.json';
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ serviceAccountKey.json not found. Download from Firebase Console → Project Settings → Service Accounts');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createAdminUser() {
  const email = 'freezzo.dmf@gmail.com';
  const password = 'ChangeMeToSecurePassword123!';
  
  try {
    console.log(`Creating user: ${email}`);
    const user = await admin.auth().createUser({
      email,
      password,
      emailVerified: true,
      displayName: 'Freezzo'
    });
    
    console.log(`✓ User created with UID: ${user.uid}`);
    
    console.log(`Setting custom claims (role: admin)...`);
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
    
    console.log(`✓ Admin claim set`);
    console.log(`\n✅ Admin user ready:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   UID: ${user.uid}`);
    console.log(`\n⚠️  Share credentials securely with Freezzo`);
    
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`⚠️  User ${email} already exists`);
      try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
        console.log(`✓ Updated custom claims for existing user`);
      } catch (e) {
        console.error('Error updating claims:', e.message);
      }
    } else {
      console.error('❌ Error creating user:', error.message);
    }
    process.exit(1);
  }
}

createAdminUser();
