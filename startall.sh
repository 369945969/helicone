#!/bin/bash

# Helicone 本地一键启动脚本（源码编译启动方式）
# 使用 Docker PostgreSQL + 源码启动服务（无需 Supabase CLI）

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Helicone 本地开发环境启动脚本${NC}"
echo -e "${BLUE}  （源码编译启动方式）${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 停止已运行的应用进程（不停止 Docker）
echo -e "${YELLOW}[清理旧进程]${NC}"

# 停止 Web (Next.js)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}  停止 Web 进程 (端口 3000)...${NC}"
    lsof -Pi :3000 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
fi

# 停止 Jawn
if lsof -Pi :8585 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}  停止 Jawn 进程 (端口 8585)...${NC}"
    lsof -Pi :8585 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
fi

# 停止 Worker
if lsof -Pi :8787 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}  停止 Worker 进程 (端口 8787)...${NC}"
    lsof -Pi :8787 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
fi

# 停止 nodemon 进程
pkill -f "nodemon" 2>/dev/null || true

# 停止 wrangler 进程
pkill -f "wrangler dev" 2>/dev/null || true

# 停止 next dev 进程
pkill -f "next.*dev" 2>/dev/null || true

echo -e "${GREEN}✓ 旧进程清理完成${NC}"
echo ""

# 检查必要工具
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}错误: 未找到 $1，请先安装${NC}"
        exit 1
    fi
}

echo -e "${YELLOW}[检查环境]${NC}"
check_command node
check_command yarn
check_command docker

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}错误: Node.js 版本需要 >= 20，当前版本: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js 版本: $(node -v)${NC}"
echo -e "${GREEN}✓ Yarn 版本: $(yarn -v)${NC}"
echo -e "${GREEN}✓ Docker 已安装${NC}"
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}错误: Docker 未运行，请先启动 Docker${NC}"
    exit 1
fi

# 步骤 1: 配置环境变量
echo -e "${YELLOW}[1/6] 检查环境变量配置...${NC}"

# Web 环境变量
if [ ! -f "$PROJECT_ROOT/web/.env.better-auth" ]; then
    echo -e "${YELLOW}  创建 web/.env.better-auth...${NC}"
    cp "$PROJECT_ROOT/web/.env.example.better-auth" "$PROJECT_ROOT/web/.env.better-auth"
fi

# Jawn 环境变量
if [ ! -f "$PROJECT_ROOT/valhalla/jawn/.env" ]; then
    echo -e "${YELLOW}  创建 valhalla/jawn/.env...${NC}"
    cp "$PROJECT_ROOT/valhalla/jawn/.env.example.better-auth" "$PROJECT_ROOT/valhalla/jawn/.env"
fi

echo -e "${GREEN}✓ 环境变量配置完成${NC}"
echo ""

# 步骤 2: 安装依赖
echo -e "${YELLOW}[2/6] 安装项目依赖...${NC}"

if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo -e "${YELLOW}  安装根目录依赖...${NC}"
    cd "$PROJECT_ROOT" && yarn install
fi

if [ ! -d "$PROJECT_ROOT/web/node_modules" ]; then
    echo -e "${YELLOW}  安装 web 依赖...${NC}"
    cd "$PROJECT_ROOT/web" && yarn install
fi

if [ ! -d "$PROJECT_ROOT/valhalla/jawn/node_modules" ]; then
    echo -e "${YELLOW}  安装 jawn 依赖...${NC}"
    cd "$PROJECT_ROOT/valhalla/jawn" && yarn install
fi

if [ ! -d "$PROJECT_ROOT/worker/node_modules" ]; then
    echo -e "${YELLOW}  安装 worker 依赖...${NC}"
    cd "$PROJECT_ROOT/worker" && yarn install
fi

echo -e "${GREEN}✓ 依赖安装完成${NC}"
echo ""

# 步骤 3: 启动基础设施服务（PostgreSQL + ClickHouse + MinIO）
echo -e "${YELLOW}[3/6] 启动基础设施服务...${NC}"

cd "$PROJECT_ROOT/docker"

# 检查是否已经在运行
if docker compose ps | grep -q "db\|clickhouse\|minio"; then
    echo -e "${YELLOW}  基础设施已在运行，跳过启动${NC}"
else
    echo -e "${YELLOW}  启动 PostgreSQL, ClickHouse, MinIO...${NC}"
    docker compose up db clickhouse minio minio-setup -d
    
    # 等待数据库就绪
    echo -e "${YELLOW}  等待数据库就绪...${NC}"
    sleep 10
    
    # 检查 PostgreSQL 是否就绪
    until docker exec helicone-postgres-flyway-test pg_isready -U postgres > /dev/null 2>&1; do
        echo -e "${YELLOW}  等待 PostgreSQL...${NC}"
        sleep 2
    done
    echo -e "${GREEN}  ✓ PostgreSQL 就绪${NC}"
    
    # 检查 ClickHouse 是否就绪
    until curl -s http://localhost:8123/ping > /dev/null 2>&1; do
        echo -e "${YELLOW}  等待 ClickHouse...${NC}"
        sleep 2
    done
    echo -e "${GREEN}  ✓ ClickHouse 就绪${NC}"
fi

