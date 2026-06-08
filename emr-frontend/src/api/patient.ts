import request from '@/utils/request'
import type { Patient, Visit, PatientSearchParams, PatientListResponse } from '@/types/patient'

// 获取患者列表
export function getPatients(params: PatientSearchParams): Promise<PatientListResponse> {
  return request({
    url: '/patients',
    method: 'get',
    params,
  })
}

// 获取患者详情
export function getPatient(id: number): Promise<Patient> {
  return request({
    url: `/patients/${id}`,
    method: 'get',
  })
}

// 创建患者
export function createPatient(data: Partial<Patient>): Promise<Patient> {
  return request({
    url: '/patients',
    method: 'post',
    data,
  })
}

// 更新患者
export function updatePatient(id: number, data: Partial<Patient>): Promise<Patient> {
  return request({
    url: `/patients/${id}`,
    method: 'put',
    data,
  })
}

// 获取就诊记录列表
export function getVisits(patientId: number): Promise<Visit[]> {
  return request({
    url: `/patients/${patientId}/visits`,
    method: 'get',
  })
}

// 创建就诊记录
export function createVisit(data: Partial<Visit>): Promise<Visit> {
  return request({
    url: '/patients/visits', // 修复：使用正确的路径
    method: 'post',
    data,
  })
}