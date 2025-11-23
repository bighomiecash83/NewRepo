// Dev-only JWT generator for Admin pricing access
import jwt from 'jsonwebtoken';

const key = process.env.JWT_DEV_KEY || 'supersecret_long_key_replace_me';
const token = jwt.sign(
  { role: 'Admin', sub: 'test-admin' },
  key,
  { issuer: 'dmf.local', audience: 'dmf.clients', expiresIn: '8h' }
);
console.log(token);
