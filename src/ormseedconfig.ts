import { DataSource } from 'typeorm';
import dataSourceOptions from './ormdatasource';

const ormSeedConfig = {
  ...dataSourceOptions,
  migrations: [__dirname + '/seeds/*.ts'],
};

export default new DataSource(ormSeedConfig);
