import { EnumDataType, Optional } from "sequelize";
import { Table, Model, Column, DataType, CreatedAt, UpdatedAt, DeletedAt, Unique, Index, Validate, IsEmail, Length, ForeignKey, BelongsTo, Default } from 'sequelize-typescript';
import User from "./user";

interface ProjectAttributes {
  id: number;
  name: string;
  description: string;
  creatorId: number;
  createdBy?: User;
  handlerId: number;
  handledBy?: User;
  deadline?: Date;
  status?: string;
  creationDate?: Date;
  updatedOn?: Date;
  deletionDate?: Date;
  timeToDeadline?: string;
}


interface ProjectCreationAttributes extends Optional<ProjectAttributes, 'id'> {}


@Table({
  tableName: "project"
})
export default class Project extends Model<ProjectAttributes, ProjectCreationAttributes> {
  
  
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  description!: string;

  @ForeignKey(() => User)
  @Column
  creatorId!: number;

  @BelongsTo(() => User, 'creatorId')
  createdBy!: User;

  @ForeignKey(()=> User)
  @Column
  handlerId!: number;

  @BelongsTo(()=> User, 'handlerId')
  handledBy!: User;
  
  @Column({
    type: DataType.DATE,
  })
  deadline!: Date;

  @Column
  timeToDeadline?: string;

  @Default("Pending")// status is pending, started, finished
  @Column({
    type: DataType.ENUM("Pending", "Started", "Finished")
  })
  status?: string;

  @CreatedAt
  creationDate?: Date;

  @UpdatedAt
  updatedOn?: Date;

  @DeletedAt
  deletionDate?: Date;

  
}