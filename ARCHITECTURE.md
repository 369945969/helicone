# Helicone 架构设计文档

## 项目概述

Helicone 是一个开源的 LLM（大语言模型）可观测性平台，帮助开发者监控、分析和管理 AI 应用的 API 请求。它支持 OpenAI、Anthropic、Azure 等多种 LLM 提供商。

---

## 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户接入层                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │  Proxy 模式   │    │ Gateway 模式  │    │ 异步日志模式  │                   │
│  │  (Worker)    │    │  (Jawn API)  │    │   (SDK)      │                   │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                   │
│         │                   │                   │                           │
│         └───────────────────┼───────────────────┘                           │
│                             ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      数据处理层 (Data Processing)                     │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │   │
│  │  │   Worker    │───▶│ Kafka / SQS │───▶│ Jawn API    │              │   │
│  │  │ (Port 8787) │    │  (消息队列)  │    │ (Port 8585) │              │   │
│  │  └─────────────┘    └─────────────┘    └──────┬──────┘              │   │
│  │                                                │                     │   │
│  │  ┌─────────────┐    ┌─────────────┐           │                     │   │
│  │  │   Web UI    │◀───│  Jawn API   │◀──────────┘                     │   │
│  │  │ (Port 3000) │    │  (REST API) │                                   │   │
│  │  └─────────────┘    └─────────────┘                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                             │                                               │
│                             ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        数据存储层 (Data Storage)                      │   │
│  │                                                                     │   │
│  │   ┌─────────────┐        ┌─────────────┐        ┌─────────────┐    │   │
│  │   │ ClickHouse  │        │ PostgreSQL  │        │    MinIO    │    │   │
│  │   │  (日志分析)  │        │  (业务数据)  │        │  (对象存储)  │    │   │
│  │   │             │        │             │        │             │    │   │
│  │   │ • 请求日志   │        │ • 用户信息   │        │ • 请求体     │    │   │
│  │   │ • 性能指标   │        │ • 组织信息   │        │ • 响应体     │    │   │
│  │   │ • 成本分析   │        │ • API 密钥   │        │ • 大文件     │    │   │
│  │   └─────────────┘        └─────────────┘        └─────────────┘    │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 核心组件详解

### 1. Worker（Cloudflare Worker）

**功能定位**：LLM 请求的代理入口

**主要职责**：
- 接收用户的 LLM API 请求
- 验证 Helicone API Key
- 转发请求到实际的 LLM 提供商（OpenAI、Anthropic 等）
- 异步记录请求日志到消息队列（Kafka/SQS）
- 支持速率限制、缓存、重试等高级功能

**技术栈**：Cloudflare Workers、TypeScript

**端口**：8787（本地开发）

**支持的 LLM 提供商**：
- OpenAI（OAI）
- Anthropic
- Azure OpenAI
- Together AI
- 自定义网关（Gateway）

---

### 2. Jawn API（后端服务）

**功能定位**：核心业务 API 和日志消费服务

**主要职责**：

#### 2.1 REST API 服务
- **请求管理**：查询、过滤、分析 LLM 请求日志
- **Prompt 管理**：版本控制、A/B 测试、Prompt 调试
- **实验管理**：LLM 实验设计、结果对比
- **评估系统**：自动化评估 LLM 输出质量
- **组织管理**：多租户、权限控制、API 密钥管理
- **计费系统**：使用量统计、成本控制

#### 2.2 日志消费服务
- 消费 Kafka/SQS 中的请求日志
- 数据清洗和格式化
- 写入 ClickHouse 和 PostgreSQL

**技术栈**：Node.js、Express、TypeScript

**端口**：8585

**目录结构**：
```
valhalla/jawn/src/
├── controllers/      # REST API 控制器
│   ├── public/       # 公开 API
│   └── private/      # 内部 API
├── managers/         # 业务逻辑层
├── stores/           # 数据访问层
├── lib/
│   ├── clients/      # 外部服务客户端（S3、ClickHouse 等）
│   ├── wrappers/     # 数据库包装器
│   └── db/           # 数据库操作
└── workers/          # 后台消费服务
```

---

### 3. Web UI（前端应用）

**功能定位**：用户交互界面

**主要职责**：
- 请求日志的可视化展示
- Prompt 管理和调试（Playground）
- 实验设计和结果分析
- 仪表盘和报表
- 用户认证和权限管理

**技术栈**：Next.js 14、React 18、TypeScript、Tailwind CSS

**端口**：3000

---

### 4. 数据存储

