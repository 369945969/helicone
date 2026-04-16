# Helicone Web 前端 (Vue 3 + TypeScript)

这是 Helicone 的 Vue 3 前端，功能完全对应原 Next.js 版本。

## 技术栈

- Vue 3 (Composition API)
- TypeScript
- TailwindCSS
- Pinia (状态管理)
- Vue Router 4
- Vite (构建工具)

## 功能

✅ 登录/注册（支持邮箱密码、Google、GitHub）  
✅ 仪表板（统计卡片、请求趋势、最近请求）  
✅ 请求日志（搜索、筛选、分页）  
✅ Playground（模型配置、对话交互）  
✅ 设置（API Key 管理、组织设置、通知设置）  
✅ 响应式布局（侧边栏、导航栏）  

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 部署

```bash
# 1. 构建
npm run build

# 2. 使用 Go 服务器提供静态文件
cd ..
go run web/main.go
```

## 目录结构

```
src/
├── App.vue                 # 根组件
├── main.ts                 # 入口文件
├── style.css               # TailwindCSS 样式
├── router/                 # 路由配置
│   └── index.ts
├── stores/                 # Pinia 状态管理
│   └── auth.ts
├── layouts/                # 布局组件
│   └── DefaultLayout.vue
├── views/                  # 页面组件
│   ├── Login.vue          # 登录页
│   ├── Signup.vue         # 注册页
│   ├── Dashboard.vue      # 仪表板
│   ├── Requests.vue       # 请求日志
│   ├── Playground.vue     # Playground
│   ├── Settings.vue       # 设置
│   └── NotFound.vue       # 404 页
└── types/                  # TypeScript 类型
    └── index.ts
```
