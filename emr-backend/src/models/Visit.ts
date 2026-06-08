import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'

export interface VisitAttributes {
  id: number
  patientId: number
  visitNo: string
  visitType: 'outpatient' | 'inpatient' | 'emergency'
  departmentId?: number
  doctorId?: number
  visitDate: string
  diagnosis?: string
  status: 'pending' | 'completed' | 'cancelled'
  createdAt?: Date
  updatedAt?: Date
}

interface VisitCreationAttributes extends Optional<VisitAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Visit extends Model<VisitAttributes, VisitCreationAttributes> implements VisitAttributes {
  public id!: number
  public patientId!: number
  public visitNo!: string
  public visitType!: 'outpatient' | 'inpatient' | 'emergency'
  public departmentId?: number
  public doctorId?: number
  public visitDate!: string
  public diagnosis?: string
  public status!: 'pending' | 'completed' | 'cancelled'
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Visit.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '患者ID',
    },
    visitNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '就诊号',
    },
    visitType: {
      type: DataTypes.ENUM('outpatient', 'inpatient', 'emergency'),
      allowNull: false,
      comment: '就诊类型',
    },
    departmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '科室ID',
    },
    doctorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '医生ID',
    },
    visitDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '就诊日期',
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '诊断',
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      defaultValue: 'pending',
      comment: '状态',
    },
  },
  {
    sequelize,
    tableName: 'visits',
    indexes: [
      { fields: ['patient_id'] },
      { fields: ['visit_no'] },
    ],
  }
)

export default Visit
