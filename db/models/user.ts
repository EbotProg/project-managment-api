import { EnumDataType, Optional } from "sequelize";
import { Table, Model, Column, DataType, CreatedAt, UpdatedAt, DeletedAt, Unique, Index, Validate, IsEmail, Length } from 'sequelize-typescript';

interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  creationDate?: Date;
  updatedOn?: Date;
  deletionDate?: Date;
}


interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}


@Table({
  tableName: "user"
})
export default class User extends Model<UserAttributes, UserCreationAttributes> {
  
  
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  firstName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  lastName!: string;

  @Column({
    type: DataType.ENUM('0', '1', '2'),
    allowNull: false
  })
  userType!: string;
  
  @IsEmail
  @Unique
  @Column({
    type: DataType.STRING,
    
  })
  email!: string;
  
  @Length({msg: "password must be at least 8 characters long and at most 12 characters", min: 8})
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password?: string;

  @CreatedAt
  creationDate?: Date;

  @UpdatedAt
  updatedOn?: Date;

  @DeletedAt
  deletionDate?: Date;

  
}