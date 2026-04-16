<template>
  <DefaultLayout>
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">请求日志</h1>
        <div class="flex space-x-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索请求..."
            class="input-field"
          />
          <select v-model="filterStatus" class="input-field w-40">
            <option value="">全部状态</option>
            <option value="成功">成功</option>
            <option value="处理中">处理中</option>
            <option value="失败">失败</option>
          </select>
        </div>
      </div>

      <!-- 请求表格 -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">请求ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">模型</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">提供商</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">输入令牌</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">输出令牌</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成本</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">延迟</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="request in filteredRequests" :key="request.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{{ request.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ request.model }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ request.provider }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ request.tokens_in }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ request.tokens_out }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${{ request.cost }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ request.latency }}ms</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(request.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ request.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button @click="viewRequest(request.id)" class="text-primary-600 hover:text-primary-500">
                    查看
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="flex justify-between items-center mt-4">
          <p class="text-sm text-gray-500">
            显示 {{ startIdx + 1 }} - {{ endIdx }} 条，共 {{ requests.length }} 条
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
              :disabled="endIdx >= requests.length"
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
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { RequestLog } from '@/types'

const requests = ref<RequestLog[]>([
  { id: 'req_001', model: 'GPT-4', provider: 'OpenAI', tokens_in: 100, tokens_out: 200, cost: 0.04, latency: 1200, status: '成功' },
  { id: 'req_002', model: 'Claude 3', provider: 'Anthropic', tokens_in: 200, tokens_out: 500, cost: 0.08, latency: 1500, status: '成功' },
  { id: 'req_003', model: 'GPT-3.5', provider: 'OpenAI', tokens_in: 50, tokens_out: 100, cost: 0.001, latency: 800, status: '成功' },
  { id: 'req_004', model: 'GPT-4', provider: 'OpenAI', tokens_in: 150, tokens_out: 300, cost: 0.05, latency: 1300, status: '处理中' },
])

const searchQuery = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = 10

const startIdx = computed(() => (currentPage.value - 1) * pageSize)
const endIdx = computed(() => Math.min(startIdx.value + pageSize, requests.value.length))

const filteredRequests = computed(() => {
  let filtered = requests.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(r =>
      r.id.toLowerCase().includes(query) ||
      r.model.toLowerCase().includes(query) ||
      r.provider.toLowerCase().includes(query)
    )
  }
  
  if (filterStatus.value) {
    filtered = filtered.filter(r => r.status === filterStatus.value)
  }
  
  return filtered.slice(startIdx.value, endIdx.value)
})

function getStatusClass(status: string) {
  switch (status) {
    case '成功': return 'bg-green-100 text-green-800'
    case '处理中': return 'bg-yellow-100 text-yellow-800'
    case '失败': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function viewRequest(id: string) {
  console.log('View request:', id)
}
</script>
