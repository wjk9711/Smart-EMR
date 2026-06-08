import { Response } from 'express'

export interface ApiResponse<T = any> {
  code: number
  data?: T
  message?: string
}

export function success<T>(res: Response, data?: T, message?: string) {
  return res.json({
    code: 200,
    data,
    message: message || '操作成功',
  })
}

export function error(res: Response, code: number = 400, message: string = '操作失败') {
  return res.status(code >= 500 ? 500 : code).json({
    code,
    message,
  })
}

export function notFound(res: Response, message: string = '资源不存在') {
  return error(res, 404, message)
}

export function unauthorized(res: Response, message: string = '未授权') {
  return error(res, 401, message)
}

export function forbidden(res: Response, message: string = '禁止访问') {
  return error(res, 403, message)
}

export function validationError(res: Response, message: string = '参数验证失败') {
  return error(res, 400, message)
}
