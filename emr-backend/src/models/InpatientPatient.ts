import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database'

class InpatientPatient extends Model {
  public id!: number
  public name!: string
  public gender!: string
  public birthDate!: string
  public age!: number
  public idCard!: string
  public phone!: string
  public address!: string
  public inpatientNo!: string
  public department!: string
  public bedNo!: string
  public admissionDate!: string
  public dischargeDate?: string
  public status!: string // admitted, discharged, transferred
  public diagnosis!: string
  public doctorId?: number // 创建该患者的医生ID
  public createdAt!: Date
  public updatedAt!: Date
}

InpatientPatient.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '患者姓名',
    },
    gender: {
      type: DataTypes.ENUM('男', '女'),
      allowNull: false,
      comment: '性别',
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '出生日期',
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '年龄',
    },
    idCard: {
      type: DataTypes.STRING(18),
      allowNull: false,
      unique: true,
      comment: '身份证号',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '联系电话',
    },
    address: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '家庭住址',
    },
    inpatientNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '住院号',
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '科室',
    },
    bedNo: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '床号',
    },
    admissionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '入院日期',
    },
    dischargeDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '出院日期',
    },
    status: {
      type: DataTypes.ENUM('admitted', 'discharged', 'transferred'),
      defaultValue: 'admitted',
      comment: '状态：admitted-在院，discharged-出院，transferred-转科',
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '入院诊断',
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
    tableName: 'inpatient_patients',
    timestamps: true,
    comment: '住院患者表',
  }
)

export default InpatientPatient