echo -e "${GREEN}✓ 基础设施启动完成${NC}"
echo ""

# 步骤 4: 启动 Worker（后台）
echo -e "${YELLOW}[4/6] 启动 Worker 服务...${NC}"
cd "$PROJECT_ROOT/worker"

# 检查端口是否被占用
if lsof -Pi :8787 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}  端口 8787 已被占用，尝试停止现有进程...${NC}"
    lsof -Pi :8787 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 启动 Worker
echo -e "${YELLOW}  启动 Worker (端口: 8787)...${NC}"
echo -e "${YELLOW}  注意: 首次启动需要下载 Docker 镜像，可能需要 1-2 分钟...${NC}"
nohup npx wrangler dev --local --var WORKER_TYPE:OPENAI_PROXY --port 8787 --test-scheduled > "$PROJECT_ROOT/worker.log" 2>&1 &
WORKER_PID=$!
echo $WORKER_PID > "$PROJECT_ROOT/.worker.pid"

# 等待 Worker 启动
echo -e "${YELLOW}  等待 Worker 就绪（最多 120 秒）...${NC}"
WORKER_READY=false
for i in {1..120}; do
    if curl -s http://localhost:8787 > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Worker 已启动 (PID: $WORKER_PID)${NC}"
        WORKER_READY=true
        break
    fi
    sleep 1
    # 每 10 秒显示进度
    if [ $((i % 10)) -eq 0 ]; then
        echo -e "${YELLOW}  已等待 ${i} 秒...${NC}"
    fi
done

if [ "$WORKER_READY" = false ]; then
    echo -e "${YELLOW}  ⚠ Worker 启动超时${NC}"
    echo -e "${YELLOW}  查看日志: tail -f $PROJECT_ROOT/worker.log${NC}"
fi

echo -e "${GREEN}✓ Worker 启动完成${NC}"
echo ""

# 步骤 5: 启动 Jawn API（后台）
echo -e "${YELLOW}[5/6] 启动 Jawn API 服务...${NC}"
cd "$PROJECT_ROOT/valhalla/jawn"

# 检查端口是否被占用
if lsof -Pi :8585 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}  端口 8585 已被占用，尝试停止现有进程...${NC}"
    lsof -Pi :8585 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 后台启动 Jawn
echo -e "${YELLOW}  启动 Jawn (端口: 8585)...${NC}"
nohup yarn dev > "$PROJECT_ROOT/jawn.log" 2>&1 &
JAWN_PID=$!
echo $JAWN_PID > "$PROJECT_ROOT/.jawn.pid"

# 等待 Jawn 启动
echo -e "${YELLOW}  等待 Jawn 就绪...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:8585/health > /dev/null 2>&1 || curl -s http://localhost:8585 > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Jawn 已启动 (PID: $JAWN_PID)${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}  警告: Jawn 启动可能未完成，继续...${NC}"
    fi
done

echo -e "${GREEN}✓ Jawn API 启动完成${NC}"
echo ""

# 步骤 6: 启动 Web 前端（前台）
echo -e "${YELLOW}[6/6] 启动 Web 前端服务...${NC}"
cd "$PROJECT_ROOT/web"

# 检查端口是否被占用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}  端口 3000 已被占用，尝试停止现有进程...${NC}"
    lsof -Pi :3000 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 显示启动信息
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Helicone 服务启动成功!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  ${BLUE}Web 界面:${NC}     http://localhost:3000"
echo -e "  ${BLUE}Jawn API:${NC}     http://localhost:8585"
echo -e "  ${BLUE}Worker:${NC}       http://localhost:8787"
echo ""
echo -e "  ${YELLOW}默认账号:${NC}"
echo -e "    邮箱: test@helicone.ai"
echo -e "    密码: password"
echo ""
echo -e "  ${YELLOW}日志文件:${NC}"
echo -e "    Worker: $PROJECT_ROOT/worker.log"
echo -e "    Jawn:   $PROJECT_ROOT/jawn.log"
echo ""
echo -e "  ${YELLOW}按 Ctrl+C 停止 Web 服务${NC}"
echo -e "  ${YELLOW}运行 ./stopall.sh 停止所有服务${NC}"
echo ""

# 启动文件监控进程（在后台持续复制 thread-stream 文件）
(
    while true; do
        if [ -d "$PROJECT_ROOT/web/.next/server/vendor-chunks" ]; then
            if [ ! -f "$PROJECT_ROOT/web/.next/server/vendor-chunks/lib/worker.js" ]; then
                mkdir -p "$PROJECT_ROOT/web/.next/server/vendor-chunks/lib"
                cp "$PROJECT_ROOT/node_modules/thread-stream/lib/"*.js "$PROJECT_ROOT/web/.next/server/vendor-chunks/lib/" 2>/dev/null || true
            fi
        fi
        sleep 2
    done
) &
FILE_WATCHER_PID=$!
echo $FILE_WATCHER_PID > "$PROJECT_ROOT/.file-watcher.pid"

# 前台启动 Web（这样 Ctrl+C 可以停止）
# 使用 dotenv 加载 .env.better-auth 环境变量
echo -e "${YELLOW}  加载 .env.better-auth 环境变量...${NC}"
npx dotenv -e .env.better-auth -- yarn dev:local
