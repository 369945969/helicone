import { defineStore } from 'pinia'
import { ref } from 'vue'

export type FilterNode =
  | { type: 'leaf'; field: string; operator: string; value: any }
  | { type: 'node'; operator: 'AND' | 'OR'; children: FilterNode[] }

export const useFilterStore = defineStore('filter', () => {
  const filter = ref<FilterNode | null>(null)
  const filterMode = ref<'simple' | 'advanced'>('simple')

  function setFilter(newFilter: FilterNode | null) {
    filter.value = newFilter
  }

  function clearFilter() {
    filter.value = null
  }

  function addLeaf(field: string, operator: string, value: any) {
    const leaf: FilterNode = { type: 'leaf', field, operator, value }
    if (!filter.value) {
      filter.value = leaf
    } else if (filter.value.type === 'leaf') {
      filter.value = { type: 'node', operator: 'AND', children: [filter.value, leaf] }
    } else {
      filter.value.children.push(leaf)
    }
  }

  function removeNode(path: number[]) {
    if (!filter.value) return
    
    if (path.length === 0) {
      filter.value = null
      return
    }

    const removeFromNode = (node: FilterNode, remainingPath: number[]): boolean => {
      if (node.type === 'leaf') return false
      if (remainingPath.length === 1) {
        node.children.splice(remainingPath[0], 1)
        if (node.children.length === 1) {
          return true
        }
        return false
      }
      return removeFromNode(node.children[remainingPath[0]], remainingPath.slice(1))
    }

    const shouldFlatten = removeFromNode(filter.value, path)
    if (shouldFlatten && filter.value.type === 'node' && filter.value.children.length === 1) {
      filter.value = filter.value.children[0]
    }
  }

  return {
    filter,
    filterMode,
    setFilter,
    clearFilter,
    addLeaf,
    removeNode,
  }
})
