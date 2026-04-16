<template>
  <DefaultLayout>
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-6">设置</h1>
      
      <div class="space-y-6">
        <!-- API Key 管理 -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">API 密钥</h2>
          <button @click="generateApiKey" class="btn-primary">
            生成新的 API 密钥
          </button>
          <div v-if="apiKeys.length > 0" class="mt-4">
            <div v-for="key in apiKeys" :key="key.id" class="flex justify-between items-center p-3 bg-gray-50 rounded mb-2">
              <div>
                <p class="font-mono text-sm">{{ key.key }}</p>
                <p class="text-xs text-gray-500">创建于 {{ key.created_at }}</p>
              </div>
              <button @click="deleteKey(key.id)" class="text-red-600 hover:text-red-500">
                删除
              </button>
            </div>
          </div>
        </div>

        <!-- 组织设置 -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">组织</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">组织名称</label>
              <input v-model="orgName" type="text" class="input-field" />
            </div>
            <button class="btn-primary">保存更改</button>
          </div>
        </div>

        <!-- 通知设置 -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">通知</h2>
          <div class="space-y-3">
            <label class="flex items-center">
              <input v-model="notifications.email" type="checkbox" class="mr-2" />
              <span>邮件通知</span>
            </label>
            <label class="flex items-center">
              <input v-model="notifications.slack" type="checkbox" class="mr-2" />
              <span>Slack 通知</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const apiKeys = ref([
  { id: '1', key: 'sk-****-****-****-1234', created_at: '2024-01-15' },
])

const orgName = ref('Helicone 组织')

const notifications = ref({
  email: true,
  slack: false,
})

function generateApiKey() {
  const newKey = {
    id: String(Date.now()),
    key: `sk-****-****-****-${Math.random().toString(36).slice(-4)}`,
    created_at: new Date().toISOString().split('T')[0],
  }
  apiKeys.value.push(newKey)
}

function deleteKey(id: string) {
  apiKeys.value = apiKeys.value.filter(k => k.id !== id)
}
</script>
