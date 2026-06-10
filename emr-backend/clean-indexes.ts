import sequelize from './src/config/database'

async function cleanDuplicateIndexes() {
  try {
    console.log('清理 inpatient_patients 表的重复索引...')
    
    // 删除所有重复的 id_card 和 inpatient_no 索引（保留原始的）
    const duplicateIndexes = [
      'id_card_2', 'id_card_3', 'id_card_4', 'id_card_5', 'id_card_6',
      'id_card_7', 'id_card_8', 'id_card_9', 'id_card_10', 'id_card_11',
      'id_card_12', 'id_card_13', 'id_card_14', 'id_card_15', 'id_card_16',
      'id_card_17', 'id_card_18', 'id_card_19', 'id_card_20', 'id_card_21',
      'id_card_22', 'id_card_23', 'id_card_24', 'id_card_25', 'id_card_26',
      'id_card_27', 'id_card_28', 'id_card_29', 'id_card_30', 'id_card_31', 'id_card_32',
      'inpatient_no_2', 'inpatient_no_3', 'inpatient_no_4', 'inpatient_no_5', 'inpatient_no_6',
      'inpatient_no_7', 'inpatient_no_8', 'inpatient_no_9', 'inpatient_no_10', 'inpatient_no_11',
      'inpatient_no_12', 'inpatient_no_13', 'inpatient_no_14', 'inpatient_no_15', 'inpatient_no_16',
      'inpatient_no_17', 'inpatient_no_18', 'inpatient_no_19', 'inpatient_no_20', 'inpatient_no_21',
      'inpatient_no_22', 'inpatient_no_23', 'inpatient_no_24', 'inpatient_no_25', 'inpatient_no_26',
      'inpatient_no_27', 'inpatient_no_28', 'inpatient_no_29', 'inpatient_no_30', 'inpatient_no_31',
    ]
    
    for (const indexName of duplicateIndexes) {
      try {
        await sequelize.query(`DROP INDEX \`${indexName}\` ON \`inpatient_patients\``)
        console.log(`✅ 删除索引: ${indexName}`)
      } catch (err: any) {
        console.log(`⚠️  索引 ${indexName} 不存在或已删除`)
      }
    }
    
    console.log('\n✅ 清理完成！')
    
    // 验证
    const [indexes] = await sequelize.query('SHOW INDEX FROM inpatient_patients')
    console.log(`剩余索引数量: ${(indexes as any[]).length}`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

cleanDuplicateIndexes()
