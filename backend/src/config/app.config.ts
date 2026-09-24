import { registerAs } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  name: string;
  url: string;
  frontendUrl: string;
  bcryptSaltRounds: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.APP_PORT ?? '3000', 10),
    name: process.env.APP_NAME ?? 'GRH-EMMN',
    url: process.env.APP_URL ?? 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS ?? '5', 10),
    lockoutDurationMinutes: parseInt(process.env.LOCKOUT_DURATION_MINUTES ?? '15', 10),
  }),
);