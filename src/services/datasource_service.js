import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { fileURLToPath } from "url";
import { dirname } from "path";

import glob from "glob";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFilesInDirectory = (directory) => {
  return glob.sync(`${__dirname}/${directory}/**/*.js`);
};

const AppDataSource = new DataSource({
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  foreignKeys: true,
  entities: getFilesInDirectory("../entity"),
  migrations: getFilesInDirectory("../migration"),
  schema: "public",
});

export default AppDataSource;
