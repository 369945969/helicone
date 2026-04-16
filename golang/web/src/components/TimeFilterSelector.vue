<template>
  <select v-model="model" class="input-field w-32">
    <option value="1h">过去 1 小时</option>
    <option value="24h">过去 24 小时</option>
    <option value="7d">过去 7 天</option>
    <option value="30d">过去 30 天</option>
    <option value="3m">过去 3 个月</option>
    <option value="12m">过去 12 个月</option>
    <option value="custom">自定义</option>
  </select>
</template>

<script setup lang="ts">
import { useTimeFilterStore } from '@/stores/timeFilter'
import { computed } from 'vue'

const store = useTimeFilterStore()

const model = computed({
  get: () => store.timeFilter,
  set: (value) => store.setTimeFilter(value),
})
</script>
