<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Helicone</h1>
          <p class="mt-2 text-gray-600">创建您的账户</p>
        </div>

        <form @submit.prevent="handleSignup" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              姓名
            </label>
            <input
              v-model="name"
              type="text"
              required
              class="input-field"
              placeholder="张三"
            />
          </div>

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
              placeholder="至少 6 位"
            />
          </div>

          <button type="submit" class="btn-primary w-full" :disabled="loading">
            <span v-if="loading">注册中...</span>
            <span v-else>注册</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <router-link to="/login" class="text-sm text-primary-600 hover:text-primary-500">
            已有账户？立即登录
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

const name = ref('')
const email = ref('')
const password = ref('')

async function handleSignup() {
  loading.value = true
  try {
    // TODO: 调用注册 API
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/login')
  } catch (error) {
    console.error('Signup failed:', error)
  } finally {
    loading.value = false
  }
}
</script>
