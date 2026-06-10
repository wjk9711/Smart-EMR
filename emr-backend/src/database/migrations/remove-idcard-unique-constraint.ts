import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('开始移除 inpatient_patients 表中 id_card 字段的唯一约束...')
  
  try {
    // 检查是否存在唯一索引
    const [indexes]: any = await queryInterface.sequelize.query(
      "SHOW INDEX FROM inpatient_patients WHERE Column_name = 'id_card' AND Non_unique = 0"
    )
    
    if (indexes && indexes.length > 0) {
      console.log('发现 id_card 字段的唯一索引，正在移除...')
      
      // 移除唯一索引
      await queryInterface.removeIndex('inpatient_patients', 'id_card')
      console.log('✅ 成功移除 id_card 字段的唯一索引')
    } else {
      console.log('ℹ️  id_card 字段没有唯一索引，无需移除')
    }
  } catch (error) {
    console.error('❌ 移除唯一索引时出错:', error)
    throw error
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('开始恢复 inpatient_patients 表中 id_card 字段的唯一约束...')
  
  try {
    // 添加唯一索引
    await queryInterface.addIndex('inpatient_patients', ['id_card'], {
      unique: true,
      name: 'id_card'
    })
    console.log('✅ 成功恢复 id_card 字段的唯一索引')
  } catch (error) {
    console.error('❌ 恢复唯一索引时出错:', error)
    throw error
  }
}
