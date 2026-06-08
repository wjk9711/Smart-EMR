import request from '@/utils/request'

// 获取住院患者列表
export const getInpatientPatients = (params: any) => {
  return request.get('/inpatient/patients', { params })
}

// 获取住院患者详情
export const getInpatientPatient = (id: number) => {
  return request.get(`/inpatient/patients/${id}`)
}

// 创建住院患者
export const createInpatientPatient = (data: any) => {
  return request.post('/inpatient/patients', data)
}

// 更新住院患者
export const updateInpatientPatient = (id: number, data: any) => {
  return request.put(`/inpatient/patients/${id}`, data)
}

// 删除住院患者
export const deleteInpatientPatient = (id: number) => {
  return request.delete(`/inpatient/patients/${id}`)
}

// 获取病案列表
export const getInpatientRecords = (params: any) => {
  return request.get('/inpatient/records', { params })
}

// 获取病案详情
export const getInpatientRecord = (id: number) => {
  return request.get(`/inpatient/records/${id}`)
}

// 创建病案
export const createInpatientRecord = (data: any) => {
  return request.post('/inpatient/records', data)
}

// 更新病案
export const updateInpatientRecord = (id: number, data: any) => {
  return request.put(`/inpatient/records/${id}`, data)
}

// 删除病案
export const deleteInpatientRecord = (id: number) => {
  return request.delete(`/inpatient/records/${id}`)
}

// ==================== 病历提交流程 API ====================

// 学生提交病历给教师
export const submitRecord = (id: number, data: { teacherId: number }) => {
  return request.post(`/inpatient/records/${id}/submit`, data)
}

// 教师获取待质控的病历列表
export const getPendingReviewRecords = (params: any) => {
  return request.get('/inpatient/records/pending-review', { params })
}

// 教师提交质控结果
export const reviewRecord = (id: number, data: { result: 'passed' | 'rejected'; comment?: string }) => {
  return request.post(`/inpatient/records/${id}/review`, data)
}

// 获取教师列表（供学生选择）
export const getTeacherList = () => {
  return request.get('/inpatient/teachers')
}
