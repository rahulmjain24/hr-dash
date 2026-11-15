import { plainToInstance } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  DB_HOST!: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  DB_PORT: number = 5432;

  @IsString()
  @IsNotEmpty()
  DB_USER!: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME!: string;

  @IsString()
  @IsNotEmpty()
  MINIO_ROOT_USER!: string;

  @IsString()
  @IsNotEmpty()
  MINIO_ROOT_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  AUTH_COOKIE_NAME!: string;

  // Base URL of the HR frontend, used to build links in emails
  @IsString()
  @IsOptional()
  FRONTEND_URL: string = 'http://localhost:3001';

  // SMTP is optional: without SMTP_HOST, emails are written to the server log
  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  SMTP_PORT: number = 587;

  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASSWORD?: string;

  @IsString()
  @IsOptional()
  MAIL_FROM: string = 'HR Portal <no-reply@localhost>';
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const details = errors
      .map((e) => `  - ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  return validated;
}
