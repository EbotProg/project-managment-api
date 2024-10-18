import config from '../../config/config';

import { Sequelize } from 'sequelize';
import 'pg';
import 'pg-hstore';
import sequelize from '../../config/database';
import User from './user';
import Project from './project';
// const sequelize: Sequelize = new Sequelize({...config.getDatabaseConfig(), dialect: 'postgres'})



async function connect() {
  try {
      sequelize.addModels([User, Project])
      await sequelize.authenticate();
      await sequelize.sync()
     
                    
      console.log('Connection has been established successfully')

  }catch(err) {
    console.error("Unable to connect to database", err)
  }
}

export { connect, sequelize };