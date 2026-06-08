import request from '@/utils/request'
import type { OutpatientRecord, RecordRevision, Template } from '@/types/record'

// 获取门诊病历列表
export function getOutpatientRecords(params?: {
  patientId?: number
  doctorId?: number
  status?: string
  page?: number
  pageSize?: number
}): Promise<{ total: number; list: OutpatientRecord[] }> {
  return request({
    url: '/outpatient/records',
    method: 'get',
    params,
  })
}

// 获取门诊病历详情
export function getOutpatientRecord(id: number): Promise<OutpatientRecord> {
  return request({
    url: `/outpatient/records/${id}`,
    method: 'get',
  })
}

// 创建门诊病历
export function createOutpatientRecord(data: Partial<OutpatientRecord>): Promise<OutpatientRecord> {
  return request({
    url: '/outpatient/records',
    method: 'post',
    data,
  })
}

// 更新门诊病历
export function updateOutpatientRecord(
  id: number,
  data: Partial<OutpatientRecord>
): Promise<OutpatientRecord> {
  return request({
    url: `/outpatient/records/${id}`,
    method: 'put',
    data,
  })
}

// 删除门诊病历
export function deleteOutpatientRecord(id: number): Promise<void> {
  return request({
    url: `/outpatient/records/${id}`,
    method: 'delete',
  })
}

// 完成病历
export function completeOutpatientRecord(id: number): Promise<OutpatientRecord> {
  return request({
    url: `/outpatient/records/${id}/complete`,
    method: 'post',
  })
}

// 获取修订历史
export function getRecordRevisions(recordId: number): Promise<RecordRevision[]> {
  return request({
    url: `/outpatient/records/${recordId}/revisions`,
    method: 'get',
  })
}

// 获取模板列表
export function getTemplates(params?: { category?: string }): Promise<Template[]> {
  return request({
    url: '/templates',
    method: 'get',
    params,
  })
}

// 获取模板详情
export function getTemplate(id: number): Promise<Template> {
  return request({
    url: `/templates/${id}`,
    method: 'get',
  })
}

// 创建模板
export function createTemplate(data: Partial<Template>): Promise<Template> {
  return request({
    url: '/templates',
    method: 'post',
    data,
  })
}

// 更新模板
export function updateTemplate(id: number, data: Partial<Template>): Promise<Template> {
  return request({
    url: `/templates/${id}`,
    method: 'put',
    data,
  })
}

// 删除模板
export function deleteTemplate(id: number): Promise<void> {
  return request({
    url: `/templates/${id}`,
    method: 'delete',
  })
}

// ==================== 门诊病历提交流程 API ====================

// 学生提交病历给教师
export const submitRecord = (id: number, data: { teacherId: number }) => {
  return request.post(`/outpatient/records/${id}/submit`, data)
}

// 教师获取待质控的病历列表
export const getPendingReviewRecords = (params: any) => {
  return request.get('/outpatient/records/pending-review', { params })
}

// 教师提交质控结果
export const reviewRecord = (id: number, data: { result: 'passed' | 'rejected'; comment?: string }) => {
  return request.post(`/outpatient/records/${id}/review`, data)
}

// 获取教师列表（供学生选择）
export const getTeacherList = () => {
  return request.get('/outpatient/teachers')
}
