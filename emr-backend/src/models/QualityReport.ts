import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database'

class QualityReport extends Model {
  id!: number
  userId!: number
  reportKey!: string  // 15位随机字符串
  reportName!: string
  filePath!: string
  fileSize!: number
  createdAt!: Date
  updatedAt!: Date
}

QualityReport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID',
      field: 'user_id',
    },
    reportKey: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
      comment: '报告唯一关键值（15位随机字符串）',
      field: 'report_key',
    },
    reportName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '报告名称',
      field: 'report_name',
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Word文档存储路径',
      field: 'file_path',
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '文件大小（字节）',
      field: 'file_size',
    },
  },
  {
    sequelize,
    modelName: 'QualityReport',
    tableName: 'quality_reports',
    timestamps: true,
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['report_key'],
        unique: true,
      },
      {
        fields: ['created_at'],
      },
    ],
  }
)

export default QualityReport
