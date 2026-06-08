// 护理模块 API (预留接口)

import request from '@/utils/request'

// TODO: 实现护理相关API
export function getVitalSigns(patientId: number) {
  return request({
    url: `/nursing/vital-signs/${patientId}`,
    method: 'get',
  })
}

export function createVitalSign(data: any) {
  return request({
    url: '/nursing/vital-signs',
    method: 'post',
    data,
  })
}
