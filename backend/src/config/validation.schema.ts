import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  APP_PORT: Joi.number().integer().min(1).max(65535).default(3000),
  APP_NAME: Joi.string().default('GRH-EMMN'),
  APP_URL: Joi.string().uri().default('http://localhost:3000'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().integer().min(1).max(65535).default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
  DB_SSL: Joi.boolean().default(false),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(4).max(15).default(12),
  MAX_LOGIN_ATTEMPTS: Joi.number().integer().min(1).default(5),
  LOCKOUT_DURATION_MINUTES: Joi.number().integer().min(1).default(15),

  STORAGE_DRIVER: Joi.string().valid('local', 's3').default('local'),
  STORAGE_LOCAL_PATH: Joi.string().default('./storage'),
  MAX_FILE_SIZE_MB: Joi.number().integer().min(1).default(10),
  ALLOWED_MIME_TYPES: Joi.string().required(),

  S3_ENDPOINT: Joi.string().allow('').optional(),
  S3_REGION: Joi.string().allow('').optional(),
  S3_BUCKET: Joi.string().allow('').optional(),
  S3_ACCESS_KEY: Joi.string().allow('').optional(),
  S3_SECRET_KEY: Joi.string().allow('').optional(),
  S3_FORCE_PATH_STYLE: Joi.boolean().default(true),

  IMPORT_MAX_ROWS: Joi.number().integer().min(1).default(2000),
  IMPORT_SYNC_THRESHOLD: Joi.number().integer().min(1).default(500),
}).unknown(true);