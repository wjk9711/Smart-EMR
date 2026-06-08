// 质控模块 API (预留接口)

import request from '@/utils/request'

// TODO: 实现质控相关API
export function getQualityRules() {
  return request({
    url: '/quality/rules',
    method: 'get',
  })
}

export function runQualityCheck(recordId: number) {
  return request({
    url: `/quality/check/${recordId}`,
    method: 'post',
  })
}
