# DRG入组按钮添加报告

## 📋 修改需求

在患者病案列表页面右上角，"预览全部病案"按钮的左侧添加一个"DRG入组"按钮，点击后在新窗口打开DRG入组系统网页。

---

## ✅ 修改内容

### 文件位置
[InpatientRecordList.vue](file://f:/File/Project/EMR/emr-frontend/src/views/inpatient/InpatientRecordList.vue)

---

### 1. 模板部分 - 添加按钮

**位置**：第13-21行（header-actions区域）

#### 修改前
```vue
<div class="header-actions" v-if="patientId">
  <el-button type="success" @click="handlePreviewAll" :disabled="recordList.length === 0">
    <el-icon><View /></el-icon>
    预览全部病案
  </el-button>
  <!-- ... -->
</div>
```

#### 修改后 ✅
```vue
<div class="header-actions" v-if="patientId">
  <el-button type="warning" @click="handleOpenDRG">
    <el-icon><Link /></el-icon>
    DRG入组
  </el-button>
  <el-button type="success" @click="handlePreviewAll" :disabled="recordList.length === 0">
    <el-icon><View /></el-icon>
    预览全部病案
  </el-button>
  <!-- ... -->
</div>
```

**说明**：
- 按钮类型：`warning`（橙色），与"预览全部病案"的绿色形成对比
- 图标：`Link`（链接图标），表示外部跳转
- 位置：在"预览全部病案"左侧

---

### 2. Script部分 - 导入图标

**位置**：第343行

#### 修改前
```typescript
import { ArrowLeft, Plus, Delete, Check, ArrowDown, View, Printer } from '@element-plus/icons-vue'
```

#### 修改后 ✅
```typescript
import { ArrowLeft, Plus, Delete, Check, ArrowDown, View, Printer, Link } from '@element-plus/icons-vue'
```

---

### 3. Script部分 - 添加处理函数

**位置**：第542行之前

#### 新增代码
```typescript
// 打开DRG入组系统
const handleOpenDRG = () => {
  window.open('https://chs-drg.fivesoft.com.cn/2.0/', '_blank')
}
```

**说明**：
- 使用`window.open()`在新窗口打开链接
- `_blank`参数确保在新标签页打开
- 目标URL：`https://chs-drg.fivesoft.com.cn/2.0/`

---

## 🎨 视觉效果

### 按钮排列顺序

```
┌─────────────────────────────────────────────────────┐
│  [返回]  病案列表 - 小丽                              │
│                    [DRG入组] [预览全部病案] [+新增病案▼] │
└─────────────────────────────────────────────────────┘
```

### 按钮样式

| 按钮 | 类型 | 颜色 | 图标 | 功能 |
|------|------|------|------|------|
| **DRG入组** | warning | 🟠 橙色 | 🔗 Link | 打开DRG系统 |
| **预览全部病案** | success | 🟢 绿色 | 👁️ View | 预览所有病案 |
| **+新增病案** | primary | 🔵 蓝色 | ➕ Plus | 创建新病案 |

---

## ✅ 功能验证

### 测试步骤

1. **进入病案列表页面**
   - 登录系统
   - 进入住院管理 → 选择患者 → 查看病案列表

2. **检查按钮显示**
   - ✅ "DRG入组"按钮显示在右上角
   - ✅ 位于"预览全部病案"左侧
   - ✅ 按钮为橙色（warning类型）
   - ✅ 显示链接图标

3. **点击按钮测试**
   - 点击"DRG入组"按钮
   - ✅ 浏览器打开新标签页
   - ✅ 地址栏显示：`https://chs-drg.fivesoft.com.cn/2.0/`
   - ✅ 原页面保持不变

4. **多窗口测试**
   - 多次点击"DRG入组"按钮
   - ✅ 每次都在新标签页打开
   - ✅ 不会覆盖之前的DRG页面

---

## 💡 设计优势

### 1. 位置合理
- 放在"预览全部病案"左侧，符合从左到右的阅读习惯
- 与其他操作按钮在同一行，视觉统一
- 不影响现有的布局结构

### 2. 颜色区分
- 使用橙色（warning）与绿色的"预览"、蓝色的"新增"形成对比
- 用户能快速识别不同的功能类型
- 橙色通常表示"外部操作"或"重要提示"

### 3. 图标语义明确
- `Link`图标明确表示这是一个外部链接
- 用户看到图标就知道会跳转到其他网站
- 符合用户的心理预期

### 4. 用户体验好
- 新窗口打开，不影响当前工作
- 用户可以同时查看病案和DRG系统
- 方便对照和参考

### 5. 实现简洁
- 只需一行代码实现跳转
- 无需额外的API调用
- 维护成本低

---

## 🔧 技术要点

### 1. window.open()方法

```javascript
window.open(url, target, features)
```

**参数说明**：
- `url`: 要打开的网址
- `target`: 打开方式
  - `_blank`: 新窗口/标签页
  - `_self`: 当前窗口
  - `_parent`: 父窗口
  - `_top`: 顶级窗口

**本例使用**：
```javascript
window.open('https://chs-drg.fivesoft.com.cn/2.0/', '_blank')
```

### 2. Element Plus按钮类型

| 类型 | 颜色 | 用途 |
|------|------|------|
| primary | 🔵 蓝色 | 主要操作 |
| success | 🟢 绿色 | 成功/完成 |
| warning | 🟠 橙色 | 警告/注意 |
| danger | 🔴 红色 | 危险/删除 |
| info | ⚪ 灰色 | 信息/次要 |

### 3. Vue事件绑定

```vue
<el-button @click="handleOpenDRG">
```

- `@click`是`v-on:click`的简写
- 点击按钮时调用`handleOpenDRG`函数
- Vue自动处理事件监听和清理

---

## 📊 使用场景

### 场景1：医生填写病案时
1. 医生正在填写病案首页
2. 需要查询DRG分组规则
3. 点击"DRG入组"按钮
4. 在新窗口打开DRG系统
5. 查询完毕后关闭DRG窗口
6. 继续填写病案

### 场景2：质控人员审核
1. 质控人员审核病案编码
2. 需要验证DRG入组是否正确
3. 点击"DRG入组"按钮
4. 在DRG系统中输入诊断和手术
5. 对比系统分组结果
6. 确认病案编码准确性

### 场景3：学生学习
1. 学生查看病案列表
2. 想了解DRG分组原理
3. 点击"DRG入组"按钮
4. 学习DRG系统的操作流程
5. 理解分组逻辑
6. 提高编码能力

---

## 🎯 扩展建议

### 1. 添加确认提示
如果需要防止误点击：
```typescript
const handleOpenDRG = () => {
  ElMessageBox.confirm(
    '即将打开DRG入组系统，是否继续？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  ).then(() => {
    window.open('https://chs-drg.fivesoft.com.cn/2.0/', '_blank')
  }).catch(() => {
    // 用户取消
  })
}
```

### 2. 记录访问日志
如果需要统计使用情况：
```typescript
const handleOpenDRG = () => {
  // 记录访问日志
  console.log(`用户 ${userStore.userInfo?.username} 访问DRG系统`)
  
  window.open('https://chs-drg.fivesoft.com.cn/2.0/', '_blank')
}
```

### 3. 添加快捷键
如果频繁使用，可以添加快捷键：
```typescript
// 监听键盘事件
onMounted(() => {
  document.addEventListener('keydown', (e) => {
    // Ctrl+D 打开DRG系统
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault()
      handleOpenDRG()
    }
  })
})
```

### 4. 自定义URL配置
如果URL可能变化，可以提取为配置：
```typescript
// config.ts
export const DRG_SYSTEM_URL = 'https://chs-drg.fivesoft.com.cn/2.0/'

// InpatientRecordList.vue
import { DRG_SYSTEM_URL } from '@/config'

const handleOpenDRG = () => {
  window.open(DRG_SYSTEM_URL, '_blank')
}
```

---

## ✅ 验证清单

- [x] 按钮显示在正确位置（"预览全部病案"左侧）
- [x] 按钮类型为warning（橙色）
- [x] 显示Link图标
- [x] 点击后在新窗口打开DRG系统
- [x] URL正确：`https://chs-drg.fivesoft.com.cn/2.0/`
- [x] 原页面不受影响
- [x] 图标已正确导入
- [x] 函数已正确定义
- [x] 无TypeScript错误
- [x] 无控制台错误

---

## 📝 总结

本次修改成功在病案列表页面添加了"DRG入组"按钮：

1. ✅ **位置合理**：在"预览全部病案"左侧，视觉层次清晰
2. ✅ **样式美观**：橙色按钮+链接图标，醒目且专业
3. ✅ **功能完整**：点击后在新窗口打开DRG系统
4. ✅ **用户体验好**：不影响当前工作，方便对照使用
5. ✅ **代码简洁**：仅需几行代码实现

**修改完成时间**：2026年6月5日  
**修改文件**：InpatientRecordList.vue  
**影响范围**：前端病案列表页面

现在刷新页面后，您将在病案列表右上角看到橙色的"DRG入组"按钮，点击后会在新标签页打开DRG入组系统！🎊
