import crypto from 'crypto';

const header = { alg: 'HS256', typ: 'JWT' };
const payload = { iss: 'supabase-demo', role: 'service_role', exp: 1983812596 };
const secret = '64d4c0f2ded06dc3330cab4fd6853056ff0d086472dde4f4ca176a84105fd180';

const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
const data = encodedHeader + '.' + encodedPayload;
const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url');
const jwt = data + '.' + signature;

console.log(jwt);