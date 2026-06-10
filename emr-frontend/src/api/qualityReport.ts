import request from '@/utils/request'

// 质控报告接口
export interface QualityReport {
  id: number
  userId: number
  reportKey: string
  reportName: string
  filePath: string
  fileSize: number
  createdAt: string
  updatedAt: string
  content?: string
}

// 获取质控报告列表
export const getQualityReports = () => {
  return request.get('/quality-reports')
}

// 创建新质控报告
export const createQualityReport = (data: { reportName: string }) => {
  return request.post('/quality-reports', data)
}

// 更新质控报告
export const updateQualityReport = (id: number, data: { reportName?: string; content?: string }) => {
  return request.put(`/quality-reports/${id}`, data)
}

// 删除单个质控报告
export const deleteQualityReport = (id: number) => {
  return request.delete(`/quality-reports/${id}`)
}

// 批量删除质控报告
export const batchDeleteQualityReports = (ids: number[]) => {
  return request.post('/quality-reports/batch-delete', { ids })
}

// 获取质控报告详情
export const getQualityReportDetail = (id: number) => {
  return request.get(`/quality-reports/${id}`)
}
