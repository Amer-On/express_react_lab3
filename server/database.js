import {createPool} from "mysql2/promise";

import {config} from "dotenv";
config()

// Creating pool to connect to database
export const pool = createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
})