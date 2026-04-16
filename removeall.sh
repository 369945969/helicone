#!/bin/bash

# Helicone 本地一键停止脚本（源码编译启动方式）

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
echo -e "${BLUE}  Helicone 本地开发环境停止脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 停止 Web 服务
echo -e "${YELLOW}[1/4] 停止 Web 服务...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    lsof -Pi :3000 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}  ✓ Web 服务已停止${NC}"
else
    echo -e "${YELLOW}  Web 服务未运行${NC}"
fi

# 停止 Jawn 服务
echo -e "${YELLOW}[2/4] 停止 Jawn API 服务...${NC}"
if [ -f "$PROJECT_ROOT/.jawn.pid" ]; then
    JAWN_PID=$(cat "$PROJECT_ROOT/.jawn.pid")
    if kill -0 "$JAWN_PID" 2>/dev/null; then
        kill -9 "$JAWN_PID" 2>/dev/null || true
        echo -e "${GREEN}  ✓ Jawn 服务已停止 (PID: $JAWN_PID)${NC}"
    else
        echo -e "${YELLOW}  Jawn 进程已不存在${NC}"
    fi
    rm -f "$PROJECT_ROOT/.jawn.pid"
else
    # 尝试通过端口查找并停止
    if lsof -Pi :8585 -sTCP:LISTEN -t >/dev/null 2>&1; then
        lsof -Pi :8585 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}  ✓ Jawn 服务已停止${NC}"
    else
        echo -e "${YELLOW}  Jawn 服务未运行${NC}"
    fi
fi

# 停止 Worker 服务
echo -e "${YELLOW}[3/4] 停止 Worker 服务...${NC}"
if [ -f "$PROJECT_ROOT/.worker.pid" ]; then
    WORKER_PID=$(cat "$PROJECT_ROOT/.worker.pid")
    if kill -0 "$WORKER_PID" 2>/dev/null; then
        kill -9 "$WORKER_PID" 2>/dev/null || true
        echo -e "${GREEN}  ✓ Worker 服务已停止 (PID: $WORKER_PID)${NC}"
    else
        echo -e "${YELLOW}  Worker 进程已不存在${NC}"
    fi
    rm -f "$PROJECT_ROOT/.worker.pid"
else
    # 尝试通过端口查找并停止
    if lsof -Pi :8787 -sTCP:LISTEN -t >/dev/null 2>&1; then
        lsof -Pi :8787 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}  ✓ Worker 服务已停止${NC}"
    else
        echo -e "${YELLOW}  Worker 服务未运行${NC}"
    fi
fi

# 停止 Docker 基础设施
echo -e "${YELLOW}[4/4] 停止 Docker 基础设施...${NC}"
cd "$PROJECT_ROOT/docker"
if docker compose ps | grep -q "db\|clickhouse\|minio"; then
    docker compose down
    echo -e "${GREEN}  ✓ Docker 服务已停止${NC}"
else
    echo -e "${YELLOW}  Docker 服务未运行${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Helicone 所有服务已停止${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
