<template>
  <DefaultLayout>
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">提示词</h1>
        <button @click="showCreateDialog = true" class="btn-primary">
          + 创建提示词
        </button>
      </div>

      <!-- 搜索和筛选 -->
      <div class="flex space-x-4 mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索提示词..."
          class="input-field flex-1"
        />
        <select v-model="filterTag" class="input-field w-40">
          <option value="">所有标签</option>
          <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
      </div>

      <!-- 提示词卡片网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="prompt in filteredPrompts"
          :key="prompt.id"
          class="card cursor-pointer hover:shadow-lg transition-shadow"
          @click="viewPrompt(prompt.id)"
        >
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-semibold text-gray-900">{{ prompt.name }}</h3>
            <span class="text-xs text-gray-500">{{ prompt.version }}</span>
          </div>
          <p class="text-sm text-gray-600 mb-4 line-clamp-3">{{ prompt.description }}</p>
          
          <!-- 标签 -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="tag in prompt.tags"
              :key="tag"
              class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {{ tag }}
            </span>
          </div>

          <!-- 统计信息 -->
          <div class="flex justify-between text-xs text-gray-500 pt-3 border-t">
            <span>{{ prompt.request_count }} 个请求</span>
            <span>更新于 {{ formatDate(prompt.updated_at) }}</span>
          </div>
        </div>
      </div>

      <!-- 创建提示词对话框 -->
      <div v-if="showCreateDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-semibold mb-4">创建新提示词</h2>
          
          <form @submit.prevent="createPrompt" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">名称</label>
              <input v-model="newPrompt.name" type="text" required class="input-field" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea v-model="newPrompt.description" rows="3" class="input-field"></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">提示词模板</label>
              <textarea v-model="newPrompt.template" rows="6" required class="input-field font-mono text-sm" placeholder="你好，{{name}}！"></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">标签（逗号分隔）</label>
              <input v-model="newPrompt.tagsInput" type="text" class="input-field" placeholder="客服, 问候" />
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button type="submit" class="btn-primary flex-1">创建</button>
              <button type="button" @click="showCreateDialog = false" class="btn-secondary flex-1">取消</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

interface Prompt {
  id: string
  name: string
  description: string
  template: string
  version: string
  tags: string[]
  request_count: number
  updated_at: string
}

const router = useRouter()

const prompts = ref<Prompt[]>([
  {
    id: 'prompt_001',
    name: '客服问候',
    description: '用于客户服务的标准问候语模板',
    template: '您好！我是客服助手，有什么可以帮您的吗？',
    version: 'v1.2',
    tags: ['客服', '问候'],
    request_count: 450,
    updated_at: '2024-01-20T10:30:00Z',
  },
  {
    id: 'prompt_002',
    name: '代码审查',
    description: '自动代码审查和优化的提示词',
    template: '请审查以下代码并提供优化建议：\n\n{{code}}',
    version: 'v2.0',
    tags: ['开发', '代码审查'],
    request_count: 320,
    updated_at: '2024-01-19T15:20:00Z',
  },
  {
    id: 'prompt_003',
    name: '文档生成',
    description: '自动生成技术文档的模板',
    template: '为以下代码生成文档：\n\n{{code}}\n\n要求：{{requirements}}',
    version: 'v1.0',
    tags: ['文档', '开发'],
    request_count: 210,
    updated_at: '2024-01-18T09:45:00Z',
  },
])

const searchQuery = ref('')
const filterTag = ref('')
const showCreateDialog = ref(false)

const newPrompt = ref({
  name: '',
  description: '',
  template: '',
  tagsInput: '',
})

const allTags = computed(() => {
  const tags = new Set<string>()
  prompts.value.forEach(p => p.tags.forEach(tag => tags.add(tag)))
  return Array.from(tags)
})

const filteredPrompts = computed(() => {
  let filtered = prompts.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  if (filterTag.value) {
    filtered = filtered.filter(p => p.tags.includes(filterTag.value))
  }
  
  return filtered
})

function viewPrompt(id: string) {
  router.push(`/prompts/${id}`)
}

function createPrompt() {
  const tags = newPrompt.value.tagsInput
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag)
  
  const prompt: Prompt = {
    id: `prompt_${Date.now()}`,
    name: newPrompt.value.name,
    description: newPrompt.value.description,
    template: newPrompt.value.template,
    version: 'v1.0',
    tags,
    request_count: 0,
    updated_at: new Date().toISOString(),
  }
  
  prompts.value.push(prompt)
  showCreateDialog.value = false
  newPrompt.value = { name: '', description: '', template: '', tagsInput: '' }
}

function formatDate(date: string): string {
  const d = new Date(date)
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${days[d.getDay()]}`
}
</script>
