import { defineStore } from 'pinia'
import { ref } from 'vue'

export type TimeFilter = '1h' | '24h' | '7d' | '30d' | '3m' | '12m' | 'custom'

export const useTimeFilterStore = defineStore('timeFilter', () => {
  const timeFilter = ref<TimeFilter>('7d')
  const customStart = ref<string | null>(null)
  const customEnd = ref<string | null>(null)

  function setTimeFilter(filter: TimeFilter, start?: string, end?: string) {
    timeFilter.value = filter
    if (filter === 'custom' && start && end) {
      customStart.value = start
      customEnd.value = end
    }
  }

  function getStartDate(): string {
    const now = new Date()
    switch (timeFilter.value) {
      case '1h': return new Date(now.getTime() - 3600000).toISOString()
      case '24h': return new Date(now.getTime() - 86400000).toISOString()
      case '7d': return new Date(now.getTime() - 7 * 86400000).toISOString()
      case '30d': return new Date(now.getTime() - 30 * 86400000).toISOString()
      case '3m': return new Date(now.getTime() - 90 * 86400000).toISOString()
      case '12m': return new Date(now.getTime() - 365 * 86400000).toISOString()
      case 'custom': return customStart.value || new Date(now.getTime() - 7 * 86400000).toISOString()
      default: return new Date(now.getTime() - 7 * 86400000).toISOString()
    }
  }

  function getEndDate(): string {
    return customEnd.value || new Date().toISOString()
  }

  return {
    timeFilter,
    customStart,
    customEnd,
    setTimeFilter,
    getStartDate,
    getEndDate,
  }
})
