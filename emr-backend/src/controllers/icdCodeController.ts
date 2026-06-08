import { Request, Response } from 'express'
import axios from 'axios'
import { success, error } from '../utils/response'

// 通义千问API配置
const QWEN_API_KEY = process.env.QWEN_API_KEY || ''
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'

interface ICDCodeCheckRequest {
  diagnosis: string
  currentCode?: string
  chiefComplaint?: string
  presentIllness?: string
  pastHistory?: string
  auxiliaryExam?: string
}

interface DiagnosisDetail {
  diagnosisName: string
  filledCode: string
  isCorrect: boolean
  confidence?: number  // 匹配置信度 (0-1)
  recommendedCode?: string
  message: string
  suggestion?: string  // 改进建议
}

interface ICDCodeCheckResponse {
  isCorrect: boolean
  details: DiagnosisDetail[]
  missingDiagnoses?: string[]
  overallComment: string
}

export const checkICDCode = async (req: Request, res: Response) => {
  try {
    const { 
      diagnosis, 
      currentCode,
      chiefComplaint,
      presentIllness,
      pastHistory,
      auxiliaryExam
    }: ICDCodeCheckRequest = req.body

    if (!diagnosis) {
      return error(res, 400, '诊断信息不能为空')
    }

    // 调试日志
    console.log('QWEN_API_KEY exists:', !!QWEN_API_KEY)
    console.log('Diagnosis:', diagnosis)
    console.log('Chief complaint:', chiefComplaint)

    if (!QWEN_API_KEY) {
      // 如果没有配置API Key，返回模拟数据用于测试
      console.log('Warning: QWEN_API_KEY not configured, using mock data')
      return res.json({
        code: 200,
        data: {
          isCorrect: false,
          details: [
            {
              diagnosisName: '肺炎',
              filledCode: 'J18.9',
              isCorrect: true,
              confidence: 0.95,
              message: '编码正确，J18.9是未特指病原体的肺炎的标准编码'
            },
            {
              diagnosisName: '高血压',
              filledCode: 'I10',
              isCorrect: true,
              confidence: 1.0,
              message: '编码完全正确，I10是原发性高血压的标准编码'
            },
            {
              diagnosisName: '糖尿病',
              filledCode: 'E11.9',
              isCorrect: false,
              confidence: 0.6,
              recommendedCode: 'E11.65',
              message: '编码不够精确，当前编码为未特指的2型糖尿病',
              suggestion: '建议根据是否有并发症使用更精确的编码，如E11.65（伴有高血糖）'
            }
          ],
          missingDiagnoses: ['根据主诉"发热3天"，建议补充"发热R50.9"诊断'],
          overallComment: '已填写的诊断编码基本正确，但部分编码可以更精确。根据病历信息可能存在遗漏诊断，建议完善。'
        },
        message: '检查成功（模拟数据）',
      })
    }

    // 构建提示词 - 增强版，包含病历完整信息
    const prompt = `你是一个专业的医疗质控专家，擅长ICD-10编码和病历质量检查。请根据以下病历信息进行综合分析：

【病历信息】
诊断列表：${diagnosis}
主诉：${chiefComplaint || '未填写'}
现病史：${presentIllness || '未填写'}
既往史：${pastHistory || '未填写'}
辅助检查：${auxiliaryExam || '未填写'}

【检查任务】
请完成以下全面的质量检查：

1. **编码准确性检查**（重点）：
   - 对每个诊断，判断填写的ICD-10编码是否与疾病名称匹配
   - 即使病历信息不完整，也要基于诊断名称本身判断编码是否正确
   - 评估匹配置信度（0-1之间，1表示完全匹配）
   - 如果不匹配或置信度低，提供最准确的推荐编码
   - 说明为什么当前编码不正确或不准确

2. **诊断完整性检查**：
   - 根据主诉、现病史、既往史、辅助检查等信息
   - 判断是否存在遗漏的重要诊断
   - 如果有遗漏，建议补充的诊断及编码

3. **诊断合理性检查**：
   - 诊断与主诉是否相符
   - 诊断与现病史描述是否一致
   - 既往病史是否需要作为并发症或合并症列出

【返回格式】
请以JSON格式返回结果，格式如下：
{
  "isCorrect": true/false,  // 总体是否正确（所有诊断编码都正确才为true）
  "details": [
    {
      "diagnosisName": "诊断名称",
      "filledCode": "填写的编码",
      "isCorrect": true/false,  // 该诊断编码是否正确
      "confidence": 0.95,  // 匹配置信度 (0-1)，如果编码正确则接近1，不正确则较低
      "recommendedCode": "推荐编码（如不正确或不准确时提供）",
      "message": "详细说明（如：编码正确/编码错误，应为XXX/编码不够精确，建议使用XXX）",
      "suggestion": "改进建议（可选，如：建议细化到具体类型/建议补充并发症编码等）"
    }
  ],
  "missingDiagnoses": [
    "根据主诉\"XXX\"，建议补充\"诊断名称 ICD编码\"",
    "根据既往史\"XXX\"，建议补充\"诊断名称 ICD编码\""
  ],
  "overallComment": "总体评价和建议，包括编码质量、诊断完整性等方面的综合评价"
}

【重要提示】
- 即使病历信息不完整，只要提供了诊断名称和编码，就必须判断它们是否匹配
- 对于常见疾病，应使用最标准的ICD-10编码
- 如果编码存在多个可能选项，选择最常用或最精确的那个
- confidence字段很重要：1.0表示完全匹配，0.8-0.9表示基本匹配但可能有更精确的编码，<0.8表示明显不匹配

只返回JSON，不要有其他内容。`

    // 调用通义千问API
    const response = await axios.post(
      QWEN_API_URL,
      {
        model: 'qwen-plus',  // 使用更强的模型
        input: {
          messages: [
            {
              role: 'system',
              content: '你是一个专业的医疗质控专家，擅长ICD-10医学编码、诊断完整性检查和病历质量评估。你需要综合分析病历的主诉、现病史、既往史、辅助检查等信息，判断诊断是否完整、编码是否正确。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        parameters: {
          result_format: 'message',
          temperature: 0.2,  // 降低随机性，提高准确性
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${QWEN_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    // 解析通义千问的响应
    const qwenResponse = response.data.output.choices[0].message.content
    
    // 尝试解析JSON
    let result: ICDCodeCheckResponse
    try {
      // 提取JSON部分（可能包含在markdown代码块中）
      const jsonMatch = qwenResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        result = JSON.parse(qwenResponse)
      }
    } catch (parseError) {
      console.error('Failed to parse Qwen response:', parseError)
      console.error('Raw response:', qwenResponse)
      // 如果解析失败，返回默认结果
      result = {
        isCorrect: false,
        details: [],
        missingDiagnoses: [],
        overallComment: 'AI响应解析失败，请手动检查',
      }
    }

    return res.json({
      code: 200,
      data: result,
      message: '检查成功',
    })
  } catch (err: any) {
    console.error('Check ICD code error:', err)
    
    if (err.response) {
      return error(res, err.response.status, `通义千问API错误: ${err.response.data?.error?.message || err.message}`)
    }
    
    return error(res, 500, err.message || '检查编码失败')
  }
}
