<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreateUser">
              <el-icon><Plus /></el-icon>
              新增用户
            </el-button>
            <el-button type="success" @click="handleBatchCreate">
              <el-icon><CopyDocument /></el-icon>
              批量创建
            </el-button>
            <el-button 
              type="danger" 
              @click="handleBatchDelete"
              :disabled="selectedUsers.length === 0"
            >
              <el-icon><Delete /></el-icon>
              批量删除 ({{ selectedUsers.length }})
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchParams.keyword" placeholder="用户名或姓名" clearable />
        </el-form-item>
        <el-form-item label="角色类型">
          <el-select v-model="searchParams.roleType" placeholder="请选择" clearable>
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchParams.status" placeholder="请选择" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 用户表格 -->
      <el-table 
        :data="userList" 
        v-loading="loading" 
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="roleType" label="角色类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTypeTag(row.roleType)">
              {{ getRoleTypeText(row.roleType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchUsers"
        @current-change="fetchUsers"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑用户' : '新增用户'" 
      width="500px"
    >
      <el-form :model="userForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="isEdit" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="角色类型" prop="roleType">
          <el-select v-model="userForm.roleType" placeholder="请选择角色类型" style="width: 100%">
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="userForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUserForm" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量创建对话框 -->
    <el-dialog v-model="batchDialogVisible" title="批量创建用户" width="500px">
      <el-form :model="batchForm" label-width="120px">
        <el-form-item label="起始编号">
          <el-input-number v-model="batchForm.startNumber" :min="1" :max="9999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束编号">
          <el-input-number v-model="batchForm.endNumber" :min="1" :max="9999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="角色类型">
          <el-select v-model="batchForm.roleType" placeholder="请选择" style="width: 100%">
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名前缀">
          <el-input v-model="batchForm.namePrefix" placeholder="如：student" />
        </el-form-item>
        <el-form-item label="密码前缀">
          <el-input v-model="batchForm.passwordPrefix" placeholder="如：pwd" />
        </el-form-item>
        <el-alert
          title="说明"
          type="info"
          :closable="false"
          style="margin-top: 10px;"
        >
          <div>将创建用户：{{ batchForm.namePrefix || 'student' }}{{ String(batchForm.startNumber).padStart(4, '0') }} ~ {{ batchForm.namePrefix || 'student' }}{{ String(batchForm.endNumber).padStart(4, '0') }}</div>
          <div>密码格式：{{ batchForm.passwordPrefix || 'pwd' }}{{ String(batchForm.startNumber).padStart(4, '0') }} ~ {{ batchForm.passwordPrefix || 'pwd' }}{{ String(batchForm.endNumber).padStart(4, '0') }}</div>
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatchCreate" :loading="batchSubmitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus, CopyDocument, Delete } from '@element-plus/icons-vue'
import { getUserList, createUser, updateUser, deleteUser, batchCreateUsers, batchDeleteUsers } from '@/api/user'

const loading = ref(false)
const userList = ref<any[]>([])
const selectedUsers = ref<any[]>([])
const dialogVisible = ref(false)
const batchDialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const batchSubmitting = ref(false)
const formRef = ref<FormInstance>()

const searchParams = reactive({
  keyword: '',
  roleType: '',
  status: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const userForm = reactive({
  id: null as number | null,
  username: '',
  password: '',
  realName: '',
  roleType: 'student',
  status: 'active',
})

const batchForm = reactive({
  startNumber: 1,
  endNumber: 10,
  roleType: 'student',
  namePrefix: 'student',
  passwordPrefix: 'pwd',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  roleType: [{ required: true, message: '请选择角色类型', trigger: 'change' }],
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const response: any = await getUserList({
      ...searchParams,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })
    
    userList.value = response.list || []
    pagination.total = response.total || 0
  } catch (error: any) {
    console.error('Failed to fetch users:', error)
    ElMessage.error(error.message || '加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchUsers()
}

// 重置
const handleReset = () => {
  searchParams.keyword = ''
  searchParams.roleType = ''
  searchParams.status = ''
  handleSearch()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedUsers.value = selection
}

// 新增用户
const handleCreateUser = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(userForm, {
    id: row.id,
    username: row.username,
    realName: row.realName,
    roleType: row.roleType,
    status: row.status,
  })
  dialogVisible.value = true
}

// 删除用户
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户"${row.username}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    fetchUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要删除的用户')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const ids = selectedUsers.value.map(u => u.id)
    await batchDeleteUsers(ids)
    
    ElMessage.success(`成功删除 ${selectedUsers.value.length} 个用户`)
    selectedUsers.value = []
    fetchUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

// 批量创建
const handleBatchCreate = () => {
  batchDialogVisible.value = true
}

// 提交用户表单
const submitUserForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      if (isEdit.value) {
        await updateUser(userForm.id!, {
          realName: userForm.realName,
          roleType: userForm.roleType,
          status: userForm.status,
        })
        ElMessage.success('更新成功')
      } else {
        await createUser(userForm)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchUsers()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 提交批量创建
const submitBatchCreate = async () => {
  if (batchForm.startNumber > batchForm.endNumber) {
    ElMessage.warning('起始编号不能大于结束编号')
    return
  }
  
  batchSubmitting.value = true
  try {
    const result: any = await batchCreateUsers(batchForm)
    ElMessage.success(result.message || `成功创建${result.data.successCount}个用户`)
    batchDialogVisible.value = false
    fetchUsers()
  } catch (error: any) {
    ElMessage.error(error.message || '批量创建失败')
  } finally {
    batchSubmitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  userForm.id = null
  userForm.username = ''
  userForm.password = ''
  userForm.realName = ''
  userForm.roleType = 'student'
  userForm.status = 'active'
}

// 获取角色类型标签
const getRoleTypeTag = (roleType: string) => {
  const tags: Record<string, any> = {
    student: '',
    teacher: 'success',
    admin: 'danger',
  }
  return tags[roleType] || ''
}

// 获取角色类型文本
const getRoleTypeText = (roleType: string) => {
  const texts: Record<string, string> = {
    student: '学生',
    teacher: '教师',
    admin: '管理员',
  }
  return texts[roleType] || roleType
}

// 格式化时间
const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped lang="scss">
.user-management {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .search-form {
    margin-bottom: 20px;
  }
}
</style>
