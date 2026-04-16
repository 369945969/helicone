#!/bin/bash

# Helicone Golang 版本一键启动脚本
# 启动 Web UI (3000), Jawn API (8585), Worker (8787)

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
echo -e "${BLUE}  Helicone Golang 版本启动脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 停止已运行的进程
echo -e "${YELLOW}[清理旧进程]${NC}"

# 停止 Web (3000)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}  停止 Web 进程 (端口 3000)...${NC}"
    lsof -Pi :3000 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
fi

# 停止 Jawn (8585)
if lsof -Pi :8585 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}  停止 Jawn 进程 (端口 8585)...${NC}"
    lsof -Pi :8585 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
fi

# 停止 Worker (8787)
if lsof -Pi :8787 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}  停止 Worker 进程 (端口 8787)...${NC}"
    lsof -Pi :8787 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
fi

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
check_command go
check_command docker

echo -e "${GREEN}✓ Go 版本: $(go version)${NC}"
echo -e "${GREEN}✓ Docker 已安装${NC}"
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}错误: Docker 未运行，请先启动 Docker${NC}"
    exit 1
fi

# 步骤 1: 配置环境变量
echo -e "${YELLOW}[1/4] 检查环境变量配置...${NC}"

# Web 环境变量
if [ ! -f "$PROJECT_ROOT/web/.env" ]; then
    echo -e "${YELLOW}  创建 web/.env...${NC}"
    cat > "$PROJECT_ROOT/web/.env" << EOF
PORT=3000
STATIC_DIR=./static
EOF
fi

# Jawn 环境变量
if [ ! -f "$PROJECT_ROOT/jawn/.env" ]; then
    echo -e "${YELLOW}  创建 jawn/.env...${NC}"
    cat > "$PROJECT_ROOT/jawn/.env" << EOF
PORT=8585
ENVIRONMENT=development
APP_URL=http://localhost:3000
IS_ON_PREM=false
EOF
fi

# Worker 环境变量
if [ ! -f "$PROJECT_ROOT/worker/.env" ]; then
    echo -e "${YELLOW}  创建 worker/.env...${NC}"
    cat > "$PROJECT_ROOT/worker/.env" << EOF
PORT=8787
ENVIRONMENT=development
WORKER_TYPE=AI_GATEWAY
VALHALLA_URL=http://localhost:8585
GATEWAY_TARGET=https://api.openai.com
EOF
fi

echo -e "${GREEN}✓ 环境变量配置完成${NC}"
echo ""

# 步骤 2: 安装 Go 依赖
echo -e "${YELLOW}[2/4] 安装 Go 依赖...${NC}"
cd "$PROJECT_ROOT"

# 检查 go.mod 是否存在
if [ ! -f "go.mod" ]; then
    echo -e "${YELLOW}  初始化 Go 模块...${NC}"
    go mod init helicone-golang
fi

# 安装依赖
echo -e "${YELLOW}  下载 Go 依赖...${NC}"
go mod tidy

echo -e "${GREEN}✓ Go 依赖安装完成${NC}"
echo ""

# 步骤 3: 启动基础设施服务（PostgreSQL + ClickHouse + MinIO）
echo -e "${YELLOW}[3/4] 启动基础设施服务...${NC}"
cd "$PROJECT_ROOT/../docker"

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

# 步骤 4: 启动三个服务
echo -e "${YELLOW}[4/4] 启动 Helicone 服务...${NC}"

# 启动 Worker（后台）
echo -e "${YELLOW}  启动 Worker (端口: 8787)...${NC}"
cd "$PROJECT_ROOT/worker"
nohup go run main.go > "$PROJECT_ROOT/worker.log" 2>&1 &
WORKER_PID=$!
echo $WORKER_PID > "$PROJECT_ROOT/.worker.pid"

# 等待 Worker 启动
sleep 2
if curl -s http://localhost:8787/health > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Worker 已启动 (PID: $WORKER_PID)${NC}"
else
    echo -e "${YELLOW}  ⚠ Worker 启动可能未完成${NC}"
fi

# 启动 Jawn API（后台）
echo -e "${YELLOW}  启动 Jawn API (端口: 8585)...${NC}"
cd "$PROJECT_ROOT/jawn"
nohup go run main.go > "$PROJECT_ROOT/jawn.log" 2>&1 &
JAWN_PID=$!
echo $JAWN_PID > "$PROJECT_ROOT/.jawn.pid"

# 等待 Jawn 启动
sleep 2
if curl -s http://localhost:8585/healthcheck > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Jawn API 已启动 (PID: $JAWN_PID)${NC}"
else
    echo -e "${YELLOW}  ⚠ Jawn API 启动可能未完成${NC}"
fi

# 启动 Web UI（前台）
echo -e "${YELLOW}  启动 Web UI (端口: 3000)...${NC}"
cd "$PROJECT_ROOT/web"

# 显示启动信息
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Helicone Golang 服务启动成功!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  ${BLUE}Web 界面:${NC}     http://localhost:3000"
echo -e "  ${BLUE}Jawn API:${NC}     http://localhost:8585"
echo -e "  ${BLUE}Worker:${NC}       http://localhost:8787"
echo ""
echo -e "  ${YELLOW}日志文件:${NC}"
echo -e "    Worker: $PROJECT_ROOT/worker.log"
echo -e "    Jawn:   $PROJECT_ROOT/jawn.log"
echo ""
echo -e "  ${YELLOW}按 Ctrl+C 停止 Web 服务${NC}"
echo -e "  ${YELLOW}运行 ./stopall.sh 停止所有服务${NC}"
echo ""

# 前台启动 Web
go run main.go
