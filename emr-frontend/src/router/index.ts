import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/outpatient/patients',
    meta: { requiresAuth: true },
    children: [
      // 门诊模块
      {
        path: '/outpatient/patients',
        name: 'PatientList',
        component: () => import('@/views/outpatient/PatientList.vue'),
        meta: { title: '患者列表', module: 'outpatient' },
      },
      {
        path: '/outpatient/records',
        name: 'RecordList',
        component: () => import('@/views/outpatient/RecordList.vue'),
        meta: { title: '病历列表', module: 'outpatient' },
      },
      {
        path: '/outpatient/record/create/:visitId?',
        name: 'RecordEditor',
        component: () => import('@/views/outpatient/RecordEditor.vue'),
        meta: { title: '病历编辑', module: 'outpatient' },
      },
      {
        path: '/outpatient/record/edit/:id',
        name: 'RecordEditorEdit',
        component: () => import('@/views/outpatient/RecordEditor.vue'),
        meta: { title: '编辑病历', module: 'outpatient' },
      },
      {
        path: '/outpatient/record/view/:id',
        name: 'RecordViewer',
        component: () => import('@/views/outpatient/RecordViewer.vue'),
        meta: { title: '病历查看', module: 'outpatient' },
      },

      // 住院模块
      {
        path: '/inpatient',
        name: 'Inpatient',
        component: () => import('@/views/inpatient/Index.vue'),
        meta: { title: '住院管理', module: 'inpatient' },
      },
      {
        path: '/inpatient/patients',
        name: 'InpatientPatientList',
        component: () => import('@/views/inpatient/InpatientPatientList.vue'),
        meta: { title: '住院患者列表', module: 'inpatient' },
      },
      {
        path: '/inpatient/records',
        name: 'InpatientRecordList',
        component: () => import('@/views/inpatient/InpatientRecordList.vue'),
        meta: { title: '病案列表', module: 'inpatient' },
      },
      {
        path: '/inpatient/sample',
        name: 'InpatientSample',
        component: () => import('@/views/inpatient/SamplePreview.vue'),
        meta: { title: '样例界面预览', module: 'inpatient' },
      },
      {
        path: '/inpatient/record/:id',
        name: 'InpatientRecord',
        component: () => import('@/views/inpatient/InpatientRecord.vue'),
        meta: { title: '住院病案首页', module: 'inpatient' },
      },
      
      // 质控模块 (预留)
      {
        path: '/quality',
        name: 'Quality',
        component: () => import('@/views/quality/Index.vue'),
        meta: { title: '病历质控', module: 'quality' },
      },
      {
        path: '/quality/control-evaluation',
        name: 'QualityControlEvaluation',
        component: () => import('@/views/quality/QualityControlEvaluation.vue'),
        meta: { title: '质控评价', module: 'quality', requiresAuth: true, roles: ['teacher', 'admin'] },
      },
      {
        path: '/quality/group-control',
        name: 'GroupQualityControl',
        component: () => import('@/views/quality/GroupQualityControl.vue'),
        meta: { title: '小组质控', module: 'quality', requiresAuth: true, roles: ['teacher', 'admin'] },
      },
      {
        path: '/quality/reports',
        name: 'QualityReportList',
        component: () => import('@/views/quality/QualityReportList.vue'),
        meta: { title: '质控报告', module: 'quality' },
      },
      {
        path: '/quality/review',
        name: 'TeacherReview',
        component: () => import('@/views/quality/TeacherReview.vue'),
        meta: { title: '住院病历审核', module: 'quality', requiresAuth: true, roles: ['teacher', 'admin'] },
      },
      {
        path: '/quality/outpatient-review',
        name: 'OutpatientReview',
        component: () => import('@/views/quality/OutpatientReview.vue'),
        meta: { title: '门诊病历审核', module: 'quality', requiresAuth: true, roles: ['teacher', 'admin'] },
      },
      
      // 护理模块 (预留)
      {
        path: '/nursing',
        name: 'Nursing',
        component: () => import('@/views/nursing/Index.vue'),
        meta: { title: '护理记录', module: 'nursing' },
      },
      
      // 系统管理
      {
        path: '/system/users',
        name: 'UserManage',
        component: () => import('@/views/system/UserManage.vue'),
        meta: { title: '用户管理', module: 'system' },
      },
      {
        path: '/system/roles',
        name: 'RoleManage',
        component: () => import('@/views/system/RoleManage.vue'),
        meta: { title: '角色管理', module: 'system' },
      },
      {
        path: '/system/departments',
        name: 'DepartmentManage',
        component: () => import('@/views/system/DepartmentManage.vue'),
        meta: { title: '科室管理', module: 'system' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    // 检查系统管理模块的权限（仅管理员可访问）
    if (to.path.startsWith('/system')) {
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr)
          if (userInfo.roleType !== 'admin') {
            next('/')
            return
          }
        } catch (e) {
          // 如果解析失败，允许访问（由后端API控制权限）
        }
      }
    }
    
    // 检查教师审核页面的权限（仅教师和管理员可访问）
    if (to.path === '/quality/review' || to.path === '/quality/outpatient-review' || 
        to.path === '/quality/control-evaluation' || to.path === '/quality/group-control') {
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr)
          if (userInfo.roleType !== 'teacher' && userInfo.roleType !== 'admin') {
            ElMessage.warning('无权访问：只有教师可以访问质控功能')
            next('/')
            return
          }
        } catch (e) {
          // 如果解析失败，允许访问（由后端API控制权限）
        }
      }
    }
    
    next()
  }
})

export default router
