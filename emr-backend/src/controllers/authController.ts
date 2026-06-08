import { Request, Response } from 'express'
import { User } from '../models'
import { generateToken } from '../utils/jwt'
import { success, error, validationError } from '../utils/response'

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return validationError(res, '用户名和密码不能为空')
    }

    // 查找用户
    const user = await User.findOne({ where: { username } })

    if (!user) {
      return error(res, 401, '用户名或密码错误')
    }

    // 验证密码
    const isValidPassword = await user.validatePassword(password)

    if (!isValidPassword) {
      return error(res, 401, '用户名或密码错误')
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return error(res, 403, '账户已被禁用')
    }

    // 生成token
    const token = generateToken(user.id)

    return success(res, {
      token,
      user: user.toJSON(),
    }, '登录成功')
  } catch (err) {
    console.error('Login error:', err)
    return error(res, 500, '服务器错误')
  }
}

export async function logout(req: Request, res: Response) {
  // JWT是无状态的,客户端只需删除token即可
  return success(res, null, '登出成功')
}

export async function getProfile(req: any, res: Response) {
  try {
    const user = await User.findByPk(req.user.id)

    if (!user) {
      return error(res, 404, '用户不存在')
    }

    return success(res, user.toJSON())
  } catch (err) {
    console.error('Get profile error:', err)
    return error(res, 500, '服务器错误')
  }
}
