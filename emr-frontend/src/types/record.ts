// 病历相关类型定义

export interface OutpatientRecord {
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
  diagnosis?: DiagnosisItem[]
  treatmentPlan?: string
  prescription?: PrescriptionItem[]
  advice?: string
  doctorSignature?: string
  status: 'draft' | 'completed' | 'reviewed'
  version: number
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface DiagnosisItem {
  code: string
  name: string
  type: 'primary' | 'secondary'
}

export interface PrescriptionItem {
  drugName: string
  specification: string
  dosage: string
  frequency: string
  duration: number
  usage: string
  quantity: number
}

export interface RecordRevision {
  id: number
  recordId: number
  revisionType: 'create' | 'update' | 'delete'
  fieldName: string
  oldValue?: any
  newValue?: any
  operatorId: number
  operatorName: string
  operatedAt: string
  remark?: string
}

export interface Template {
  id: number
  name: string
  category: string
  contentJson: any
  contentHtml: string
  isPublic: boolean
  creatorId: number
  usageCount: number
  createdAt: string
  updatedAt: string
}

export type EditorMode = 'design' | 'form' | 'readonly' | 'preview'

export interface EmrFieldConfig {
  id: string
  type: 'Text' | 'DateTime' | 'DropdownList' | 'DataList' | 'RadioGroup' | 'CheckboxGroup' | 'Image'
  label: string
  required?: boolean
  placeholder?: string
  options?: Array<{ text: string; value: any }>
  dataUrl?: string
  multiline?: boolean
}
