<template>
  <DefaultLayout>
    <div>
      <!-- 返回按钮 -->
      <button @click="router.push('/sessions')" class="btn-secondary mb-4">
        ← 返回会话列表
      </button>

      <!-- 会话标题 -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">{{ sessionName }}</h1>
        <p class="text-sm text-gray-500 mt-1">会话详情与指标</p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div v-for="stat in stats" :key="stat.name" class="card">
          <p class="text-sm font-medium text-gray-500">{{ stat.name }}</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
        </div>
      </div>

      <!-- 请求趋势图 -->
      <div class="card mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">请求趋势</h2>
        <div class="h-64 bg-gray-50 rounded flex items-center justify-center">
          <p class="text-gray-500">图表区域（使用 ECharts/Chart.js）</p>
        </div>
      </div>

      <!-- 模型分布 -->
      <div class="grid grid-cols-2 gap-6 mb-8">
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">模型使用</h2>
          <div class="space-y-3">
            <div v-for="model in modelUsage" :key="model.name">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-700">{{ model.name }}</span>
                <span class="text-gray-500">{{ model.percentage }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-primary-600 h-2 rounded-full"
                  :style="{ width: `${model.percentage}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">用户参与</h2>
          <div class="space-y-3">
            <div v-for="user in topUsers" :key="user.id" class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                <p class="text-xs text-gray-500">{{ user.request_count }} 个请求</p>
              </div>
              <span class="text-sm text-gray-500">${{ user.cost.toFixed(3) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 请求列表 -->
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">会话中的请求</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">请求 ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">模型</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">提供商</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">令牌</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成本</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">延迟</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="request in requests"
                :key="request.id"
                @click="viewRequest(request.id)"
                class="cursor-pointer hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-primary-600">
                  {{ request.id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ request.model }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ request.provider }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ request.tokens }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${{ request.cost.toFixed(4) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ request.latency }}ms</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(request.timestamp) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

interface Request {
  id: string
  model: string
  provider: string
  tokens: number
  cost: number
  latency: number
  timestamp: string
}

const route = useRoute()
const router = useRouter()

const sessionName = computed(() => (route.params.name as string) || '')

const stats = computed(() => [
  { name: '总请求数', value: '450' },
  { name: '总令牌', value: '125K' },
  { name: '总成本', value: '$0.85' },
  { name: '平均延迟', value: '1.2s' },
])

const modelUsage = ref([
  { name: 'GPT-4', percentage: 45 },
  { name: 'GPT-3.5 Turbo', percentage: 35 },
  { name: 'Claude 3', percentage: 20 },
])

const topUsers = ref([
  { id: 'user_001', name: '用户 A', request_count: 120, cost: 0.45 },
  { id: 'user_002', name: '用户 B', request_count: 85, cost: 0.28 },
  { id: 'user_003', name: '用户 C', request_count: 62, cost: 0.12 },
])

const requests = ref<Request[]>([
  {
    id: 'req_001',
    model: 'GPT-4',
    provider: 'OpenAI',
    tokens: 1234,
    cost: 0.04,
    latency: 1200,
    timestamp: '2024-01-20T10:30:00Z',
  },
  {
    id: 'req_002',
    model: 'Claude 3',
    provider: 'Anthropic',
    tokens: 2567,
    cost: 0.08,
    latency: 1500,
    timestamp: '2024-01-20T10:28:00Z',
  },
  {
    id: 'req_003',
    model: 'GPT-3.5',
    provider: 'OpenAI',
    tokens: 890,
    cost: 0.001,
    latency: 800,
    timestamp: '2024-01-20T10:25:00Z',
  },
])

function viewRequest(id: string) {
  router.push(`/requests/${id}`)
}

function formatDate(date: string): string {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>
