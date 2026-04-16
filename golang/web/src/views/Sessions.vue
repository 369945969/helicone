<template>
  <DefaultLayout>
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">会话</h1>
        <div class="flex space-x-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索会话..."
            class="input-field"
          />
          <TimeFilterSelector />
        </div>
      </div>

      <!-- 会话统计 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div v-for="stat in stats" :key="stat.name" class="card">
          <p class="text-sm font-medium text-gray-500">{{ stat.name }}</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ stat.description }}</p>
        </div>
      </div>

      <!-- 会话表格 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">会话名称</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">请求数</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">总令牌</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">总成本</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">平均延迟</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最后活动</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="session in filteredSessions"
                :key="session.id"
                @click="viewSession(session.name)"
                class="cursor-pointer hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                  {{ session.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ session.user_count }} 个用户
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ session.request_count }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatNumber(session.total_tokens) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${{ session.total_cost.toFixed(4) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ session.avg_latency.toFixed(0) }}ms
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(session.last_active) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="flex justify-between items-center mt-4">
          <p class="text-sm text-gray-500">
            显示 {{ startIdx + 1 }} - {{ endIdx }} 条，共 {{ sessions.length }} 条
          </p>
          <div class="flex space-x-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="btn-secondary"
            >
              上一页
            </button>
            <button
              @click="currentPage++"
              :disabled="endIdx >= sessions.length"
              class="btn-secondary"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import TimeFilterSelector from '@/components/TimeFilterSelector.vue'

interface Session {
  id: string
  name: string
  user_count: number
  request_count: number
  total_tokens: number
  total_cost: number
  avg_latency: number
  last_active: string
}

const router = useRouter()

const sessions = ref<Session[]>([
  {
    id: 'sess_001',
    name: '用户登录流程',
    user_count: 150,
    request_count: 450,
    total_tokens: 125000,
    total_cost: 0.85,
    avg_latency: 1200,
    last_active: '2024-01-20T10:30:00Z',
  },
  {
    id: 'sess_002',
    name: '客服对话',
    user_count: 85,
    request_count: 320,
    total_tokens: 98000,
    total_cost: 0.62,
    avg_latency: 1500,
    last_active: '2024-01-20T09:15:00Z',
  },
  {
    id: 'sess_003',
    name: '代码生成',
    user_count: 42,
    request_count: 210,
    total_tokens: 156000,
    total_cost: 1.20,
    avg_latency: 2300,
    last_active: '2024-01-20T08:45:00Z',
  },
])

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10

const startIdx = computed(() => (currentPage.value - 1) * pageSize)
const endIdx = computed(() => Math.min(startIdx.value + pageSize, sessions.value.length))

const stats = computed(() => [
  { name: '总会话数', value: sessions.value.length.toString(), description: '过去 7 天' },
  { name: '总请求数', value: formatNumber(sessions.value.reduce((sum, s) => sum + s.request_count, 0)), description: '所有会话' },
  { name: '总成本', value: `$${sessions.value.reduce((sum, s) => sum + s.total_cost, 0).toFixed(2)}`, description: '所有会话' },
])

const filteredSessions = computed(() => {
  if (!searchQuery.value) return sessions.value.slice(startIdx.value, endIdx.value)
  const query = searchQuery.value.toLowerCase()
  return sessions.value
    .filter(s => s.name.toLowerCase().includes(query))
    .slice(startIdx.value, endIdx.value)
})

function viewSession(name: string) {
  router.push(`/sessions/${encodeURIComponent(name)}`)
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatDate(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return '刚刚'
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}
</script>
