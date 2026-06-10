import User from './User'
import Patient from './Patient'
import Visit from './Visit'
import OutpatientRecord from './OutpatientRecord'
import Template from './Template'
import InpatientPatient from './InpatientPatient'
import InpatientRecord from './InpatientRecord'
import PatientAssignment from './PatientAssignment'
import QualityReport from './QualityReport'

// 定义模型关联
User.hasMany(Template, { foreignKey: 'creatorId', as: 'templates' })
Template.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' })

Patient.hasMany(Visit, { foreignKey: 'patientId', as: 'visits' })
Visit.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' })

Visit.hasMany(OutpatientRecord, { foreignKey: 'visitId', as: 'records' })
OutpatientRecord.belongsTo(Visit, { foreignKey: 'visitId', as: 'visit' })

Patient.hasMany(OutpatientRecord, { foreignKey: 'patientId', as: 'outpatientRecords' })
OutpatientRecord.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' })

User.hasMany(OutpatientRecord, { foreignKey: 'doctorId', as: 'writtenRecords' })
OutpatientRecord.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' })

// 门诊病历提交流程关联：教师审核
User.hasMany(OutpatientRecord, { foreignKey: 'teacherId', as: 'reviewedOutpatientRecords' })
OutpatientRecord.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' })

// 住院相关关联
InpatientPatient.hasMany(InpatientRecord, { foreignKey: 'patientId', as: 'records' })
InpatientRecord.belongsTo(InpatientPatient, { foreignKey: 'patientId', as: 'patient' })

User.hasMany(InpatientRecord, { foreignKey: 'doctorId', as: 'inpatientRecords' })
InpatientRecord.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' })

// 提交流程关联：教师审核
User.hasMany(InpatientRecord, { foreignKey: 'teacherId', as: 'reviewedRecords' })
InpatientRecord.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' })

// 患者分配关联
PatientAssignment.belongsTo(InpatientPatient, { foreignKey: 'patientId', as: 'patient' })
PatientAssignment.belongsTo(User, { foreignKey: 'userId', as: 'user' })
PatientAssignment.belongsTo(User, { foreignKey: 'assignedBy', as: 'assigner' })

// 质控报告关联
QualityReport.belongsTo(User, { foreignKey: 'userId', as: 'user' })
User.hasMany(QualityReport, { foreignKey: 'userId', as: 'qualityReports' })

export {
  User,
  Patient,
  Visit,
  OutpatientRecord,
  Template,
  InpatientPatient,
  InpatientRecord,
  PatientAssignment,
  QualityReport,
}
