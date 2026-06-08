/**
 * 病案首页质控工具
 * 用于检查疾病编码和手术编码的正确性
 * 使用通义千问AI进行智能判断
 */

import { checkICDCode, type ICDCodeCheckResponse, type DiagnosisDetail } from '@/api/icdCode'

/**
 * 质控结果接口（扩展版，包含完整AI响应）
 */
export interface QualityControlResult {
  isValid: boolean
  message: string
  suggestedCode?: string
  confidence?: number
  suggestion?: string
  // 新增：完整的AI响应数据
  fullResponse?: ICDCodeCheckResponse
  detail?: DiagnosisDetail
}

/**
 * 质控诊断编码（调用AI）
 * @param diagnosisName 诊断名称
 * @param diagnosisCode 诊断编码
 * @returns 质控结果（包含完整AI响应）
 */
export async function qualityControlDiagnosis(
  diagnosisName: string,
  diagnosisCode: string
): Promise<QualityControlResult> {
  // 如果名称和编码都为空，跳过
  if (!diagnosisName && !diagnosisCode) {
    return {
      isValid: true,
      message: '无需质控',
    }
  }
  
  try {
    // 调用后端AI接口
    const response = await checkICDCode({
      diagnosis: diagnosisName || '',
      currentCode: diagnosisCode || undefined,
    })
    
    // 解析AI返回的结果
    if (response.details && response.details.length > 0) {
      const detail = response.details[0]
      
      if (detail.isCorrect) {
        return {
          isValid: true,
          message: detail.message || '编码正确',
          confidence: detail.confidence,
          fullResponse: response,
          detail: detail,
        }
      } else {
        return {
          isValid: false,
          message: detail.message || '编码不正确',
          suggestedCode: detail.recommendedCode,
          confidence: detail.confidence,
          suggestion: detail.suggestion,
          fullResponse: response,
          detail: detail,
        }
      }
    }
    
    // 如果没有详细信息，使用总体评价
    return {
      isValid: response.isCorrect,
      message: response.overallComment || '质控完成',
      fullResponse: response,
    }
  } catch (error) {
    console.error('AI质控失败:', error)
    return {
      isValid: false,
      message: 'AI质控服务暂时不可用，请稍后重试',
    }
  }
}

/**
 * 质控手术编码（调用AI）
 * @param operationName 手术名称
 * @param operationCode 手术编码
 * @returns 质控结果（包含完整AI响应）
 */
export async function qualityControlOperation(
  operationName: string,
  operationCode: string
): Promise<QualityControlResult> {
  // 如果名称和编码都为空，跳过
  if (!operationName && !operationCode) {
    return {
      isValid: true,
      message: '无需质控',
    }
  }
  
  try {
    // 调用后端AI接口（手术编码也使用相同的接口）
    const response = await checkICDCode({
      diagnosis: operationName || '',
      currentCode: operationCode || undefined,
    })
    
    // 解析AI返回的结果
    if (response.details && response.details.length > 0) {
      const detail = response.details[0]
      
      if (detail.isCorrect) {
        return {
          isValid: true,
          message: detail.message || '编码正确',
          confidence: detail.confidence,
          fullResponse: response,
          detail: detail,
        }
      } else {
        return {
          isValid: false,
          message: detail.message || '编码不正确',
          suggestedCode: detail.recommendedCode,
          confidence: detail.confidence,
          suggestion: detail.suggestion,
          fullResponse: response,
          detail: detail,
        }
      }
    }
    
    // 如果没有详细信息，使用总体评价
    return {
      isValid: response.isCorrect,
      message: response.overallComment || '质控完成',
      fullResponse: response,
    }
  } catch (error) {
    console.error('AI质控失败:', error)
    return {
      isValid: false,
      message: 'AI质控服务暂时不可用，请稍后重试',
    }
  }
}
