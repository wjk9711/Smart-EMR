import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database'

class PatientAssignment extends Model {
  public id!: number
  public patientId!: number
  public userId!: number
  public assignedBy!: number
  public isTemplate!: boolean
  public copiedPatientId?: number // 复制后的患者ID
  public copiedAt?: Date // 复制时间
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

PatientAssignment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '患者ID',
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '用户ID（接收患者的用户）',
    },
    assignedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '分配者ID（管理员）',
    },
    isTemplate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否设为模板',
    },
    copiedPatientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '复制后的患者ID',
      field: 'copied_patient_id', // 手动指定数据库字段名
      references: {
        model: 'inpatient_patients',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    copiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '复制时间',
      field: 'copied_at', // 手动指定数据库字段名
    },
  },
  {
    sequelize,
    tableName: 'patient_assignments',
    timestamps: true,
    underscored: false, // 保持驼峰命名，匹配大部分字段
    indexes: [
      {
        fields: ['patientId', 'userId'],
        unique: false, // 移除唯一约束，允许重复下发
        name: 'idx_patient_user',
      },
      {
        fields: ['userId'],
        name: 'idx_patient_assignments_user',
      },
      {
        fields: ['patientId'],
        name: 'idx_patient_assignments_patient',
      },
      {
        fields: ['copied_patient_id'], // 使用数据库实际字段名
        name: 'idx_copied_patient',
      },
    ],
  }
)

export default PatientAssignment
