import sequelize from './src/config/database'

// 生成13位随机字符串（大写字母+数字）
function generateRandomKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 13; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 检查KEY是否已存在
async function isKeyExists(table: string, key: string): Promise<boolean> {
  const [rows] = await sequelize.query(
    `SELECT id FROM \`${table}\` WHERE unique_key = ? LIMIT 1`,
    { replacements: [key] }
  )
  return (rows as any[]).length > 0
}

// 生成唯一的KEY（最多尝试10次）
async function generateUniqueKey(table: string, maxRetries: number = 10): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const key = generateRandomKey()
    const exists = await isKeyExists(table, key)
    
    if (!exists) {
      return key
    }
    
    console.log(`⚠️  KEY ${key} 已存在，重试 (${i + 1}/${maxRetries})`)
  }
  
  throw new Error(`无法生成唯一KEY，已重试${maxRetries}次`)
}

// 为所有患者生成unique_key
async function populatePatientKeys() {
  console.log('\n=== 为患者生成unique_key ===')
  
  const [patients] = await sequelize.query(
    'SELECT id, unique_key FROM inpatient_patients WHERE unique_key IS NULL'
  )
  
  const patientList = patients as any[]
  console.log(`找到 ${patientList.length} 个需要生成KEY的患者`)
  
  let successCount = 0
  let failCount = 0
  
  for (const patient of patientList) {
    try {
      const uniqueKey = await generateUniqueKey('inpatient_patients')
      
      await sequelize.query(
        'UPDATE inpatient_patients SET unique_key = ? WHERE id = ?',
        { replacements: [uniqueKey, patient.id] }
      )
      
      successCount++
      if (successCount % 10 === 0 || successCount === patientList.length) {
        console.log(`  进度: ${successCount}/${patientList.length}`)
      }
    } catch (error: any) {
      console.error(`  ❌ 患者ID=${patient.id} 失败: ${error.message}`)
      failCount++
    }
  }
  
  console.log(`✅ 患者KEY生成完成: 成功${successCount}个, 失败${failCount}个`)
}

// 为所有病案生成unique_key
async function populateRecordKeys() {
  console.log('\n=== 为病案生成unique_key ===')
  
  const [records] = await sequelize.query(
    'SELECT id, unique_key FROM inpatient_records WHERE unique_key IS NULL'
  )
  
  const recordList = records as any[]
  console.log(`找到 ${recordList.length} 个需要生成KEY的病案`)
  
  let successCount = 0
  let failCount = 0
  
  for (const record of recordList) {
    try {
      const uniqueKey = await generateUniqueKey('inpatient_records')
      
      await sequelize.query(
        'UPDATE inpatient_records SET unique_key = ? WHERE id = ?',
        { replacements: [uniqueKey, record.id] }
      )
      
      successCount++
      if (successCount % 10 === 0 || successCount === recordList.length) {
        console.log(`  进度: ${successCount}/${recordList.length}`)
      }
    } catch (error: any) {
      console.error(`  ❌ 病案ID=${record.id} 失败: ${error.message}`)
      failCount++
    }
  }
  
  console.log(`✅ 病案KEY生成完成: 成功${successCount}个, 失败${failCount}个`)
}

// 主函数
async function main() {
  try {
    console.log('=== 开始为现有数据生成unique_key ===\n')
    
    await populatePatientKeys()
    await populateRecordKeys()
    
    console.log('\n✅ 所有数据unique_key生成完成！')
    
    // 验证
    const [patientsWithoutKey] = await sequelize.query(
      'SELECT COUNT(*) as count FROM inpatient_patients WHERE unique_key IS NULL'
    )
    const [recordsWithoutKey] = await sequelize.query(
      'SELECT COUNT(*) as count FROM inpatient_records WHERE unique_key IS NULL'
    )
    
    console.log('\n=== 验证结果 ===')
    console.log(`患者表中无KEY的记录数: ${(patientsWithoutKey as any[])[0].count}`)
    console.log(`病案表中无KEY的记录数: ${(recordsWithoutKey as any[])[0].count}`)
    
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ 错误:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()
