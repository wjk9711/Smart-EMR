import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'

export interface TemplateAttributes {
  id: number
  name: string
  category: string
  contentJson: string // JSON string
  contentHtml: string
  isPublic: boolean
  creatorId: number
  usageCount: number
  createdAt?: Date
  updatedAt?: Date
}

interface TemplateCreationAttributes extends Optional<TemplateAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Template extends Model<TemplateAttributes, TemplateCreationAttributes> implements TemplateAttributes {
  public id!: number
  public name!: string
  public category!: string
  public contentJson!: string
  public contentHtml!: string
  public isPublic!: boolean
  public creatorId!: number
  public usageCount!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Template.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '模板名称',
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '分类',
    },
    contentJson: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '模板内容(JSON)',
    },
    contentHtml: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '模板内容(HTML)',
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否公开',
    },
    creatorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '创建者ID',
    },
    usageCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      comment: '使用次数',
    },
  },
  {
    sequelize,
    tableName: 'templates',
    indexes: [
      { fields: ['category'] },
      { fields: ['creator_id'] },
    ],
  }
)

export default Template
