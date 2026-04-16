<template>
  <DefaultLayout>
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-6">账单设置</h1>

      <!-- 当前计划 -->
      <div class="card mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-xl font-semibold mb-2">当前计划</h2>
            <p class="text-3xl font-bold text-primary-600">{{ plan.name }}</p>
            <p class="text-gray-600 mt-1">{{ plan.description }}</p>
          </div>
          <button @click="showUpgradeModal = true" class="btn-primary">升级计划</button>
        </div>
        <div class="mt-4 pt-4 border-t">
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-500">月请求数：</span>
              <span class="font-medium">{{ plan.monthly_requests }}</span>
            </div>
            <div>
              <span class="text-gray-500">月费用：</span>
              <span class="font-medium">${{ plan.monthly_cost }}</span>
            </div>
            <div>
              <span class="text-gray-500">下次续费：</span>
              <span class="font-medium">{{ plan.next_billing_date }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用量 -->
      <div class="card mb-6">
        <h2 class="text-xl font-semibold mb-4">本月使用量</h2>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-700">请求数</span>
              <span class="text-gray-500">{{ usage.requests }} / {{ plan.monthly_requests }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                :class="getUsageColor(usage.requests, plan.monthly_requests)"
                class="h-3 rounded-full"
                :style="{ width: `${Math.min((usage.requests / plan.monthly_requests) * 100, 100)}%` }"
              ></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-700">存储量</span>
              <span class="text-gray-500">{{ usage.storage }}GB / {{ plan.storage_limit }}GB</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                :class="getUsageColor(usage.storage, plan.storage_limit)"
                class="h-3 rounded-full"
                :style="{ width: `${Math.min((usage.storage / plan.storage_limit) * 100, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 发票历史 -->
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">发票历史</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">发票号</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="invoice in invoices" :key="invoice.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ invoice.date }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{{ invoice.number }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${{ invoice.amount }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(invoice.status)" class="px-2 py-1 text-xs rounded-full">
                    {{ invoice.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button class="text-primary-600 hover:text-primary-500">下载</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 升级对话框 -->
      <div v-if="showUpgradeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
          <h2 class="text-xl font-semibold mb-4">选择计划</h2>
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div
              v-for="tier in plans"
              :key="tier.name"
              class="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              :class="{ 'border-primary-500 bg-primary-50': tier.name === plan.name }"
              @click="selectedPlan = tier"
            >
              <h3 class="font-semibold text-lg">{{ tier.name }}</h3>
              <p class="text-2xl font-bold mt-2">${{ tier.price }}<span class="text-sm font-normal text-gray-500">/月</span></p>
              <ul class="mt-4 space-y-2 text-sm text-gray-600">
                <li v-for="feature in tier.features" :key="feature">✓ {{ feature }}</li>
              </ul>
            </div>
          </div>
          <div class="flex space-x-3">
            <button @click="upgradePlan" class="btn-primary flex-1">确认升级</button>
            <button @click="showUpgradeModal = false" class="btn-secondary flex-1">取消</button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const showUpgradeModal = ref(false)
const selectedPlan = ref<any>(null)

const plan = ref({
  name: '专业版',
  description: '适合成长中的团队',
  monthly_requests: 100000,
  monthly_cost: 99,
  storage_limit: 50,
  next_billing_date: '2024-02-20',
})

const usage = ref({
  requests: 65000,
  storage: 28,
})

const invoices = ref([
  { id: 'inv_001', date: '2024-01-20', number: 'INV-2024-001', amount: 99, status: '已支付' },
  { id: 'inv_002', date: '2023-12-20', number: 'INV-2023-012', amount: 99, status: '已支付' },
  { id: 'inv_003', date: '2023-11-20', number: 'INV-2023-011', amount: 99, status: '已支付' },
])

const plans = [
  {
    name: '免费版',
    price: 0,
    features: ['10K 请求/月', '1GB 存储', '社区支持'],
  },
  {
    name: '专业版',
    price: 99,
    features: ['100K 请求/月', '50GB 存储', '优先支持', '高级分析'],
  },
  {
    name: '企业版',
    price: 299,
    features: ['无限请求', '500GB 存储', '专属支持', 'SLA', '自定义集成'],
  },
]

function getUsageColor(current: number, limit: number): string {
  const percentage = current / limit
  if (percentage >= 0.9) return 'bg-red-600'
  if (percentage >= 0.7) return 'bg-yellow-600'
  return 'bg-primary-600'
}

function getStatusClass(status: string): string {
  return status === '已支付' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
}

function upgradePlan() {
  if (selectedPlan.value) {
    plan.value = selectedPlan.value
    showUpgradeModal.value = false
  }
}
</script>
