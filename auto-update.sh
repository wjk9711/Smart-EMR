#!/bin/bash

# EMR系统一键更新部署脚本
# 从GitHub拉取最新代码并重新构建部署
# 使用方法: bash auto-update.sh

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
GITHUB_REPO="https://github.com/wjk9711/Smart-EMR.git"
BACKUP_DIR="/opt/emr-backup"
INSTALL_DIR="/opt/emr-system"
BACKEND_PORT=3000
LOG_FILE="/var/log/emr-update.log"

# 日志函数
log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}✗ $1${NC}" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}ℹ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}" | tee -a "$LOG_FILE"
}

# 检查root权限
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用root权限运行此脚本: sudo bash $0"
        exit 1
    fi
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    local deps=("git" "node" "npm" "curl")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "$dep 未安装"
            exit 1
        fi
    done
    
    log_success "所有依赖已安装"
    log_info "Node.js版本: $(node --version)"
    log_info "npm版本: $(npm --version)"
    log_info "Git版本: $(git --version)"
}

# 备份当前版本
backup_current() {
    log_info "备份当前版本..."
    
    if [ -d "$INSTALL_DIR" ]; then
        BACKUP_PATH="${BACKUP_DIR}/backup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p "$BACKUP_PATH"
        
        # 备份后端
        if [ -d "${INSTALL_DIR}/emr-backend" ]; then
            cp -r "${INSTALL_DIR}/emr-backend" "${BACKUP_PATH}/"
            log_success "后端代码已备份到 ${BACKUP_PATH}/emr-backend"
        fi
        
        # 备份前端
        if [ -d "${INSTALL_DIR}/emr-frontend" ]; then
            cp -r "${INSTALL_DIR}/emr-frontend" "${BACKUP_PATH}/"
            log_success "前端代码已备份到 ${BACKUP_PATH}/emr-frontend"
        fi
        
        # 备份环境变量文件
        if [ -f "${INSTALL_DIR}/emr-backend/.env" ]; then
            cp "${INSTALL_DIR}/emr-backend/.env" "${BACKUP_PATH}/"
            log_success ".env配置文件已备份"
        fi
        
        # 保留最近5个备份
        cd "$BACKUP_DIR"
        ls -t | tail -n +6 | xargs -r rm -rf
        log_info "已清理旧备份，保留最近5个版本"
    else
        log_warning "安装目录不存在，跳过备份"
    fi
}

# 拉取最新代码
pull_latest_code() {
    log_info "从GitHub拉取最新代码..."
    
    if [ -d "$INSTALL_DIR" ]; then
        cd "$INSTALL_DIR"
        
        # 如果已经是git仓库，直接pull
        if [ -d ".git" ]; then
            git fetch origin
            git reset --hard origin/main
            log_success "代码已更新到最新版本"
        else
            # 否则重新克隆
            rm -rf "$INSTALL_DIR"
            git clone "$GITHUB_REPO" "$INSTALL_DIR"
            log_success "代码已克隆到 $INSTALL_DIR"
        fi
    else
        mkdir -p "$(dirname $INSTALL_DIR)"
        git clone "$GITHUB_REPO" "$INSTALL_DIR"
        log_success "代码已克隆到 $INSTALL_DIR"
    fi
    
    # 显示最新版本信息
    cd "$INSTALL_DIR"
    log_info "最新提交: $(git log -1 --pretty=format:'%h - %s (%cr)')"
}

# 恢复配置文件
restore_config() {
    log_info "恢复配置文件..."
    
    # 恢复后端.env文件
    if [ -f "${BACKUP_DIR}/.env" ] && [ -d "${INSTALL_DIR}/emr-backend" ]; then
        cp "${BACKUP_DIR}/.env" "${INSTALL_DIR}/emr-backend/.env"
        log_success "后端.env配置文件已恢复"
    else
        log_warning "未找到备份的.env文件，请手动配置"
        if [ ! -f "${INSTALL_DIR}/emr-backend/.env" ]; then
            cp "${INSTALL_DIR}/emr-backend/.env.example" "${INSTALL_DIR}/emr-backend/.env"
            log_warning "已从示例文件创建.env，请编辑配置数据库信息"
        fi
    fi
    
    # 恢复前端环境变量
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -1)
    if [ -f "${BACKUP_DIR}/${LATEST_BACKUP}/.env.production" ]; then
        cp "${BACKUP_DIR}/${LATEST_BACKUP}/.env.production" "${INSTALL_DIR}/emr-frontend/.env.production"
        log_success "前端生产环境配置已恢复"
    fi
}

# 安装后端依赖并构建
build_backend() {
    log_info "构建后端服务..."
    
    cd "${INSTALL_DIR}/emr-backend"
    
    # 安装依赖
    log_info "安装后端依赖..."
    npm install --production
    
    # 构建TypeScript
    log_info "编译TypeScript代码..."
    npm run build
    
    log_success "后端构建完成"
}

# 安装前端依赖并构建
build_frontend() {
    log_info "构建前端应用..."
    
    cd "${INSTALL_DIR}/emr-frontend"
    
    # 安装依赖
    log_info "安装前端依赖..."
    npm install
    
    # 确保生产环境配置正确
    if [ ! -f ".env.production" ]; then
        cat > .env.production << EOF
# 生产环境配置
VITE_API_BASE_URL=http://$(curl -s ifconfig.me):${BACKEND_PORT}
EOF
        log_warning "已创建默认.env.production，请根据实际情况修改"
    fi
    
    # 构建前端
    log_info "编译前端代码..."
    npm run build
    
    log_success "前端构建完成"
}

