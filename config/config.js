import dotenv from 'dotenv'
import { join } from 'path'
import { fileURLToPath } from 'url';
import Joi from 'joi';

const __dirname = fileURLToPath(import.meta.url);
const envPath = join(__dirname, `../.env.${process.env.NODE_ENV}`);
dotenv.config({ path: envPath });

const envVarsSchema = Joi.object({
    NODE_ENV: Joi.string().valid('dev', 'prod').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    ACCESS_TOKEN_SECRET: Joi.string().trim().required().description('JWT secret key'),
    ACCESS_TOKEN_EXPIRY: Joi.string().trim().required().description('JWT time exp'),
}).unknown(); // allow unknown env variable

const { value: envVars, error } = envVarsSchema.validate(process.env);

if (error) throw new Error(`Config validation error: ${error.message}`);


export const config = {
    NODE_ENV: envVars.NODE_ENV,
    PORT: envVars.PORT,
    mongoose: {
        url: envVars.MONGODB_URL,
        options: {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    },
    jwt: {
        secret: envVars.ACCESS_TOKEN_SECRET,
        accessExpirationMinutes: envVars.ACCESS_TOKEN_EXPIRY,
        refreshExpirationDays: envVars.REFRESH_TOKEN_EXPIRY,
        resetPasswordExpirationMinutes: '5m'
    },
    email: {
        smtp: {
            host: envVars.SMTP_HOST,
            port: envVars.SMTP_PORT,
            auth: {
                user: envVars.SMTP_USERNAME,
                pass: envVars.SMTP_PASSWORD,
            },
        },
        from: envVars.EMAIL_FROM,
    },
}