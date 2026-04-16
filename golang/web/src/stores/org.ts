import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Org } from './auth'

export const useOrgStore = defineStore('org', () => {
  const orgs = ref<Org[]>([])
  const currentOrgId = ref<string | null>(null)
  const loading = ref(false)

  const currentOrg = computed(() =>
    orgs.value.find(o => o.id === currentOrgId.value) || null
  )

  async function fetchOrgs() {
    loading.value = true
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/v1/organizations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        orgs.value = data.orgs
        if (!currentOrgId.value && orgs.value.length > 0) {
          currentOrgId.value = orgs.value[0].id
        }
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    } finally {
      loading.value = false
    }
  }

  function switchOrg(orgId: string) {
    currentOrgId.value = orgId
    localStorage.setItem('current_org_id', orgId)
  }

  async function createOrg(name: string) {
    const token = localStorage.getItem('auth_token')
    const response = await fetch('/api/v1/organizations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    })
    const data = await response.json()
    if (data.success) {
      await fetchOrgs()
    }
    return data
  }

  async function deleteOrg(orgId: string) {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`/api/v1/organizations/${orgId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    const data = await response.json()
    if (data.success) {
      await fetchOrgs()
    }
    return data
  }

  async function updateOrg(orgId: string, updates: Partial<Org>) {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`/api/v1/organizations/${orgId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })
    const data = await response.json()
    if (data.success) {
      await fetchOrgs()
    }
    return data
  }

  return {
    orgs,
    currentOrgId,
    currentOrg,
    loading,
    fetchOrgs,
    switchOrg,
    createOrg,
    deleteOrg,
    updateOrg,
  }
})
