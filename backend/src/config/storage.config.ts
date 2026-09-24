import { registerAs } from '@nestjs/config';

export type StorageDriver = 'local' | 's3';

export interface StorageConfig {
  driver: StorageDriver;
  localPath: string;
  maxFileSizeMb: number;
  allowedMimeTypes: string[];
  s3: {
    endpoint: string;
    region: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
    forcePathStyle: boolean;
  };
  import: {
    maxRows: number;
    syncThreshold: number;
  };
}

export const storageConfig = registerAs(
  'storage',
  (): StorageConfig => ({
    driver: (process.env.STORAGE_DRIVER as StorageDriver) ?? 'local',
    localPath: process.env.STORAGE_LOCAL_PATH ?? './storage',
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? '10', 10),
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES ?? '')
      .split(',')
      .map((mime) => mime.trim())
      .filter((mime) => mime.length > 0),
    s3: {
      endpoint: process.env.S3_ENDPOINT ?? '',
      region: process.env.S3_REGION ?? '',
      bucket: process.env.S3_BUCKET ?? '',
      accessKey: process.env.S3_ACCESS_KEY ?? '',
      secretKey: process.env.S3_SECRET_KEY ?? '',
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
    },
    import: {
      maxRows: parseInt(process.env.IMPORT_MAX_ROWS ?? '2000', 10),
      syncThreshold: parseInt(process.env.IMPORT_SYNC_THRESHOLD ?? '500', 10),
    },
  }),
);