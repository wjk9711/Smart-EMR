import { User, Patient, Visit } from '../models'
import sequelize from '../config/database'

async function seed() {
  console.log('Starting database seeding...')

  try {
    // 同步数据库
    await sequelize.sync({ force: false })

    // 检查是否已有用户
    const existingUser = await User.findOne({ where: { username: 'admin' } })
    
    if (!existingUser) {
      // 创建管理员用户
      const admin = await User.create({
        username: 'admin',
        passwordHash: 'admin123', // 会被bcrypt自动哈希
        realName: '系统管理员',
        roleType: 'admin',
        status: 'active',
      })
      console.log('Created admin user:', admin.username)
    }

    // 创建测试医生用户
    const doctor = await User.findOne({ where: { username: 'doctor1' } })
    if (!doctor) {
      await User.create({
        username: 'doctor1',
        passwordHash: '123456',
        realName: '张医生',
        roleType: 'student', // 默认为学生角色
        status: 'active',
      })
      console.log('Created doctor user: doctor1')
    }

    // 创建测试患者
    const existingPatient = await Patient.findOne({ where: { patientNo: 'P20240001' } })
    if (!existingPatient) {
      await Patient.create({
        patientNo: 'P20240001',
        name: '测试患者',
        gender: 'male',
        birthDate: '1990-01-01',
        phone: '13800138000',
        address: '北京市朝阳区测试路1号',
      })
      console.log('Created test patient')
    }

    console.log('Database seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Database seeding failed:', error)
    process.exit(1)
  }
}

seed()
