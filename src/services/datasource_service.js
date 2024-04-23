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
  database: process.env.DATABASE,
  synchronize: true,
  logging: true,
  foreignKeys: true,
  entities: getFilesInDirectory("../entity"),
  migrations: getFilesInDirectory("../migration"),
});

export default AppDataSource;
