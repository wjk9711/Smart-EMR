#!/bin/bash

# EMR系统快速更新脚本（简化版）
# 适用于已部署环境的快速更新
# 使用方法: bash quick-update.sh

set -e

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

INSTALL_DIR="/opt/emr-system"
BACKEND_PORT=3000

echo ""
echo "=========================================="
echo "  EMR系统快速更新"
echo "=========================================="
echo ""

# 检查是否在正确的目录
if [ ! -d "$INSTALL_DIR" ]; then
    echo -e "${RED}错误: 安装目录 $INSTALL_DIR 不存在${NC}"
    echo "请先运行 auto-update.sh 进行首次部署"
    exit 1
fi

cd "$INSTALL_DIR"

# 1. 拉取最新代码
echo -e "${YELLOW}[1/6] 拉取最新代码...${NC}"
git pull origin main
echo -e "${GREEN}✓ 代码已更新${NC}"
echo ""

# 2. 停止服务
echo -e "${YELLOW}[2/6] 停止当前服务...${NC}"
pkill -f "node.*dist/app.js" || true
sleep 2
echo -e "${GREEN}✓ 服务已停止${NC}"
echo ""

# 3. 构建后端
echo -e "${YELLOW}[3/6] 构建后端...${NC}"
cd emr-backend
npm install --production
npm run build
echo -e "${GREEN}✓ 后端构建完成${NC}"
echo ""

# 4. 构建前端
echo -e "${YELLOW}[4/6] 构建前端...${NC}"
cd ../emr-frontend
npm install
npm run build
echo -e "${GREEN}✓ 前端构建完成${NC}"
echo ""

# 5. 部署前端文件
echo -e "${YELLOW}[5/6] 部署前端文件...${NC}"
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/
echo -e "${GREEN}✓ 前端文件已部署${NC}"
echo ""

# 6. 启动服务
echo -e "${YELLOW}[6/6] 启动服务...${NC}"
cd ../emr-backend
nohup node dist/app.js > backend.log 2>&1 &
echo $! > backend.pid
sleep 3

# 验证服务
if curl -s http://localhost:${BACKEND_PORT}/health > /dev/null; then
    echo -e "${GREEN}✓ 服务启动成功${NC}"
else
    echo -e "${RED}✗ 服务启动失败，请查看日志${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}  更新完成！${NC}"
echo "=========================================="
echo ""
echo "访问地址: http://$(curl -s ifconfig.me)"
echo "后端端口: ${BACKEND_PORT}"
echo ""
