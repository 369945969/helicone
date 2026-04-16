<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Helicone</h1>
          <p class="mt-2 text-gray-600">登录到您的账户</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              v-model="email"
              type="email"
              required
              class="input-field"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              v-model="password"
              type="password"
              required
              class="input-field"
              placeholder="输入密码"
            />
          </div>

          <button type="submit" class="btn-primary w-full" :disabled="authStore.loading">
            <span v-if="authStore.loading">登录中...</span>
            <span v-else>登录</span>
          </button>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">或使用以下方式登录</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <button class="btn-secondary w-full">
              Google
            </button>
            <button class="btn-secondary w-full">
              GitHub
            </button>
          </div>
        </div>

        <div class="mt-6 text-center">
          <router-link to="/signup" class="text-sm text-primary-600 hover:text-primary-500">
            没有账户？立即注册
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

async function handleLogin() {
  try {
    await authStore.login(email.value, password.value)
    router.push('/dashboard')
  } catch (error) {
    console.error('Login failed:', error)
    alert('登录失败，请检查邮箱和密码')
  }
}
</script>
