import { QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('开始检查并移除 inpatient_patients 表中所有不必要的唯一约束...')
  
  try {
    // 获取表的所有索引
    const [indexes]: any = await queryInterface.sequelize.query(
      "SHOW INDEX FROM inpatient_patients WHERE Non_unique = 0"
    )
    
    console.log(`发现 ${indexes.length} 个唯一索引`)
    
    if (indexes && indexes.length > 0) {
      for (const index of indexes) {
        const columnName = index.Column_name
        const indexName = index.Key_name
        
        // 保留主键和 unique_key 字段的唯一索引
        if (columnName === 'id' || columnName === 'unique_key') {
          console.log(`ℹ️  保留唯一索引: ${indexName} (${columnName})`)
          continue
        }
        
        console.log(`🔧 移除唯一索引: ${indexName} (${columnName})`)
        await queryInterface.removeIndex('inpatient_patients', indexName)
        console.log(`✅ 成功移除: ${indexName}`)
      }
    } else {
      console.log('ℹ️  没有发现需要移除的唯一索引')
    }
    
    console.log('✅ 所有不必要的唯一约束已移除')
  } catch (error) {
    console.error('❌ 处理唯一约束时出错:', error)
    throw error
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('此迁移不可回滚（已移除的唯一约束无法自动恢复）')
  console.log('如需恢复，请手动执行 SQL 语句添加相应的唯一索引')
}
