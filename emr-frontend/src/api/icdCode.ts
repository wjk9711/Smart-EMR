import request from '@/utils/request'

/**
 * ICD编码质控请求参数
 */
export interface ICDCodeCheckRequest {
  diagnosis: string        // 诊断名称或手术名称
  currentCode?: string     // 当前填写的编码
  chiefComplaint?: string  // 主诉（可选）
  presentIllness?: string  // 现病史（可选）
  pastHistory?: string     // 既往史（可选）
  auxiliaryExam?: string   // 辅助检查（可选）
}

/**
 * 单个诊断的质控详情
 */
export interface DiagnosisDetail {
  diagnosisName: string    // 诊断名称
  filledCode: string       // 填写的编码
  isCorrect: boolean       // 是否正确
  confidence?: number      // 匹配置信度 (0-1)
  recommendedCode?: string // 推荐编码
  message: string          // 详细说明
  suggestion?: string      // 改进建议
}

/**
 * ICD编码质控响应
 */
export interface ICDCodeCheckResponse {
  isCorrect: boolean           // 总体是否正确
  details: DiagnosisDetail[]   // 详细结果
  missingDiagnoses?: string[]  // 遗漏的诊断
  overallComment: string       // 总体评价
}

/**
 * 检查ICD编码（调用通义千问AI）
 * @param data 质控请求参数
 * @returns 质控结果
 */
export function checkICDCode(data: ICDCodeCheckRequest): Promise<ICDCodeCheckResponse> {
  return request({
    url: '/inpatient/check-icd-code',
    method: 'post',
    data,
  })
}
