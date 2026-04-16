<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/dashboard" class="text-2xl font-bold text-primary-600">
                Helicone
              </router-link>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                v-for="item in navigation"
                :key="item.name"
                :to="item.href"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="[
                  currentRoute === item.href
                    ? 'border-primary-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                ]"
              >
                {{ item.name }}
              </router-link>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">{{ authStore.user?.email }}</span>
            <button @click="handleLogout" class="btn-secondary">
              退出登录
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 侧边栏和主内容 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex space-x-8">
        <!-- 侧边栏 -->
        <aside class="w-64 flex-shrink-0">
          <div class="bg-white rounded-lg shadow p-4">
            <nav class="space-y-2">
              <router-link
                v-for="item in sidebarItems"
                :key="item.name"
                :to="item.href"
                class="block px-3 py-2 rounded-md text-sm font-medium"
                :class="[
                  currentRoute === item.href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                ]"
              >
                {{ item.name }}
              </router-link>
            </nav>
          </div>
        </aside>

        <!-- 主内容 -->
        <main class="flex-1">
          <slot></slot>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const currentRoute = computed(() => route.path)

const navigation = [
  { name: '仪表板', href: '/dashboard' },
  { name: '请求', href: '/requests' },
  { name: 'Playground', href: '/playground' },
  { name: '设置', href: '/settings' },
]

const sidebarItems = computed(() => {
  const path = route.path
  if (path.startsWith('/dashboard')) {
    return [
      { name: '总览', href: '/dashboard' },
      { name: '模型', href: '/dashboard/models' },
      { name: '统计', href: '/dashboard/stats' },
    ]
  } else if (path.startsWith('/requests')) {
    return [
      { name: '所有请求', href: '/requests' },
      { name: '筛选', href: '/requests/filters' },
    ]
  }
  return []
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>
