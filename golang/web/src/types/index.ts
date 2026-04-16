export interface RequestLog {
  id: string
  model: string
  provider: string
  tokens: number
  cost: number
  status: string
  timestamp?: string
  latency?: number
}

export interface User {
  id: string
  email: string
  name?: string
}

export interface Stat {
  name: string
  value: string
  trend: number
  icon: string
  color: string
}
