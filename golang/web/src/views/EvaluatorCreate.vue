<template>
  <DefaultLayout>
    <div>
      <button @click="router.push('/evaluators')" class="btn-secondary mb-4">
        ← 返回评估器列表
      </button>

      <h1 class="text-3xl font-bold text-gray-900 mb-6">创建评估器</h1>

      <form @submit.prevent="createEvaluator" class="space-y-6">
        <!-- 基本信息 -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">基本信息</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">名称 *</label>
              <input v-model="form.name" type="text" required class="input-field" placeholder="例如：回复质量评估" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea v-model="form.description" rows="3" class="input-field" placeholder="描述这个评估器的用途"></textarea>
            </div>
          </div>
        </div>

        <!-- 评估类型 -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">评估类型</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">类型 *</label>
              <select v-model="form.type" required class="input-field">
                <option value="">选择类型</option>
                <option value="LLM 评分">LLM 评分（使用 AI 评估）</option>
                <option value="自动化检查">自动化检查（基于规则）</option>
                <option value="分类器">分类器</option>
                <option value="回归">回归分析</option>
              </select>
            </div>

            <div v-if="form.type === 'LLM 评分'">
              <label class="block text-sm font-medium text-gray-700 mb-1">评估模型</label>
              <select v-model="form.model" class="input-field">
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              </select>
            </div>

            <div v-if="form.type === 'LLM 评分'">
              <label class="block text-sm font-medium text-gray-700 mb-1">评估提示词 *</label>
              <textarea
                v-model="form.evalPrompt"
                rows="8"
                required
                class="input-field font-mono text-sm"
                placeholder="请评估以下回复的质量：&#10;&#10;输入：{{input}}&#10;回复：{{output}}&#10;&#10;请从以下维度评分（1-5）：&#10;- 准确性&#10;- 相关性&#10;- 完整性"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 评分标准 -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">评分标准</h2>
          <div class="space-y-3">
            <div v-for="(criterion, index) in form.criteria" :key="index" class="flex space-x-3 items-start">
              <div class="flex-1">
                <input
                  v-model="criterion.name"
                  type="text"
                  class="input-field"
                  placeholder="标准名称（如：准确性）"
                />
              </div>
              <div class="w-32">
                <select v-model="criterion.maxScore" class="input-field">
                  <option :value="5">5 分制</option>
                  <option :value="10">10 分制</option>
                  <option :value="100">100 分制</option>
                </select>
              </div>
              <button
                type="button"
                @click="removeCriterion(index)"
                class="text-red-600 hover:text-red-500 p-2"
                v-if="form.criteria.length > 1"
              >
                删除
              </button>
            </div>
            <button type="button" @click="addCriterion" class="btn-secondary w-full">
              + 添加评分标准
            </button>
          </div>
        </div>

        <!-- 数据源配置 -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">数据源</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">数据来源</label>
              <select v-model="form.dataSource" class="input-field">
                <option value="requests">请求日志</option>
                <option value="dataset">数据集</option>
                <option value="manual">手动输入</option>
              </select>
            </div>

            <div v-if="form.dataSource === 'requests'">
              <label class="block text-sm font-medium text-gray-700 mb-1">时间范围</label>
              <select v-model="form.timeRange" class="input-field">
                <option value="1h">过去 1 小时</option>
                <option value="24h">过去 24 小时</option>
                <option value="7d">过去 7 天</option>
                <option value="30d">过去 30 天</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="flex space-x-4">
          <button type="submit" class="btn-primary flex-1">创建评估器</button>
          <button type="button" @click="router.push('/evaluators')" class="btn-secondary flex-1">取消</button>
        </div>
      </form>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const notification = useNotificationStore()

interface Criterion {
  name: string
  maxScore: number
}

const form = ref({
  name: '',
  description: '',
  type: '',
  model: 'gpt-4',
  evalPrompt: '',
  dataSource: 'requests',
  timeRange: '7d',
  criteria: [
    { name: '准确性', maxScore: 5 },
    { name: '相关性', maxScore: 5 },
  ] as Criterion[],
})

function addCriterion() {
  form.value.criteria.push({ name: '', maxScore: 5 })
}

function removeCriterion(index: number) {
  form.value.criteria.splice(index, 1)
}

function createEvaluator() {
  // TODO: 调用 API 创建评估器
  notification.success('评估器创建成功')
  router.push('/evaluators')
}
</script>
