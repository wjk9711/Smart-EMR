import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/user'
import { login as loginApi, logout as logoutApi, getProfile } from '@/api/auth'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  async function login(username: string, password: string) {
    const response = await loginApi({ username, password })
    token.value = response.token
    userInfo.value = response.user
    localStorage.setItem('token', response.token)
    localStorage.setItem('userInfo', JSON.stringify(response.user))
    return response
  }

  async function logout() {
    try {
      await logoutApi()
    } finally {
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      router.push('/login')
    }
  }

  async function fetchProfile() {
    if (token.value) {
      userInfo.value = await getProfile()
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
    fetchProfile,
  }
})
