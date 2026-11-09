import crypto from 'node:crypto';

export const hash = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
