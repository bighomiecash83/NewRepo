const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'replace_with_secret';
const token = jwt.sign({ role: 'Admin', sub: 'test-admin' }, secret, { issuer: 'dmf.local', audience: 'dmf.clients', expiresIn: '8h' });
console.log('Admin JWT Token:');
console.log(token);