# 停止当前服务
stop_services() {
    log_info "停止当前运行的服务..."
    
    # 停止后端进程
    if pgrep -f "node.*dist/app.js" > /dev/null; then
        pkill -f "node.*dist/app.js"
        sleep 2
        log_success "后端服务已停止"
    else
        log_info "后端服务未运行"
    fi
}

# 启动后端服务
start_backend() {
    log_info "启动后端服务..."
    
    cd "${INSTALL_DIR}/emr-backend"
    
    # 使用pm2或nohup启动
    if command -v pm2 &> /dev/null; then
        pm2 delete emr-backend 2>/dev/null || true
        pm2 start dist/app.js --name emr-backend
        pm2 save
        log_success "后端服务已通过PM2启动"
    else
        nohup node dist/app.js > backend.log 2>&1 &
        echo $! > backend.pid
        log_success "后端服务已启动 (PID: $(cat backend.pid))"
    fi
    
    # 等待服务启动
    sleep 3
    
    # 验证服务
    if curl -s http://localhost:${BACKEND_PORT}/health > /dev/null; then
        log_success "后端服务运行正常"
    else
        log_error "后端服务启动失败，请查看日志: ${INSTALL_DIR}/emr-backend/backend.log"
        exit 1
    fi
}

# 部署前端静态文件
deploy_frontend() {
    log_info "部署前端静态文件..."
    
    WEB_ROOT="/var/www/html"
    
    # 创建Web目录
    mkdir -p "$WEB_ROOT"
    
    # 复制前端文件
    rm -rf "${WEB_ROOT:?}/"*
    cp -r "${INSTALL_DIR}/emr-frontend/dist/"* "$WEB_ROOT/"
    
    # 设置权限
    chown -R www-data:www-data "$WEB_ROOT" 2>/dev/null || chown -R nginx:nginx "$WEB_ROOT" 2>/dev/null || true
    chmod -R 755 "$WEB_ROOT"
    
    log_success "前端文件已部署到 $WEB_ROOT"
}

# 配置Nginx（如果安装了）
configure_nginx() {
    if command -v nginx &> /dev/null; then
        log_info "配置Nginx..."
        
        NGINX_CONF="/etc/nginx/sites-available/emr"
        
        cat > "$NGINX_CONF" << 'EOF'
server {
    listen 80;
    server_name _;

    # 前端静态文件
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 上传文件
    client_max_body_size 10m;
}
EOF
        
        # 启用配置
        ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/emr
        nginx -t && systemctl restart nginx
        
        log_success "Nginx配置完成并重启"
    else
        log_warning "Nginx未安装，前端将通过后端端口访问"
    fi
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        ufw allow 80/tcp 2>/dev/null || true
        ufw allow 443/tcp 2>/dev/null || true
        ufw allow ${BACKEND_PORT}/tcp 2>/dev/null || true
        log_success "UFW防火墙规则已添加"
    elif command -v firewall-cmd &> /dev/null; then
        firewall-cmd --add-port=80/tcp --permanent 2>/dev/null || true
        firewall-cmd --add-port=443/tcp --permanent 2>/dev/null || true
        firewall-cmd --add-port=${BACKEND_PORT}/tcp --permanent 2>/dev/null || true
        firewall-cmd --reload 2>/dev/null || true
        log_success "firewalld规则已添加"
    else
        log_warning "未检测到防火墙管理工具，请手动配置"
    fi
}

# 验证部署
verify_deployment() {
    log_info "验证部署..."
    
    # 测试健康检查
    if curl -s http://localhost:${BACKEND_PORT}/health > /dev/null; then
        log_success "✓ 后端健康检查通过"
    else
        log_error "✗ 后端健康检查失败"
        return 1
    fi
    
    # 测试前端
    if curl -s http://localhost/ | grep -q "html"; then
        log_success "✓ 前端页面可访问"
    else
        log_warning "⚠ 前端页面访问异常"
    fi
    
    # 获取公网IP
    PUBLIC_IP=$(curl -s ifconfig.me)
    log_info "=========================================="
    log_success "部署完成！"
    log_info "=========================================="
    log_info "访问地址:"
    log_info "  - 前端: http://${PUBLIC_IP}"
    log_info "  - API: http://${PUBLIC_IP}:${BACKEND_PORT}/api"
    log_info "  - 健康检查: http://${PUBLIC_IP}:${BACKEND_PORT}/health"
    log_info "=========================================="
    log_info "默认登录账号:"
    log_info "  - 用户名: admin"
    log_info "  - 密码: admin123"
    log_info "=========================================="
}

# 清理临时文件
cleanup() {
    log_info "清理临时文件..."
    cd "${INSTALL_DIR}"
    find . -name "*.log" -mtime +7 -delete 2>/dev/null || true
    log_success "清理完成"
}

# 主函数
main() {
    echo ""
    echo "=========================================="
    echo "  EMR系统一键更新部署脚本"
    echo "  GitHub: ${GITHUB_REPO}"
    echo "=========================================="
    echo ""
    
    # 询问用户确认
    read -p "即将从GitHub拉取最新代码并重新部署，是否继续？(y/n): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        log_info "操作已取消"
        exit 0
    fi
    
    log_info "开始更新部署流程..."
    echo ""
    
    # 执行部署步骤
    check_root
    check_dependencies
    backup_current
    pull_latest_code
    restore_config
    stop_services
    build_backend
    build_frontend
    deploy_frontend
    configure_nginx
    start_backend
    configure_firewall
    verify_deployment
    cleanup
    
    echo ""
    log_success "=========================================="
    log_success "  部署成功完成！"
    log_success "=========================================="
    echo ""
    log_info "日志文件: ${LOG_FILE}"
    log_info "备份目录: ${BACKUP_DIR}"
    echo ""
}

# 执行主函数
main "$@"
