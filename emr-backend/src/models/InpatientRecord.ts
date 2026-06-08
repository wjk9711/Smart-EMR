import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database'

class InpatientRecord extends Model {
  public id!: number
  public patientId!: number
  public caseNo!: string
  public recordType!: string
  public content!: string
  public doctorId!: number
  public status!: string
  // 新增：提交流程相关字段
  public submitStatus!: 'not_submitted' | 'pending_review' | 'passed' | 'rejected'
  public teacherId?: number
  public qualityComment?: string
  public submittedAt?: Date
  public reviewedAt?: Date
  public createdAt!: Date
  public updatedAt!: Date
}

InpatientRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '患者ID',
    },
    caseNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '病案号（与住院号一致）',
    },
    recordType: {
      type: DataTypes.ENUM('admission', 'progress', 'discharge', 'operation', 'home_page', 'other'),
      allowNull: false,
      comment: '病案类型：admission-入院记录，progress-病程记录，discharge-出院记录，operation-手术记录，home_page-病案首页，other-其他',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '病案内容（JSON格式）',
    },
    doctorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '医生ID',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('draft', 'completed', 'signed', 'archived'),
      defaultValue: 'draft',
      comment: '状态：draft-草稿，completed-完成，signed-已签名，archived-已归档',
    },
    // 新增：提交流程相关字段
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
    tableName: 'inpatient_records',
    timestamps: true,
    comment: '住院病案表',
  }
)

export default InpatientRecord
