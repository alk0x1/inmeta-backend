import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional().default('mock_access_key'),
  }),
  AWS_SECRET_ACCESS_KEY: Joi.string().when('NODE_ENV', {
    is: 'production', 
    then: Joi.required(),
    otherwise: Joi.optional().default('mock_secret_key'),
  }),
  AWS_S3_BUCKET: Joi.string().default('employee-documents-bucket'),
  ENV: Joi.string().valid('development', 'production', 'test').default('development'),
});