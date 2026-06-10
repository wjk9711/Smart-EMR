# EMR系统部署流程图

## 📊 完整部署流程

```mermaid
graph TB
    Start[开始] --> CheckEnv{检查环境}
    CheckEnv -->|缺少依赖| InstallDeps[安装Node.js/Git/Nginx]
    CheckEnv -->|依赖齐全| ChooseScript{选择脚本}
    
    InstallDeps --> ChooseScript
    
    ChooseScript -->|首次部署| AutoUpdate[auto-update.sh]
    ChooseScript -->|日常更新| QuickUpdate[quick-update.sh]
    ChooseScript -->|本地测试| UpdateLocal[update-local.bat]
    
    AutoUpdate --> Backup[备份当前版本]
    Backup --> PullCode[从GitHub拉取代码]
    PullCode --> RestoreConfig[恢复配置文件]
    RestoreConfig --> BuildBackend[构建后端]
    BuildBackend --> BuildFrontend[构建前端]
    BuildFrontend --> DeployFiles[部署前端文件]
    DeployFiles --> ConfigNginx[配置Nginx]
    ConfigNginx --> StartService[启动服务]
    StartService --> Verify{验证部署}
    
    QuickUpdate --> PullCode2[拉取最新代码]
    PullCode2 --> StopService[停止服务]
    StopService --> BuildBackend2[构建后端]
    BuildBackend2 --> BuildFrontend2[构建前端]
    BuildFrontend2 --> DeployFiles2[部署前端]
    DeployFiles2 --> StartService2[启动服务]
    StartService2 --> Verify2{验证部署}
    
    Verify -->|成功| ShowInfo[显示访问信息]
    Verify -->|失败| CheckLog[查看日志排查]
    
    Verify2 -->|成功| ShowInfo2[显示访问信息]
    Verify2 -->|失败| CheckLog2[查看日志排查]
    
    CheckLog --> FixIssue[修复问题]
    FixIssue --> AutoUpdate
    
    CheckLog2 --> FixIssue2[修复问题]
    FixIssue2 --> QuickUpdate
    
    ShowInfo --> End[部署完成]
    ShowInfo2 --> End
```

---

## 🔄 日常更新流程

```mermaid
graph LR
    A[SSH登录服务器] --> B[cd /opt/emr-system]
    B --> C[bash quick-update.sh]
    C --> D{更新成功?}
    D -->|是| E[访问系统测试]
    D -->|否| F[查看日志]
    F --> G[排查问题]
    G --> C
    E --> H[完成]
```

---

## 🏗️ 系统架构

```mermaid
graph TB
    User[用户浏览器] --> Internet[互联网]
    Internet --> Firewall[防火墙/安全组]
    Firewall --> Nginx[Nginx Web服务器]
    
    Nginx -->|静态文件| Frontend[/var/www/html<br/>Vue前端]
    Nginx -->|API代理| Backend[Node.js后端<br/>0.0.0.0:3000]
    
    Backend --> Database[(MySQL数据库<br/>emr_system)]
    Backend --> FileSystem[文件系统<br/>uploads/]
    
    Frontend -->|API请求| Nginx
    Backend -->|JWT认证| Backend
```

---

## 📁 目录结构

```mermaid
graph TD
    Root[/opt/emr-system] --> Backend[emr-backend/]
    Root --> Frontend[emr-frontend/]
    
    Backend --> BackendSrc[src/]
    Backend --> BackendDist[dist/]
    Backend --> BackendEnv[.env]
    Backend --> BackendNode[node_modules/]
    
    Frontend --> FrontendSrc[src/]
    Frontend --> FrontendDist[dist/]
    Frontend --> FrontendEnv[.env.production]
    Frontend --> FrontendNode[node_modules/]
    
    FrontendDist --> Deploy[/var/www/html/]
    
    Root --> Git[.git/]
    Root --> Scripts[部署脚本]
    
    Backup[/opt/emr-backup] --> Backup1[backup-20240101/]
    Backup --> Backup2[backup-20240102/]
```

---

## 🔧 配置流程

```mermaid
graph TB
    Start[开始配置] --> Step1[1. 配置后端.env]
    Step1 --> DBConfig[数据库配置]
    DBConfig --> JWTConfig[JWT密钥配置]
    JWTConfig --> Step2[2. 配置前端.env.production]
    
    Step2 --> APIConfig[API地址配置]
    APIConfig --> Step3[3. 配置Nginx]
    
    Step3 --> NginxConf[创建配置文件]
    NginxConf --> EnableSite[启用站点]
    EnableSite --> RestartNginx[重启Nginx]
    
    RestartNginx --> Step4[4. 配置防火墙]
    Step4 --> OpenPorts[开放80/443/3000端口]
    OpenPorts --> Step5[5. 配置阿里云安全组]
    
    Step5 --> AddRules[添加入站规则]
    AddRules --> Complete[配置完成]
```

---

## 🐛 故障排查流程

