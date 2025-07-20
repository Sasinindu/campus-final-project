// src/config/index.ts
import dotenv from 'dotenv';

const environment = process.env.NODE_ENV || 'development';
const envFile = `.env.${environment}`;

dotenv.config({ path: envFile });

export default {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'mydatabase',
  },
};
