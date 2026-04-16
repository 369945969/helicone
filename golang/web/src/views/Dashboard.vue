<template>
  <DefaultLayout>
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-6">仪表板</h1>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="stat in stats" :key="stat.name" class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <component :is="stat.icon" class="h-8 w-8" :class="stat.color" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">{{ stat.name }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-500">
            <span :class="stat.trend >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ stat.trend >= 0 ? '+' : '' }}{{ stat.trend }}%
            </span>
            较上周
          </div>
        </div>
      </div>

      <!-- 请求图表 -->
      <div class="card mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">请求趋势</h2>
        <div class="h-64 bg-gray-50 rounded flex items-center justify-center">
          <p class="text-gray-500">图表组件（使用 ECharts/Chart.js）</p>
        </div>
      </div>

      <!-- 最近请求 -->
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">最近请求</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">请求ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">模型</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">提供商</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">令牌</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成本</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="request in recentRequests" :key="request.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ request.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ request.model }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ request.provider }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ request.tokens }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${{ request.cost }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="request.status === '成功' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ request.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { RequestLog } from '@/types'

const stats = ref([
  { name: '总请求', value: '1.2M', trend: 12, icon: '📊', color: 'text-blue-500' },
  { name: '总令牌', value: '500M', trend: 8, icon: '🔤', color: 'text-green-500' },
  { name: '总成本', value: '$1.5K', trend: -5, icon: '💰', color: 'text-yellow-500' },
  { name: '平均延迟', value: '1.2s', trend: -3, icon: '⚡', color: 'text-purple-500' },
])

const recentRequests = ref<RequestLog[]>([
  { id: 'req_001', model: 'GPT-4', provider: 'OpenAI', tokens: 1234, cost: 0.04, status: '成功' },
  { id: 'req_002', model: 'Claude 3', provider: 'Anthropic', tokens: 2567, cost: 0.08, status: '成功' },
  { id: 'req_003', model: 'GPT-3.5', provider: 'OpenAI', tokens: 890, cost: 0.001, status: '处理中' },
])
</script>