```mermaid
graph TB
    Problem[遇到问题] --> Type{问题类型}
    
    Type -->|404错误| NotFound[API返回404]
    Type -->|500错误| ServerError[服务器内部错误]
    Type -->|无法访问| NoAccess[页面无法加载]
    Type -->|慢/卡顿| Performance[性能问题]
    
    NotFound --> CheckBackend{后端运行?}
    CheckBackend -->|否| StartBackend[启动后端服务]
    CheckBackend -->|是| CheckPort{端口监听?}
    CheckPort -->|否| FixPort[修复端口配置]
    CheckPort -->|是| CheckFirewall{防火墙开放?}
    CheckFirewall -->|否| OpenFirewall[开放端口]
    CheckFirewall -->|是| CheckNginx{Nginx配置?}
    CheckNginx -->|错误| FixNginx[修复Nginx配置]
    CheckNginx -->|正确| CheckRoute[检查路由配置]
    
    ServerError --> CheckLog[查看后端日志]
    CheckLog --> FindError[定位错误原因]
    FindError --> FixCode[修复代码或配置]
    FixCode --> Restart[重启服务]
    
    NoAccess --> CheckNetwork{网络连通?}
    CheckNetwork -->|否| CheckNetworkConfig[检查网络配置]
    CheckNetwork -->|是| CheckDNS{DNS解析?}
    CheckDNS -->|错误| FixDNS[修复DNS]
    CheckDNS -->|正确| CheckServer{服务器状态?}
    CheckServer -->|宕机| RestartServer[重启服务器]
    CheckServer -->|正常| CheckService[检查服务状态]
    
    Performance --> CheckResource{资源充足?}
    CheckResource -->|否| UpgradeResource[升级资源配置]
    CheckResource -->|是| OptimizeCode[优化代码]
    OptimizeCode --> EnableCache[启用缓存]
    
    StartBackend --> Test{测试通过?}
    FixPort --> Test
    OpenFirewall --> Test
    FixNginx --> Test
    CheckRoute --> Test
    Restart --> Test
    FixCode --> Test
    CheckNetworkConfig --> Test
    FixDNS --> Test
    RestartServer --> Test
    CheckService --> Test
    UpgradeResource --> Test
    EnableCache --> Test
    
    Test -->|是| Solved[问题解决]
    Test -->|否| GetHelp[寻求帮助]
    GetHelp --> CheckDoc[查阅文档]
    CheckDoc --> SubmitIssue[提交GitHub Issue]
```

---

## 📋 更新检查清单

```mermaid
graph TD
    Start[开始更新] --> Step1[1. 备份数据]
    Step1 --> Step2[2. 拉取代码]
    Step2 --> Step3[3. 停止服务]
    Step3 --> Step4[4. 安装依赖]
    Step4 --> Step5[5. 构建项目]
    Step5 --> Step6[6. 部署文件]
    Step6 --> Step7[7. 启动服务]
    Step7 --> Step8[8. 验证功能]
    
    Step8 --> Check1{健康检查?}
    Check1 -->|失败| Rollback[回滚版本]
    Check1 -->|通过| Check2{API测试?}
    
    Check2 -->|失败| Rollback
    Check2 -->|通过| Check3{前端页面?}
    
    Check3 -->|失败| Rollback
    Check3 -->|通过| Check4{数据库连接?}
    
    Check4 -->|失败| Rollback
    Check4 -->|通过| Check5{文件上传?}
    
    Check5 -->|失败| Rollback
    Check5 -->|通过| Success[更新成功]
    
    Rollback --> Restore[恢复备份]
    Restore --> Investigate[调查问题]
    Investigate --> Start
```

---

## 🎯 决策树：选择哪个脚本？

```mermaid
graph TB
    Start[需要部署/更新] --> Q1{在哪里部署?}
    
    Q1 -->|服务器| Q2{首次部署还是更新?}
    Q1 -->|本地电脑| Q3{什么操作系统?}
    
    Q2 -->|首次部署| UseAuto[使用 auto-update.sh]
    Q2 -->|日常更新| UseQuick[使用 quick-update.sh]
    
    Q3 -->|Windows| UseBat[使用 update-local.bat]
    Q3 -->|Linux/Mac| UseDeploy[使用 deploy.sh]
    
    UseAuto --> Note1[✅ 完整功能<br/>✅ 自动备份<br/>✅ 配置Nginx<br/>⏱️ 耗时较长]
    UseQuick --> Note2[✅ 快速更新<br/>❌ 无备份<br/>❌ 无配置<br/>⚡ 速度快]
    UseBat --> Note3[✅ Windows友好<br/>✅ 本地测试<br/>❌ 不部署Web]
    UseDeploy --> Note4[✅ 构建验证<br/>✅ 检查配置<br/>❌ 不启动服务]
    
    Note1 --> End[执行脚本]
    Note2 --> End
    Note3 --> End
    Note4 --> End
```

---

## 📊 时间估算

| 操作 | 预计时间 | 说明 |
|------|---------|------|
| 首次部署（auto-update.sh） | 5-10分钟 | 包含依赖安装、构建、配置 |
| 日常更新（quick-update.sh） | 1-3分钟 | 仅拉取代码和重新构建 |
| 本地更新（update-local.bat） | 2-5分钟 | Windows环境，不包含部署 |
| 问题排查 | 5-30分钟 | 取决于问题复杂度 |
| 回滚操作 | 2-5分钟 | 从备份恢复 |

---

## 🔍 监控指标

```mermaid
graph LR
    Monitor[监控系统] --> CPU[CPU使用率]
    Monitor --> Memory[内存使用]
    Monitor --> Disk[磁盘空间]
    Monitor --> Network[网络流量]
    
    Monitor --> Service1[后端服务状态]
    Monitor --> Service2[Nginx状态]
    Monitor --> Service3[数据库连接]
    
    Monitor --> Log1[错误日志]
    Monitor --> Log2[访问日志]
    Monitor --> Log3[性能日志]
    
    CPU --> Alert{异常?}
    Memory --> Alert
    Disk --> Alert
    Service1 --> Alert
    Service2 --> Alert
    Service3 --> Alert
    
    Alert -->|是| Notify[发送告警]
    Alert -->|否| Continue[继续监控]
    
    Notify --> Action[采取行动]
    Action --> Fix[修复问题]
```

---

**提示**: 可以将这些流程图保存为图片，方便团队参考和培训使用。
