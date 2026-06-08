import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { User } from '../models'

export interface AuthRequest extends Request {
  user?: User
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌',
      })
    }

    const token = authHeader.substring(7)
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: number }
      
      const user = await User.findByPk(decoded.userId)
      
      if (!user || user.status !== 'active') {
        return res.status(401).json({
          code: 401,
          message: '用户不存在或已被禁用',
        })
      }

      req.user = user
      next()
    } catch (error) {
      return res.status(401).json({
        code: 401,
        message: '无效的认证令牌',
      })
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
    })
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // TODO: 实现角色检查逻辑
    next()
  }
}
