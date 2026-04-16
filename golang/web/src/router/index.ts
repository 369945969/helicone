import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Login from '@/views/Login.vue'
import Signup from '@/views/Signup.vue'
import Requests from '@/views/Requests.vue'
import Settings from '@/views/Settings.vue'
import Playground from '@/views/Playground.vue'
import NotFound from '@/views/NotFound.vue'

// 新增页面（后续逐步创建）
import Sessions from '@/views/Sessions.vue'
import SessionDetail from '@/views/SessionDetail.vue'
import Prompts from '@/views/Prompts.vue'
import PromptDetail from '@/views/PromptDetail.vue'
import Evaluators from '@/views/Evaluators.vue'
import EvaluatorCreate from '@/views/EvaluatorCreate.vue'
import EvaluatorDetail from '@/views/EvaluatorDetail.vue'
import Experiments from '@/views/Experiments.vue'
import ExperimentDetail from '@/views/ExperimentDetail.vue'
import Datasets from '@/views/Datasets.vue'
import DatasetDetail from '@/views/DatasetDetail.vue'
import Properties from '@/views/Properties.vue'
import Models from '@/views/Models.vue'
import Users from '@/views/Users.vue'
import UserDetail from '@/views/UserDetail.vue'
import Cache from '@/views/Cache.vue'
import RateLimits from '@/views/RateLimits.vue'
import Alerts from '@/views/Alerts.vue'
import Webhooks from '@/views/Webhooks.vue'
import Vault from '@/views/Vault.vue'
import Keys from '@/views/Keys.vue'
import Connections from '@/views/Connections.vue'
import Billing from '@/views/Billing.vue'
import Members from '@/views/Members.vue'
import Organization from '@/views/Organization.vue'
import Reports from '@/views/Reports.vue'
import PasswordChange from '@/views/PasswordChange.vue'
import Providers from '@/views/Providers.vue'
import Onboarding from '@/views/Onboarding.vue'
import Quickstart from '@/views/Quickstart.vue'
import FeaturePreview from '@/views/FeaturePreview.vue'
import Feedback from '@/views/Feedback.vue'
import Gateway from '@/views/Gateway.vue'
import Pricing from '@/views/Pricing.vue'
import Welcome from '@/views/Welcome.vue'
import Wrapped from '@/views/Wrapped.vue'
import Admin from '@/views/Admin.vue'
import AdminRevenue from '@/views/AdminRevenue.vue'
import AdminInvoices from '@/views/AdminInvoices.vue'
import AdminUsers from '@/views/AdminUsers.vue'
import HQL from '@/views/HQL.vue'
import EnterprisePortal from '@/views/EnterprisePortal.vue'
import Waitlist from '@/views/Waitlist.vue'
import RequestDetail from '@/views/RequestDetail.vue'
import Prompts2025 from '@/views/Prompts2025.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录 - Helicone' }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
    meta: { title: '注册 - Helicone' }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: Login,
    meta: { title: '重置密码 - Helicone' }
  },
  // 核心功能
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: '仪表板 - Helicone', requiresAuth: true }
  },
  {
    path: '/requests',
    name: 'Requests',
    component: Requests,
    meta: { title: '请求日志 - Helicone', requiresAuth: true }
  },
  {
    path: '/requests/:id',
    name: 'RequestDetail',
    component: RequestDetail,
    meta: { title: '请求详情 - Helicone', requiresAuth: true }
  },
  {
    path: '/playground',
    name: 'Playground',
    component: Playground,
    meta: { title: 'Playground - Helicone', requiresAuth: true }
  },
  {
    path: '/sessions',
    name: 'Sessions',
    component: Sessions,
    meta: { title: '会话 - Helicone', requiresAuth: true }
  },
  {
    path: '/sessions/:name',
    name: 'SessionDetail',
    component: SessionDetail,
    meta: { title: '会话详情 - Helicone', requiresAuth: true }
  },
  // 提示词管理
  {
    path: '/prompts',
    name: 'Prompts',
    component: Prompts,
    meta: { title: '提示词 - Helicone', requiresAuth: true }
  },
  {
    path: '/prompts/:id',
    name: 'PromptDetail',
    component: PromptDetail,
    meta: { title: '提示词详情 - Helicone', requiresAuth: true }
  },
  {
    path: '/prompts2025',
    name: 'Prompts2025',
    component: Prompts2025,
    meta: { title: '提示词管理 - Helicone', requiresAuth: true }
  },
  // 评估器
  {
    path: '/evaluators',
    name: 'Evaluators',
    component: Evaluators,
    meta: { title: '评估器 - Helicone', requiresAuth: true }
  },
  {
    path: '/evaluators/create',
    name: 'EvaluatorCreate',
    component: EvaluatorCreate,
    meta: { title: '创建评估器 - Helicone', requiresAuth: true }
  },
  {
    path: '/evaluators/:id',
    name: 'EvaluatorDetail',
    component: EvaluatorDetail,
    meta: { title: '评估器详情 - Helicone', requiresAuth: true }
  },
  // 实验
  {
    path: '/experiments',
    name: 'Experiments',
    component: Experiments,
    meta: { title: '实验 - Helicone', requiresAuth: true }
  },
  {
    path: '/experiments/:id',
    name: 'ExperimentDetail',
    component: ExperimentDetail,
    meta: { title: '实验详情 - Helicone', requiresAuth: true }
  },
  // 数据集
  {
    path: '/datasets',
    name: 'Datasets',
    component: Datasets,
    meta: { title: '数据集 - Helicone', requiresAuth: true }
  },
  {
    path: '/datasets/:id',
    name: 'DatasetDetail',
    component: DatasetDetail,
    meta: { title: '数据集详情 - Helicone', requiresAuth: true }
  },
  // 其他功能
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: { title: '用户 - Helicone', requiresAuth: true }
  },
  {
    path: '/users/:id',
    name: 'UserDetail',
    component: UserDetail,
    meta: { title: '用户详情 - Helicone', requiresAuth: true }
  },
  {
    path: '/properties',
    name: 'Properties',
    component: Properties,
    meta: { title: '属性 - Helicone', requiresAuth: true }
  },
  {
    path: '/models',
    name: 'Models',
    component: Models,
    meta: { title: '模型 - Helicone', requiresAuth: true }
  },
  {
    path: '/cache',
    name: 'Cache',
    component: Cache,
    meta: { title: '缓存 - Helicone', requiresAuth: true }
  },
  {
    path: '/rate-limits',
    name: 'RateLimits',
    component: RateLimits,
    meta: { title: '速率限制 - Helicone', requiresAuth: true }
  },
  {
    path: '/alerts',
    name: 'Alerts',
    component: Alerts,
    meta: { title: '告警 - Helicone', requiresAuth: true }
  },
  {
    path: '/webhooks',
    name: 'Webhooks',
    component: Webhooks,
    meta: { title: 'Webhooks - Helicone', requiresAuth: true }
  },
  {
    path: '/vault',
    name: 'Vault',
    component: Vault,
    meta: { title: '密钥库 - Helicone', requiresAuth: true }
  },
  {
    path: '/keys',
    name: 'Keys',
    component: Keys,
    meta: { title: 'API 密钥 - Helicone', requiresAuth: true }
  },
  // 设置页面
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { title: '设置 - Helicone', requiresAuth: true }
  },
  {
    path: '/settings/connections',
    name: 'SettingsConnections',
    component: Connections,
    meta: { title: '连接设置 - Helicone', requiresAuth: true }
  },
  {
    path: '/settings/billing',
    name: 'SettingsBilling',
    component: Billing,
    meta: { title: '账单设置 - Helicone', requiresAuth: true }
  },
  {
    path: '/settings/members',
    name: 'SettingsMembers',
    component: Members,
    meta: { title: '成员管理 - Helicone', requiresAuth: true }
  },
  {
    path: '/settings/organization',
    name: 'SettingsOrganization',
    component: Organization,
    meta: { title: '组织设置 - Helicone', requiresAuth: true }
  },
  {
    path: '/settings/providers',
    name: 'SettingsProviders',
    component: Providers,
    meta: { title: '提供商设置 - Helicone', requiresAuth: true }
  },
  {
    path: '/settings/reports',
    name: 'SettingsReports',
    component: Reports,
    meta: { title: '报告设置 - Helicone', requiresAuth: true }
  },
  {
    path: '/settings/password',
    name: 'SettingsPassword',
    component: PasswordChange,
    meta: { title: '修改密码 - Helicone', requiresAuth: true }
  },
  {
    path: '/settings/rate-limits',
    name: 'SettingsRateLimits',
    component: RateLimits,
    meta: { title: '速率限制设置 - Helicone', requiresAuth: true }
  },
  {
    path: '/settings/webhooks',
    name: 'SettingsWebhooks',
    component: Webhooks,
    meta: { title: 'Webhooks 设置 - Helicone', requiresAuth: true }
  },
  {
    path: '/settings/alerts',
    name: 'SettingsAlerts',
    component: Alerts,
    meta: { title: '告警设置 - Helicone', requiresAuth: true }
  },
  // 管理后台
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { title: '管理后台 - Helicone', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/revenue',
    name: 'AdminRevenue',
    component: AdminRevenue,
    meta: { title: '收入管理 - Helicone', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/invoices',
    name: 'AdminInvoices',
    component: AdminInvoices,
    meta: { title: '发票管理 - Helicone', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { title: '用户管理 - Helicone', requiresAuth: true, requiresAdmin: true }
  },
  // 其他页面
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: Onboarding,
    meta: { title: '新手引导 - Helicone', requiresAuth: true }
  },
  {
    path: '/quickstart',
    name: 'Quickstart',
    component: Quickstart,
    meta: { title: '快速开始 - Helicone', requiresAuth: true }
  },
  {
    path: '/features',
    name: 'FeaturePreview',
    component: FeaturePreview,
    meta: { title: '功能预览 - Helicone', requiresAuth: true }
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: Feedback,
    meta: { title: '反馈 - Helicone', requiresAuth: true }
  },
  {
    path: '/gateway',
    name: 'Gateway',
    component: Gateway,
    meta: { title: '网关 - Helicone', requiresAuth: true }
  },
  {
    path: '/pricing',
    name: 'Pricing',
    component: Pricing,
    meta: { title: '定价 - Helicone' }
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: Welcome,
    meta: { title: '欢迎 - Helicone', requiresAuth: true }
  },
  {
    path: '/wrapped',
    name: 'Wrapped',
    component: Wrapped,
    meta: { title: '年度总结 - Helicone', requiresAuth: true }
  },
  {
    path: '/hql',
    name: 'HQL',
    component: HQL,
    meta: { title: 'HQL 查询 - Helicone', requiresAuth: true }
  },
  {
    path: '/enterprise',
    name: 'EnterprisePortal',
    component: EnterprisePortal,
    meta: { title: '企业门户 - Helicone', requiresAuth: true }
  },
  {
    path: '/waitlist',
    name: 'Waitlist',
    component: Waitlist,
    meta: { title: '等待列表 - Helicone' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title || 'Helicone'
  next()
})

export default router
