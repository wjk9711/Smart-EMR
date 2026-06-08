// 患者相关类型定义

export interface Patient {
  id: number
  patientNo: string
  name: string
  gender: 'male' | 'female' | 'other'
  birthDate: string
  idCard?: string
  phone?: string
  address?: string
  insuranceNo?: string
  createdAt: string
  updatedAt: string
}

export interface Visit {
  id: number
  patientId: number
  visitNo: string
  visitType: 'outpatient' | 'inpatient' | 'emergency'
  departmentId?: number
  doctorId?: number
  visitDate: string
  diagnosis?: string
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface PatientSearchParams {
  keyword?: string
  patientNo?: string
  name?: string
  page?: number
  pageSize?: number
}

export interface PatientListResponse {
  total: number
  list: Patient[]
}