#### 4.1 ClickHouse
- **用途**：高性能日志分析和时序数据存储
- **数据类型**：请求日志、性能指标、成本数据
- **特点**：列式存储，适合大规模数据分析

#### 4.2 PostgreSQL
- **用途**：业务数据存储
- **数据类型**：用户信息、组织信息、API 密钥、Prompt 版本、实验配置
- **特点**：事务支持，数据一致性

#### 4.3 MinIO（S3 兼容）
- **用途**：大对象存储
- **数据类型**：请求体、响应体、大文件
- **特点**：低成本存储，高吞吐量

---

## 请求流程详解

### 方式一：Proxy 模式（推荐）

用户将 LLM API 请求发送到 Helicone Worker，Worker 代理转发到实际的 LLM 提供商。

```
┌─────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│ 用户代码 │────▶│ Helicone     │────▶│   Worker     │────▶│  OpenAI/    │
│         │     │ Worker       │     │ (Port 8787)  │     │  Anthropic  │
│         │     │ (Port 8787)  │     │              │     │             │
└─────────┘     └──────┬───────┘     └──────┬───────┘     └─────────────┘
                       │                    │
                       │                    ▼
                       │           ┌──────────────┐
                       │           │  异步记录日志  │
                       │           │  Kafka/SQS   │
                       │           └──────┬───────┘
                       │                  │
                       ▼                  ▼
              ┌──────────────┐    ┌──────────────┐
              │   返回响应    │    │  Jawn API    │
              │   给用户     │    │  消费日志    │
              └──────────────┘    └──────────────┘
```

**代码示例**：
```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "http://localhost:8787/v1",  // Helicone Worker 地址
  defaultHeaders: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
    "Helicone-Property-Environment": "production",
  },
});

const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }],
});
```

**请求头说明**：
- `Authorization`: LLM 提供商的 API Key
- `Helicone-Auth`: Helicone 的 API Key
- `Helicone-Property-*`: 自定义属性标签（用于过滤和分析）

---

### 方式二：Gateway 模式

直接通过 Jawn API 的网关端点代理请求。

```
┌─────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│ 用户代码 │────▶│   Jawn API   │────▶│   Gateway    │────▶│  OpenAI/    │
│         │     │ (Port 8585)  │     │   Router     │     │  Anthropic  │
└─────────┘     └──────┬───────┘     └──────────────┘     └─────────────┘
                       │
                       ▼
              ┌──────────────┐
              │  记录日志到   │
              │ ClickHouse   │
              └──────────────┘
```

**API 端点**：
```
POST http://localhost:8585/v1/gateway/{provider}/*
```

**支持的 Provider**：
- `OAI` - OpenAI
- `ANTHROPIC` - Anthropic
- `GATEWAY` - 通用网关

**代码示例**：
```bash
curl -X POST http://localhost:8585/v1/gateway/OAI/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Helicone-Auth: Bearer $HELICONE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

### 方式三：异步日志模式（SDK）

用户直接调用 LLM API，然后通过 Helicone SDK 异步发送日志。

```
┌─────────┐     ┌──────────────┐
│ 用户代码 │────▶│   OpenAI     │
│         │     │   API        │
│         │     └──────┬───────┘
│         │            │
│         │     ┌──────▼───────┐
│         │     │   获取响应    │
│         │     └──────┬───────┘
│         │            │
│         │     ┌──────▼───────┐
│         └────▶│ Helicone SDK │
│               │ 异步发送日志  │
│               └──────┬───────┘
│                      │
│               ┌──────▼───────┐
│               │  Jawn API    │
│               │ 接收日志     │
│               └──────────────┘
```

**代码示例**：
```typescript
import { Helicone } from "@helicone/helicone";
import OpenAI from "openai";

const helicone = new Helicone({
  apiKey: process.env.HELICONE_API_KEY,
  loggingEndpoint: "http://localhost:8585/v1/trace/custom/log",
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 直接调用 OpenAI
const requestBody = {
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }],
};

const completion = await openai.chat.completions.create(requestBody);

// 异步发送日志到 Helicone
await helicone.logSingleRequest(
  requestBody,
  JSON.stringify(completion),
  {
    "Helicone-Property-Environment": "production",
  }
);
```

**适用场景**：
- 不想修改现有代码的 baseURL
- 需要完全控制请求和响应
- 离线环境或网络受限场景

---

### 方式四：Helicone API 直接访问

通过 Helicone API Key 访问 Jawn API 获取数据。

**代码示例**：
```typescript
// Web 前端使用 Jawn Client
const jawn = getJawnClient();

