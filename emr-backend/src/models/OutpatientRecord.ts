import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'

export interface OutpatientRecordAttributes {
  id: number
  visitId: number
  patientId: number
  doctorId: number
  chiefComplaint?: string
  presentIllness?: string
  pastHistory?: string
  allergyHistory?: string
  physicalExam?: string
  auxiliaryExam?: string
  diagnosis?: string // JSON string
  treatmentPlan?: string
  prescription?: string // JSON string
  advice?: string
  doctorSignature?: string
  status: 'draft' | 'completed' | 'reviewed'
  version: number
  createdAt?: Date
  updatedAt?: Date
  completedAt?: Date
  // 新增：提交流程相关字段
  submitStatus?: 'not_submitted' | 'pending_review' | 'passed' | 'rejected'
  teacherId?: number
  qualityComment?: string
  submittedAt?: Date
  reviewedAt?: Date
}

interface OutpatientRecordCreationAttributes
  extends Optional<OutpatientRecordAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class OutpatientRecord
  extends Model<OutpatientRecordAttributes, OutpatientRecordCreationAttributes>
  implements OutpatientRecordAttributes
{
  public id!: number
  public visitId!: number
  public patientId!: number
  public doctorId!: number
  public chiefComplaint?: string
  public presentIllness?: string
  public pastHistory?: string
  public allergyHistory?: string
  public physicalExam?: string
  public auxiliaryExam?: string
  public diagnosis?: string
  public treatmentPlan?: string
  public prescription?: string
  public advice?: string
  public doctorSignature?: string
  public status!: 'draft' | 'completed' | 'reviewed'
  public version!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public completedAt?: Date
  // 提交流程相关字段
  public submitStatus?: 'not_submitted' | 'pending_review' | 'passed' | 'rejected'
  public teacherId?: number
  public qualityComment?: string
  public submittedAt?: Date
  public reviewedAt?: Date
}

OutpatientRecord.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    visitId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '就诊ID',
    },
    patientId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '患者ID',
    },
    doctorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '医生ID',
    },
    chiefComplaint: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '主诉',
    },
    presentIllness: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '现病史',
    },
    pastHistory: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '既往史',
    },
    allergyHistory: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '过敏史',
    },
    physicalExam: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '体格检查',
    },
    auxiliaryExam: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '辅助检查',
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '诊断(JSON)',
    },
    treatmentPlan: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '治疗方案',
    },
    prescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '处方(JSON)',
    },
    advice: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '医嘱建议',
    },
    doctorSignature: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '医生签名图片(base64或路径)',
    },
    status: {
      type: DataTypes.ENUM('draft', 'completed', 'reviewed'),
      defaultValue: 'draft',
      comment: '状态',
    },
    version: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 1,
      comment: '版本号',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '完成时间',
    },
    // 提交流程相关字段
    submitStatus: {
      type: DataTypes.ENUM('not_submitted', 'pending_review', 'passed', 'rejected'),
      defaultValue: 'not_submitted',
      comment: '提交状态：not_submitted-未提交，pending_review-待检查，passed-通过，rejected-不通过',
    },
    teacherId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '教师ID（提交给哪位教师）',
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    qualityComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '质控意见',
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '提交时间',
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '审核时间',
    },
  },
  {
    sequelize,
    tableName: 'outpatient_records',
    indexes: [
      { fields: ['visit_id'] },
      { fields: ['patient_id'] },
      { fields: ['doctor_id'] },
    ],
  }
)

export default OutpatientRecord
