import sequelize from './src/config/database'

async function checkUsers() {
  try {
    const [results] = await sequelize.query('SELECT id, username, real_name, role_type FROM users LIMIT 5')
    console.log('用户列表:')
    console.table(results)
    process.exit(0)
  } catch (error) {
    console.error('查询失败:', error)
    process.exit(1)
  }
}

checkUsers()
