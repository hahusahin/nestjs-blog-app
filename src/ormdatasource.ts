import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: true,
    ca: fs
      .readFileSync(path.join(__dirname, '..', 'certs', 'ca.pem'))
      .toString(),
  },
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
};

export const AppDataSource = new DataSource(dataSourceOptions);

export default dataSourceOptions;
