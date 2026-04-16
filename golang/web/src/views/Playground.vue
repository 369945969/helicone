<template>
  <DefaultLayout>
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Playground</h1>
      
      <div class="grid grid-cols-2 gap-6">
        <!-- 配置面板 -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">配置</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">模型</label>
              <select v-model="config.model" class="input-field">
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">温度</label>
              <input v-model.number="config.temperature" type="range" min="0" max="2" step="0.1" class="w-full" />
              <div class="text-sm text-gray-500 mt-1">{{ config.temperature }}</div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">最大令牌</label>
              <input v-model.number="config.maxTokens" type="number" class="input-field" />
            </div>
          </div>
        </div>

        <!-- 聊天面板 -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">对话</h2>
          
          <div class="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded">
            <div v-for="(msg, idx) in messages" :key="idx" class="mb-3">
              <div class="flex items-start space-x-2">
                <span class="text-sm font-bold" :class="msg.role === 'user' ? 'text-blue-600' : 'text-green-600'">
                  {{ msg.role === 'user' ? '用户' : '助手' }}:
                </span>
                <span class="text-gray-700">{{ msg.content }}</span>
              </div>
            </div>
          </div>
          
          <div class="flex space-x-2">
            <input
              v-model="userInput"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="输入消息..."
              class="input-field flex-1"
            />
            <button @click="sendMessage" class="btn-primary" :disabled="loading">
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const config = ref({
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
})

const messages = ref<Message[]>([])
const userInput = ref('')
const loading = ref(false)

async function sendMessage() {
  if (!userInput.value.trim()) return
  
  messages.value.push({ role: 'user', content: userInput.value })
  const prompt = userInput.value
  userInput.value = ''
  loading.value = true
  
  try {
    // TODO: 调用 API
    await new Promise(resolve => setTimeout(resolve, 1000))
    messages.value.push({ role: 'assistant', content: '这是模拟的助手响应。' })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}
</script>
