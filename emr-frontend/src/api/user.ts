import request from '@/utils/request'

// 获取用户列表
export const getUserList = (params: any) => {
  return request.get('/users', { params })
}

// 创建单个用户
export const createUser = (data: any) => {
  return request.post('/users', data)
}

// 批量创建用户
export const batchCreateUsers = (data: any) => {
  return request.post('/users/batch-create', data)
}

// 更新用户
export const updateUser = (id: number, data: any) => {
  return request.put(`/users/${id}`, data)
}

// 删除单个用户
export const deleteUser = (id: number) => {
  return request.delete(`/users/${id}`)
}

// 批量删除用户
export const batchDeleteUsers = (ids: number[]) => {
  return request.delete('/users/batch-delete', { data: { ids } })
}
