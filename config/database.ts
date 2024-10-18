

import { Sequelize } from "sequelize-typescript";
import config from "./config"


const sequelize = new Sequelize({
    ...config.getDatabaseConfig(),
    dialect: "postgres",
    models: [__dirname + './db/models'], // or [Player, Team],
  });

export default sequelize;

