import { randomBytes } from 'node:crypto';

const secret = Buffer.from(randomBytes(32)).toString('hex');
let salt = Buffer.from(randomBytes(16)).toString('hex');

if (salt.length > 16) {
    salt = salt.substring(0, 16);
}

console.log(`TOKEN_SECRET="${secret}"`);
console.log(`TOKEN_SALT="${salt}"`);