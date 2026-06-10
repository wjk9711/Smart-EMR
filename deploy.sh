#!/bin/bash

# EMR系统生产环境快速部署脚本
# 使用方法: bash deploy.sh

echo "======================================"
echo "EMR系统生产环境部署脚本"
echo "======================================"

# 配置变量
SERVER_IP="47.97.200.237"
BACKEND_PORT=3000
FRONTEND_DIR="./emr-frontend"
BACKEND_DIR="./emr-backend"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}步骤1: 检查后端服务状态${NC}"
echo "测试后端健康检查端点..."
curl -s http://localhost:${BACKEND_PORT}/health > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 后端服务运行正常${NC}"
else
    echo -e "${RED}✗ 后端服务未运行或无法访问${NC}"
    echo "请先启动后端服务："
    echo "  cd ${BACKEND_DIR}"
    echo "  npm install"
    echo "  npm run build"
    echo "  node dist/app.js &"
    exit 1
fi

echo ""
echo -e "${YELLOW}步骤2: 构建前端${NC}"
cd ${FRONTEND_DIR}
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
fi

echo "构建生产版本..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 前端构建成功${NC}"
else
    echo -e "${RED}✗ 前端构建失败${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}步骤3: 验证配置${NC}"
echo "检查环境变量配置..."
if [ -f ".env.production" ]; then
    echo -e "${GREEN}✓ 生产环境配置文件存在${NC}"
    echo "当前API地址配置:"
    grep VITE_API_BASE_URL .env.production
else
    echo -e "${RED}✗ 缺少.env.production文件${NC}"
fi

echo ""
echo -e "${YELLOW}步骤4: 部署说明${NC}"
echo "======================================"
echo "前端构建完成！dist目录包含生产文件"
echo ""
echo "接下来需要："
echo "1. 将 ${FRONTEND_DIR}/dist 目录上传到服务器"
echo "2. 确保后端服务在服务器上运行并监听 0.0.0.0:${BACKEND_PORT}"
echo "3. 配置防火墙/安全组允许 ${BACKEND_PORT} 端口"
echo "4. 使用Web服务器(Nginx/Apache)托管前端文件"
echo ""
echo "快速测试命令："
echo "  curl http://${SERVER_IP}:${BACKEND_PORT}/health"
echo "  curl -X POST http://${SERVER_IP}:${BACKEND_PORT}/api/auth/login \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"username\":\"admin\",\"password\":\"admin123\"}'"
echo ""
echo -e "${GREEN}部署准备完成！${NC}"
echo "======================================"
