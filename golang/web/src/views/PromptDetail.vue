<template>
  <DefaultLayout>
    <div>
      <!-- 返回按钮 -->
      <button @click="router.push('/prompts')" class="btn-secondary mb-4">
        ← 返回提示词列表
      </button>

      <!-- 提示词标题 -->
      <div class="mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ prompt?.name }}</h1>
            <p class="text-sm text-gray-500 mt-1">{{ prompt?.description }}</p>
          </div>
          <div class="flex space-x-3">
            <button @click="showEditDialog = true" class="btn-secondary">编辑</button>
            <button @click="runExperiment" class="btn-primary">运行实验</button>
          </div>
        </div>
      </div>

      <!-- 标签 -->
      <div class="flex flex-wrap gap-2 mb-6">
        <span
          v-for="tag in prompt?.tags"
          :key="tag"
          class="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
        >
          {{ tag }}
        </span>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div v-for="stat in stats" :key="stat.name" class="card">
          <p class="text-sm font-medium text-gray-500">{{ stat.name }}</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
        </div>
      </div>

      <!-- 提示词模板 -->
      <div class="card mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">提示词模板</h2>
          <span class="text-sm text-gray-500">版本 {{ prompt?.version }}</span>
        </div>
        <pre class="bg-gray-50 p-4 rounded-lg overflow-x-auto"><code class="text-sm">{{ prompt?.template }}</code></pre>
        
        <!-- 变量列表 -->
        <div class="mt-4">
          <h3 class="text-sm font-medium text-gray-700 mb-2">变量：</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="variable in variables"
              :key="variable"
              class="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded font-mono"
            >
              {{ variable }}
            </span>
          </div>
        </div>
      </div>

      <!-- 版本历史 -->
      <div class="card mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">版本历史</h2>
        <div class="space-y-3">
          <div
            v-for="version in versions"
            :key="version.version"
            class="flex justify-between items-center p-4 border rounded hover:bg-gray-50 cursor-pointer"
            :class="{ 'bg-primary-50 border-primary-200': version.version === prompt?.version }"
          >
            <div>
              <p class="font-medium text-gray-900">{{ version.version }}</p>
              <p class="text-sm text-gray-500">{{ version.description }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">{{ formatDate(version.created_at) }}</p>
              <p class="text-xs text-gray-400">{{ version.author }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用统计 -->
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">使用统计</h2>
        <div class="h-64 bg-gray-50 rounded flex items-center justify-center">
          <p class="text-gray-500">请求趋势图表区域</p>
        </div>
      </div>

      <!-- 编辑对话框 -->
      <div v-if="showEditDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
          <h2 class="text-xl font-semibold mb-4">编辑提示词</h2>
          
          <form @submit.prevent="saveChanges" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">名称</label>
              <input v-model="editForm.name" type="text" required class="input-field" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea v-model="editForm.description" rows="2" class="input-field"></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">模板</label>
              <textarea v-model="editForm.template" rows="8" required class="input-field font-mono text-sm"></textarea>
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button type="submit" class="btn-primary flex-1">保存为新版本</button>
              <button type="button" @click="showEditDialog = false" class="btn-secondary flex-1">取消</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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

interface Version {
  version: string
  description: string
  created_at: string
  author: string
}

const route = useRoute()
const router = useRouter()

const promptId = computed(() => route.params.id as string)
const showEditDialog = ref(false)

const prompt = ref<Prompt | null>(null)
const variables = ref<string[]>([])
const versions = ref<Version[]>([
  {
    version: 'v1.2',
    description: '更新问候语模板',
    created_at: '2024-01-20T10:30:00Z',
    author: '张三',
  },
  {
    version: 'v1.1',
    description: '添加更多变量支持',
    created_at: '2024-01-18T14:20:00Z',
    author: '李四',
  },
  {
    version: 'v1.0',
    description: '初始版本',
    created_at: '2024-01-15T09:00:00Z',
    author: '张三',
  },
])

const editForm = ref({
  name: '',
  description: '',
  template: '',
})

const stats = computed(() => [
  { name: '总请求数', value: prompt.value?.request_count.toString() || '0' },
  { name: '当前版本', value: prompt.value?.version || 'v1.0' },
  { name: '变量数', value: variables.value.length.toString() },
  { name: '版本数', value: versions.value.length.toString() },
])

onMounted(() => {
  // 模拟加载提示词数据
  prompt.value = {
    id: promptId.value,
    name: '客服问候',
    description: '用于客户服务的标准问候语模板',
    template: '您好！我是客服助手 {{name}}，有什么可以帮您的吗？',
    version: 'v1.2',
    tags: ['客服', '问候'],
    request_count: 450,
    updated_at: '2024-01-20T10:30:00Z',
  }
  
  // 提取变量
  const matches = prompt.value.template.match(/\{\{(\w+)\}\}/g)
  if (matches) {
    variables.value = [...new Set(matches.map(m => m.replace(/[{}]/g, '')))]
  }
  
  editForm.value = {
    name: prompt.value.name,
    description: prompt.value.description,
    template: prompt.value.template,
  }
})

function formatDate(date: string): string {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function saveChanges() {
  if (!prompt.value) return
  
  const newVersion = `v${parseInt(prompt.value.version.split('.')[1]) + 1}.0`
  
  versions.value.unshift({
    version: newVersion,
    description: '手动更新',
    created_at: new Date().toISOString(),
    author: '当前用户',
  })
  
  prompt.value = {
    ...prompt.value,
    name: editForm.value.name,
    description: editForm.value.description,
    template: editForm.value.template,
    version: newVersion,
    updated_at: new Date().toISOString(),
  }
  
  showEditDialog.value = false
}

function runExperiment() {
  router.push('/experiments')
}
</script>
