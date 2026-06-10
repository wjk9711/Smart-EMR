#!/bin/bash

# 服务器端部署检查脚本
# 在服务器上运行此脚本来检查部署状态

echo "======================================"
echo "EMR系统服务器端部署检查"
echo "======================================"

BACKEND_PORT=3000

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}1. 检查Node.js和npm${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js已安装: $(node --version)${NC}"
else
    echo -e "${RED}✗ Node.js未安装${NC}"
fi

if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓ npm已安装: $(npm --version)${NC}"
else
    echo -e "${RED}✗ npm未安装${NC}"
fi

echo ""
echo -e "${YELLOW}2. 检查后端服务进程${NC}"
if pgrep -f "node.*app.js" > /dev/null; then
    echo -e "${GREEN}✓ 后端服务正在运行${NC}"
    ps aux | grep "node.*app.js" | grep -v grep
else
    echo -e "${RED}✗ 后端服务未运行${NC}"
    echo "启动命令: cd /path/to/emr-backend && node dist/app.js &"
fi

echo ""
echo -e "${YELLOW}3. 检查端口监听${NC}"
if netstat -tlnp 2>/dev/null | grep ":${BACKEND_PORT}" > /dev/null || ss -tlnp 2>/dev/null | grep ":${BACKEND_PORT}" > /dev/null; then
    echo -e "${GREEN}✓ 端口 ${BACKEND_PORT} 正在监听${NC}"
    netstat -tlnp 2>/dev/null | grep ":${BACKEND_PORT}" || ss -tlnp 2>/dev/null | grep ":${BACKEND_PORT}"
else
    echo -e "${RED}✗ 端口 ${BACKEND_PORT} 未监听${NC}"
fi

echo ""
echo -e "${YELLOW}4. 测试健康检查端点${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:${BACKEND_PORT}/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 健康检查成功${NC}"
    echo "响应: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗ 健康检查失败${NC}"
fi

echo ""
echo -e "${YELLOW}5. 测试API登录接口${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:${BACKEND_PORT}/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ API接口可访问${NC}"
    echo "响应: $LOGIN_RESPONSE"
else
    echo -e "${RED}✗ API接口访问失败${NC}"
fi

echo ""
echo -e "${YELLOW}6. 检查防火墙配置${NC}"
if command -v ufw &> /dev/null; then
    if ufw status | grep "${BACKEND_PORT}" > /dev/null; then
        echo -e "${GREEN}✓ UFW防火墙允许端口 ${BACKEND_PORT}${NC}"
    else
        echo -e "${YELLOW}⚠ UFW防火墙可能阻止端口 ${BACKEND_PORT}${NC}"
        echo "运行: sudo ufw allow ${BACKEND_PORT}/tcp"
    fi
elif command -v firewall-cmd &> /dev/null; then
    if firewall-cmd --list-ports | grep "${BACKEND_PORT}" > /dev/null; then
        echo -e "${GREEN}✓ firewalld允许端口 ${BACKEND_PORT}${NC}"
    else
        echo -e "${YELLOW}⚠ firewalld可能阻止端口 ${BACKEND_PORT}${NC}"
        echo "运行: sudo firewall-cmd --add-port=${BACKEND_PORT}/tcp --permanent && sudo firewall-cmd --reload"
    fi
else
    echo -e "${YELLOW}⚠ 无法检测防火墙状态${NC}"
fi

echo ""
echo -e "${YELLOW}7. 检查阿里云安全组${NC}"
echo -e "${YELLOW}请手动检查阿里云控制台:${NC}"
echo "  1. 登录阿里云控制台"
echo "  2. 进入ECS实例 -> 安全组"
echo "  3. 确保入站规则允许 TCP ${BACKEND_PORT} 端口"

echo ""
echo -e "${YELLOW}8. 检查前端文件${NC}"
if [ -d "/var/www/html" ] || [ -d "/usr/share/nginx/html" ]; then
    echo -e "${GREEN}✓ Web服务器目录存在${NC}"
else
    echo -e "${YELLOW}⚠ 未找到标准Web服务器目录${NC}"
fi

echo ""
echo "======================================"
echo -e "${GREEN}检查完成！${NC}"
echo ""
echo "如果所有检查都通过但仍然无法访问，请检查："
echo "1. 阿里云安全组配置"
echo "2. 服务器公网IP是否正确"
echo "3. 域名解析（如果使用域名）"
echo "======================================"
