import request from '@/utils/request'
import type { LoginRequest, LoginResponse, User } from '@/types/user'

// 登录
export function login(data: LoginRequest): Promise<LoginResponse> {
  return request({
    url: '/auth/login',
    method: 'post',
    data,
  })
}

// 登出
export function logout(): Promise<void> {
  return request({
    url: '/auth/logout',
    method: 'post',
  })
}

// 获取当前用户信息
export function getProfile(): Promise<User> {
  return request({
    url: '/auth/profile',
    method: 'get',
  })
}
