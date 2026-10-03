/**
 * Environment Variables Validation Module for Server Startup
 * Ensures critical environment variables are set and secure, especially in production.
 */

export function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production';

  const defaultSecretPatterns = [
    'your_super_secret',
    'pipippip_secret',
    'dev_mode',
    'secret',
    '123456',
    'change_in_production',
    'your_strong_random'
  ];

  if (isProduction) {
    const missingVars = [];

    if (!process.env.MONGODB_URI) missingVars.push('MONGODB_URI');
    if (!process.env.JWT_SECRET) missingVars.push('JWT_SECRET');
    if (!process.env.CLIENT_URL) missingVars.push('CLIENT_URL');

    if (missingVars.length > 0) {
      console.error(`\x1b[31m[FATAL ERROR] Production startup blocked! Missing required environment variable(s): ${missingVars.join(', ')}\x1b[0m`);
      process.exit(1);
    }

    const jwtSecret = process.env.JWT_SECRET.trim();
    const isWeakSecret = jwtSecret.length < 32 || defaultSecretPatterns.some(pattern => jwtSecret.toLowerCase().includes(pattern));

    if (isWeakSecret) {
      console.error(`\x1b[31m[FATAL ERROR] Production startup blocked! JWT_SECRET is insecure or a default placeholder. Must be at least 32 random characters.\x1b[0m`);
      process.exit(1);
    }
  } else {
    // Development mode warning
    if (!process.env.JWT_SECRET) {
      console.warn(`\x1b[33m[WARN] JWT_SECRET is not set in environment. Using development fallback secret.\x1b[0m`);
      process.env.JWT_SECRET = 'pipippip_secret_jwt_key_2026_dev_mode';
    }
    if (!process.env.MONGODB_URI) {
      console.warn(`\x1b[33m[WARN] MONGODB_URI is not set. Defaulting to mongodb://127.0.0.1:27017/pipippip_cabs\x1b[0m`);
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/pipippip_cabs';
    }
    if (!process.env.CLIENT_URL) {
      process.env.CLIENT_URL = 'http://localhost:5173';
    }
  }
}
