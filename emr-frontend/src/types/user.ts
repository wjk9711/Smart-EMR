// 用户相关类型定义

export interface User {
  id: number
  username: string
  realName: string
  departmentId?: number
  roleId?: number
  roleType: 'student' | 'teacher' | 'admin'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface Role {
  id: number
  name: string
  description?: string
  permissions: string[]
  createdAt: string
}

export interface Department {
  id: number
  name: string
  parentId?: number
  code: string
  status: 'active' | 'inactive'
  createdAt: string
}
