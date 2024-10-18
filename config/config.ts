import dotenv from 'dotenv';
dotenv.config({
  path: `${process.cwd()}/.env`
});
import checkEnvVarialbles from '../utils/checkEnvVarialbes';

checkEnvVarialbles();

const config = {
    env: process.env.NODE_ENV || "developement",
    port: parseInt(process.env.APP_PORT || '3000'),
    getDatabaseConfig: () => ({
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432")
    })
}
// const config = {
//   "development": {
//     "username": process.env.DB_USERNAME,
//     "password": process.env.DB_PASSWORD,
//     "database": process.env.DB_DATABASE,
//     "host": process.env.DB_HOST,
//     "port": Number(process.env.DB_PORT),
//   },
//   "test": {
//     "username": "root",
//     "password": null,
//     "database": "database_test",
//     "host": "127.0.0.1",
//     "dialect": "mysql"
//   },
//   "production": {
//     "username": "root",
//     "password": null,
//     "database": "database_production",
//     "host": "127.0.0.1",
//     "dialect": "mysql"
//   }
// }

export default config;