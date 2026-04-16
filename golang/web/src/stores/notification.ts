import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  description?: string
  duration?: number
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])

  function addNotification(notification: Omit<Notification, 'id'>) {
    const id = Math.random().toString(36).slice(2)
    const newNotification: Notification = { ...notification, id }
    notifications.value.push(newNotification)

    const duration = notification.duration ?? 3000
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clearAll() {
    notifications.value = []
  }

  // Convenience methods
  function success(message: string, description?: string) {
    return addNotification({ type: 'success', message, description })
  }

  function error(message: string, description?: string) {
    return addNotification({ type: 'error', message, description, duration: 5000 })
  }

  function warning(message: string, description?: string) {
    return addNotification({ type: 'warning', message, description })
  }

  function info(message: string, description?: string) {
    return addNotification({ type: 'info', message, description })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  }
})