// 查询请求日志
const requests = await jawn.POST("/v1/request/query", {
  body: {
    filter: {
      request_response_rmt: {
        request_created_at: {
          gte: "2024-01-01T00:00:00Z",
        },
      },
    },
  },
});

// 获取组织信息
const org = await jawn.GET("/v1/organization/{organizationId}", {
  params: { path: { organizationId: "org_xxx" } },
});
```

---

## 数据流详解

### 请求日志数据流

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 用户请求 │───▶│  Worker  │───▶│ Kafka/   │───▶│  Jawn    │───▶│ClickHouse│
│         │    │  代理转发 │    │   SQS    │    │  消费服务 │    │          │
└─────────┘    └────┬─────┘    └──────────┘    └──────────┘    └──────────┘
                    │
                    ▼
              ┌──────────┐
              │  LLM 提供商│
              │ 返回响应  │
              └──────────┘
```

### 业务流程数据流

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Web UI │───▶│ Jawn API │───▶│PostgreSQL│───▶│  业务数据 │
│         │    │ REST API │    │          │    │          │
└─────────┘    └──────────┘    └──────────┘    └──────────┘
```

---

## 部署架构

### 本地开发环境

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ PostgreSQL  │  │ ClickHouse  │  │    MinIO    │         │
│  │  Port 5432  │  │  Port 8123  │  │  Port 9000  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │   MailHog   │  │   Kafka     │                          │
│  │  Port 8025  │  │  Port 9092  │                          │
│  └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Jawn API    │    │    Web UI     │    │    Worker     │
│  (yarn dev)   │    │  (yarn dev)   │    │ (npx wrangler)│
│  Port 8585    │    │  Port 3000    │    │  Port 8787    │
└───────────────┘    └───────────────┘    └───────────────┘
```

### 生产环境

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Cloudflare                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Workers (全球边缘网络)                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │   │
│  │  │ Worker 1 │  │ Worker 2 │  │ Worker 3 │  │ Worker N │    │   │
│  │  │ (北美)   │  │ (欧洲)   │  │ (亚洲)   │  │ (其他)   │    │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           AWS / GCP                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐   │
│  │   EKS/GKE   │  │   RDS       │  │  ClickHouse │  │   S3     │   │
│  │  (Jawn API) │  │ (PostgreSQL)│  │   Cloud     │  │ (MinIO)  │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘   │
│  ┌─────────────┐  ┌─────────────┐                                   │
│  │   Kafka/    │  │   Vercel    │                                   │
│  │   SQS       │  │  (Web UI)   │                                   │
│  └─────────────┘  └─────────────┘                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 技术栈总结

| 组件 | 技术栈 | 用途 |
|------|--------|------|
| Worker | Cloudflare Workers | LLM 请求代理 |
| Jawn API | Node.js + Express | 后端 API 服务 |
| Web UI | Next.js + React | 前端界面 |
| 数据库 | PostgreSQL 17 | 业务数据存储 |
| 分析数据库 | ClickHouse | 日志分析和时序数据 |
| 对象存储 | MinIO (S3 兼容) | 大文件存储 |
| 消息队列 | Kafka / SQS | 异步日志传输 |
| 缓存 | Redis | 会话和缓存 |
| 邮件服务 | MailHog (开发) | 邮件测试 |

---

## 快速启动

### 一键启动脚本

```bash
# 启动所有服务
./startall.sh

# 停止所有服务
./stopall.sh
```

### 手动启动

```bash
# 1. 启动基础设施
cd docker
./helicone-compose.sh helicone up

# 2. 启动 Jawn API
cd valhalla/jawn
yarn dev

# 3. 启动 Web UI
cd web
yarn dev:better-auth
```

---

## 默认端口

| 服务 | 端口 | 说明 |
|------|------|------|
| Web UI | 3000 | 前端界面 |
| Jawn API | 8585 | 后端 API |
| Worker | 8787 | LLM 代理 |
| PostgreSQL | 5432 | 业务数据库 |
| ClickHouse | 8123 | 分析数据库 |
| MinIO | 9000 | 对象存储 |
| MailHog | 8025 | 邮件测试界面 |

---

## 总结

Helicone 采用分层架构设计，通过 Worker 代理 LLM 请求，实现无侵入式的可观测性接入。数据流采用异步消息队列，确保高性能和低延迟。存储层分离业务数据和分析数据，兼顾一致性和查询性能。

三种接入方式（Proxy、Gateway、SDK）满足不同场景需求，用户可以根据实际情况选择最合适的方式。
