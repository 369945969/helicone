import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

export interface Org {
  id: string
  name: string
  created_at: string
  has_onboarded: boolean
  tier: string
  membership?: {
    role: 'owner' | 'admin' | 'member' | 'viewer'
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (data.success) {
        token.value = data.token
        user.value = data.user
      }
      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle() {
    window.location.href = '/api/v1/auth/google'
  }

  async function loginWithGitHub() {
    window.location.href = '/api/v1/auth/github'
  }

  async function signup(email: string, password: string, name: string) {
    loading.value = true
    try {
      const response = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await response.json()
      if (data.success) {
        token.value = data.token
        user.value = data.user
      }
      return data
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    sessionStorage.clear()
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    if (!token.value) throw new Error('未登录')
    const response = await fetch('/api/v1/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`,
      },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    })
    return response.json()
  }

  async function resetPassword(email: string) {
    const response = await fetch('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    return response.json()
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    loginWithGoogle,
    loginWithGitHub,
    signup,
    logout,
    changePassword,
    resetPassword,
  }
})
