// Encryption utility for sensitive code data
import { AES, enc } from 'crypto-js';

const ENCRYPTION_KEY = 'aura-paste-secure-key-2024';

// List of sensitive keywords that trigger encryption
const SENSITIVE_KEYWORDS = [
  'api_key', 'apikey', 'secret', 'password', 'token', 'private_key',
  'secret_key', 'access_key', 'auth_token', 'bearer', 'jwt',
  'database_url', 'db_password', 'mongodb', 'postgres', 'mysql',
  'aws_access', 'aws_secret', 'stripe_secret', 'paypal_secret',
  'google_api', 'facebook_app', 'twitter_api', 'github_token',
  'oauth_secret', 'client_secret', 'app_secret', 'webhook_secret'
];

export const containsSensitiveData = (content: string): boolean => {
  const lowerContent = content.toLowerCase();
  return SENSITIVE_KEYWORDS.some(keyword => 
    lowerContent.includes(keyword) || 
    lowerContent.includes(keyword.replace('_', '')) ||
    lowerContent.includes(keyword.replace('_', '-'))
  );
};

export const encryptSensitiveContent = (content: string): string => {
  try {
    if (!containsSensitiveData(content)) {
      return content;
    }
    
    const encrypted = AES.encrypt(content, ENCRYPTION_KEY).toString();
    return `[ENCRYPTED]${encrypted}[/ENCRYPTED]`;
  } catch (error) {
    console.warn('Encryption failed, storing as plain text:', error);
    return content;
  }
};

export const decryptContent = (content: string): string => {
  try {
    if (!content.startsWith('[ENCRYPTED]') || !content.endsWith('[/ENCRYPTED]')) {
      return content;
    }
    
    const encryptedData = content.slice(11, -12); // Remove markers
    const decrypted = AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return decrypted.toString(enc.Utf8);
  } catch (error) {
    console.warn('Decryption failed:', error);
    return content;
  }
};

export const isEncrypted = (content: string): boolean => {
  return content.startsWith('[ENCRYPTED]') && content.endsWith('[/ENCRYPTED]');
};