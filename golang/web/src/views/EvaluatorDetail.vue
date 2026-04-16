<template>
  <DefaultLayout>
    <div>
      <button @click="router.push('/evaluators')" class="btn-secondary mb-4">
        ← 返回评估器列表
      </button>

      <!-- 标题 -->
      <div class="flex justify-between items-start mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ evaluator?.name }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ evaluator?.description }}</p>
        </div>
        <div class="flex space-x-3">
          <button @click="runEvaluator" class="btn-primary">运行评估</button>
          <button @click="showConfigDialog = true" class="btn-secondary">配置</button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div v-for="stat in stats" :key="stat.name" class="card">
          <p class="text-sm font-medium text-gray-500">{{ stat.name }}</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
        </div>
      </div>

      <!-- 评分分布 -->
      <div class="grid grid-cols-2 gap-6 mb-8">
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">评分分布</h2>
          <div class="space-y-3">
            <div v-for="criterion in evaluator?.criteria" :key="criterion.name">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-700">{{ criterion.name }}</span>
                <span class="text-gray-500">{{ criterion.avg_score.toFixed(2) }}/{{ criterion.max_score }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  class="bg-primary-600 h-3 rounded-full"
                  :style="{ width: `${(criterion.avg_score / criterion.max_score) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">分数趋势</h2>
          <div class="h-64 bg-gray-50 rounded flex items-center justify-center">
            <p class="text-gray-500">分数趋势图表</p>
          </div>
        </div>
      </div>

      <!-- 最近评估结果 -->
      <div class="card mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">最近评估结果</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">请求 ID</th>
                <th v-for="criterion in evaluator?.criteria" :key="criterion.name" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {{ criterion.name }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">平均分</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="result in recentResults" :key="result.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-primary-600">
                  <router-link :to="`/requests/${result.request_id}`">{{ result.request_id }}</router-link>
                </td>
                <td v-for="criterion in evaluator?.criteria" :key="criterion.name" class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="getScoreColor(result.scores[criterion.name])">
                    {{ result.scores[criterion.name]?.toFixed(1) || '-' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {{ result.avg_score.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(result.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button @click="viewDetails(result)" class="text-primary-600 hover:text-primary-500">
                    查看详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 配置对话框 -->
      <div v-if="showConfigDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
          <h2 class="text-xl font-semibold mb-4">评估器配置</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">评估频率</label>
              <select v-model="config.frequency" class="input-field">
                <option value="realtime">实时</option>
                <option value="hourly">每小时</option>
                <option value="daily">每天</option>
                <option value="manual">手动</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">抽样率</label>
              <input v-model.number="config.sampleRate" type="range" min="1" max="100" class="w-full" />
              <p class="text-sm text-gray-500 mt-1">{{ config.sampleRate }}%</p>
            </div>
            <div class="flex space-x-3 pt-4">
              <button @click="saveConfig" class="btn-primary flex-1">保存</button>
              <button @click="showConfigDialog = false" class="btn-secondary flex-1">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useNotificationStore } from '@/stores/notification'

const route = useRoute()
const router = useRouter()
const notification = useNotificationStore()
const showConfigDialog = ref(false)

const evaluator = ref({
  id: route.params.id as string,
  name: '回复质量评估',
  description: '评估 AI 回复的准确性、相关性和完整性',
  criteria: [
    { name: '准确性', avg_score: 4.5, max_score: 5 },
    { name: '相关性', avg_score: 4.2, max_score: 5 },
    { name: '完整性', avg_score: 4.3, max_score: 5 },
    { name: '清晰度', avg_score: 4.5, max_score: 5 },
    { name: '安全性', avg_score: 4.2, max_score: 5 },
  ],
  total_evaluations: 1250,
  avg_score: 4.35,
})

const recentResults = ref([
  {
    id: 'result_001',
    request_id: 'req_001',
    scores: { '准确性': 4.5, '相关性': 4.2, '完整性': 4.3, '清晰度': 4.5, '安全性': 4.2 },
    avg_score: 4.34,
    created_at: '2024-01-20T10:30:00Z',
  },
  {
    id: 'result_002',
    request_id: 'req_002',
    scores: { '准确性': 4.0, '相关性': 4.5, '完整性': 4.0, '清晰度': 4.3, '安全性': 4.5 },
    avg_score: 4.26,
    created_at: '2024-01-20T10:25:00Z',
  },
  {
    id: 'result_003',
    request_id: 'req_003',
    scores: { '准确性': 4.8, '相关性': 4.0, '完整性': 4.5, '清晰度': 4.7, '安全性': 4.0 },
    avg_score: 4.40,
    created_at: '2024-01-20T10:20:00Z',
  },
])

const config = ref({
  frequency: 'realtime',
  sampleRate: 100,
})

const stats = computed(() => [
  { name: '总评估数', value: evaluator.value?.total_evaluations.toString() || '0' },
  { name: '平均分', value: evaluator.value?.avg_score.toFixed(2) || '0' },
  { name: '评分标准', value: evaluator.value?.criteria.length.toString() || '0' },
  { name: '评估频率', value: '实时' },
])

function getScoreColor(score: number): string {
  if (!score) return 'text-gray-400'
  if (score >= 4.5) return 'text-green-600 font-medium'
  if (score >= 3.5) return 'text-yellow-600'
  return 'text-red-600'
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function runEvaluator() {
  notification.info('评估任务已启动')
}

function viewDetails(result: any) {
  // TODO: 显示评估详情
  console.log('View details:', result)
}

function saveConfig() {
  notification.success('配置已保存')
  showConfigDialog.value = false
}
</script>
