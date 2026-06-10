import sequelize from './src/config/database'
import { User } from './src/models'

async function checkUsers() {
  console.log('查询所有用户...\n')
  
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'realName', 'roleType', 'status'],
      order: [['id', 'ASC']],
    })
    
    console.log(`找到 ${users.length} 个用户:\n`)
    
    users.forEach(user => {
      console.log(`ID: ${user.id}`)
      console.log(`  用户名: ${user.username}`)
      console.log(`  姓名: ${user.realName || '(无)'}`)
      console.log(`  角色: ${user.roleType}`)
      console.log(`  状态: ${user.status}`)
      console.log('')
    })
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 查询失败:', error)
    process.exit(1)
  }
}

checkUsers()
