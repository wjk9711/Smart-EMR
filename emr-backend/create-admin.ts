import sequelize from './src/config/database'
import { User } from './src/models'
import bcrypt from 'bcryptjs'

async function createAdminUser() {
  try {
    // 测试数据库连接
    await sequelize.authenticate()
    console.log('✓ 数据库连接成功')

    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { username: 'wangjk' } })
    
    if (existingUser) {
      console.log('⚠ 用户 wangjk 已存在，更新为管理员...')
      
      // 更新为管理员
      await existingUser.update({
        roleType: 'admin',
        realName: '王建国',
        status: 'active',
      })
      
      console.log('✓ 用户已更新为管理员')
      console.log('用户名: wangjk')
      console.log('角色: admin')
      console.log('姓名: 王建国')
    } else {
      // 创建新用户（直接传入明文密码，beforeCreate hook会自动加密）
      const user = await User.create({
        username: 'wangjk',
        passwordHash: '912210747', // beforeCreate hook会自动加密
        realName: '王建国',
        roleType: 'admin',
        status: 'active',
      })
      
      console.log('✓ 管理员账户创建成功')
      console.log('用户名: wangjk')
      console.log('密码: 912210747')
      console.log('角色: admin')
      console.log('姓名: 王建国')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('✗ 创建管理员失败:', error)
    process.exit(1)
  }
}

createAdminUser()
