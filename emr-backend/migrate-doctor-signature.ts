import sequelize from './src/config/database'
import { DataTypes, QueryInterface } from 'sequelize'

async function migrateDoctorSignatureField() {
  try {
    console.log('开始修改doctor_signature字段类型...')
    
    const queryInterface = sequelize.getQueryInterface() as QueryInterface
    
    // 检查outpatient_records表的doctor_signature字段类型
    const tableInfo = await queryInterface.describeTable('outpatient_records')
    
    if (tableInfo.doctor_signature) {
      console.log('当前doctor_signature字段类型:', tableInfo.doctor_signature.type)
      
      // 修改为TEXT类型
      console.log('修改doctor_signature字段为TEXT类型...')
      await queryInterface.changeColumn('outpatient_records', 'doctor_signature', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '医生签名图片(base64或路径)',
      })
      
      console.log('✅ doctor_signature字段修改成功！')
    } else {
      console.log('⚠️ doctor_signature字段不存在')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ 迁移失败:', error)
    process.exit(1)
  }
}

migrateDoctorSignatureField()
