import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'

export interface PatientAttributes {
  id: number
  patientNo: string
  name: string
  gender: 'male' | 'female' | 'other'
  birthDate: string
  idCard?: string
  phone?: string
  address?: string
  insuranceNo?: string
  doctorId?: number // 创建该患者的医生ID
  createdAt?: Date
  updatedAt?: Date
}

interface PatientCreationAttributes extends Optional<PatientAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Patient extends Model<PatientAttributes, PatientCreationAttributes> implements PatientAttributes {
  public id!: number
  public patientNo!: string
  public name!: string
  public gender!: 'male' | 'female' | 'other'
  public birthDate!: string
  public idCard?: string
  public phone?: string
  public address?: string
  public insuranceNo?: string
  public doctorId?: number // 创建该患者的医生ID
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Patient.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    patientNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '病历号',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '姓名',
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false,
      comment: '性别',
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '出生日期',
    },
    idCard: {
      type: DataTypes.STRING(18),
      allowNull: true,
      comment: '身份证号',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '联系电话',
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '地址',
    },
    insuranceNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '医保号',
    },
    doctorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '创建该患者的医生ID',
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'patients',
    indexes: [
      { fields: ['name'] },
      { fields: ['patient_no'] },
      { fields: ['doctor_id'] }, // 添加索引
    ],
  }
)

export default Patient
