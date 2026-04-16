<template>
  <DefaultLayout>
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">评估器</h1>
        <button @click="router.push('/evaluators/create')" class="btn-primary">
          + 创建评估器
        </button>
      </div>

      <!-- 评估器卡片 -->
      <div class="space-y-6">
        <div
          v-for="evaluator in evaluators"
          :key="evaluator.id"
          class="card hover:shadow-lg transition-shadow"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h3 class="text-lg font-semibold text-gray-900">{{ evaluator.name }}</h3>
                <span :class="getStatusClass(evaluator.status)" class="px-2 py-1 text-xs rounded-full">
                  {{ evaluator.status }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-3">{{ evaluator.description }}</p>
              
              <!-- 评估器类型和配置 -->
              <div class="flex space-x-6 text-sm">
                <span class="text-gray-500">类型：<span class="text-gray-900">{{ evaluator.type }}</span></span>
                <span class="text-gray-500">运行次数：<span class="text-gray-900">{{ evaluator.run_count }}</span></span>
                <span class="text-gray-500">平均分：<span class="text-gray-900">{{ evaluator.avg_score.toFixed(2) }}</span></span>
              </div>
            </div>
            
            <div class="flex space-x-2">
              <button @click="viewEvaluator(evaluator.id)" class="btn-secondary">查看详情</button>
              <button @click="runEvaluator(evaluator.id)" class="btn-primary">运行</button>
            </div>
          </div>

          <!-- 评分图表 -->
          <div v-if="evaluator.scores" class="mt-4 pt-4 border-t">
            <div class="grid grid-cols-5 gap-4">
              <div v-for="score in evaluator.scores" :key="score.criterion" class="text-center">
                <p class="text-xs text-gray-500 mb-1">{{ score.criterion }}</p>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-primary-600 h-2 rounded-full"
                    :style="{ width: `${(score.value / score.max) * 100}%` }"
                  ></div>
                </div>
                <p class="text-sm font-medium mt-1">{{ score.value }}/{{ score.max }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="evaluators.length === 0" class="card text-center py-12">
        <p class="text-gray-500 mb-4">还没有评估器</p>
        <button @click="router.push('/evaluators/create')" class="btn-primary">
          创建第一个评估器
        </button>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

interface Score {
  criterion: string
  value: number
  max: number
}

interface Evaluator {
  id: string
  name: string
  description: string
  type: string
  status: '运行中' | '已停止' | '草稿'
  run_count: number
  avg_score: number
  scores?: Score[]
}

const router = useRouter()

const evaluators = ref<Evaluator[]>([
  {
    id: 'eval_001',
    name: '回复质量评估',
    description: '评估 AI 回复的准确性、相关性和完整性',
    type: 'LLM 评分',
    status: '运行中',
    run_count: 1250,
    avg_score: 4.35,
    scores: [
      { criterion: '准确性', value: 4.5, max: 5 },
      { criterion: '相关性', value: 4.2, max: 5 },
      { criterion: '完整性', value: 4.3, max: 5 },
      { criterion: '清晰度', value: 4.5, max: 5 },
      { criterion: '安全性', value: 4.2, max: 5 },
    ],
  },
  {
    id: 'eval_002',
    name: '代码质量检查',
    description: '检查生成代码的安全性、性能和最佳实践',
    type: '自动化检查',
    status: '运行中',
    run_count: 850,
    avg_score: 3.85,
    scores: [
      { criterion: '安全性', value: 3.8, max: 5 },
      { criterion: '性能', value: 3.9, max: 5 },
      { criterion: '可读性', value: 4.0, max: 5 },
      { criterion: '覆盖率', value: 3.7, max: 5 },
      { criterion: '规范', value: 3.9, max: 5 },
    ],
  },
  {
    id: 'eval_003',
    name: '情感分析',
    description: '分析回复的情感倾向和语气',
    type: '分类器',
    status: '草稿',
    run_count: 0,
    avg_score: 0,
  },
])

function getStatusClass(status: string): string {
  switch (status) {
    case '运行中': return 'bg-green-100 text-green-800'
    case '已停止': return 'bg-gray-100 text-gray-800'
    case '草稿': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function viewEvaluator(id: string) {
  router.push(`/evaluators/${id}`)
}

function runEvaluator(id: string) {
  // TODO: 实现运行逻辑
  console.log('Running evaluator:', id)
}
</script>
