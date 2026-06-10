// 验证质控评价数据的平均值计算

const diagnosisData = [
  { name: '瘢痕子宫N85.805', accuracy: 95.2 },
  { name: '梗阻性分娩O66.901', accuracy: 88.5 },
  { name: '孕39周O26.900x506', accuracy: 92.8 },
  { name: '孕2次O26.900x603', accuracy: 90.1 },
  { name: '产2次O26.900x703', accuracy: 89.7 },
  { name: '胎盘粘连伴出血O72.001', accuracy: 93.4 },
  { name: '妊娠合并羊水过少O41.001', accuracy: 91.6 },
  { name: '女性盆腔炎N73.901', accuracy: 87.3 },
  { name: '轻度贫血D64.906', accuracy: 94.8 },
  { name: '低钾血症E87.601', accuracy: 89.2 },
  { name: '真菌性阴道炎B37.304', accuracy: 90.4 },
  { name: '单胎活产Z37.000X001', accuracy: 40.8 },
]

console.log('=== 调整前 ===')
const beforeAvg = diagnosisData.reduce((sum, d) => sum + d.accuracy, 0) / diagnosisData.length
console.log(`当前平均值: ${beforeAvg.toFixed(2)}%`)
console.log(`诊断数量: ${diagnosisData.length}`)
console.log('')

// 模拟adjustAccuracies函数
const targetAvg = 87.1
const otherDiagnoses = diagnosisData.filter(d => d.name !== '单胎活产Z37.000X001')
const singleBirthAccuracy = 40.8

const requiredSum = targetAvg * diagnosisData.length - singleBirthAccuracy
const currentSum = otherDiagnoses.reduce((sum, d) => sum + d.accuracy, 0)
const diff = (requiredSum - currentSum) / otherDiagnoses.length

console.log('=== 计算过程 ===')
console.log(`目标平均值: ${targetAvg}%`)
console.log(`单胎活产固定值: ${singleBirthAccuracy}%`)
console.log(`其他诊断需要的总和: ${requiredSum.toFixed(2)}`)
console.log(`其他诊断当前总和: ${currentSum.toFixed(2)}`)
console.log(`需要调整的差值: ${diff.toFixed(4)}`)
console.log('')

// 应用调整
otherDiagnoses.forEach(d => {
  d.accuracy = Math.min(100, Math.max(0, d.accuracy + diff))
})

// 四舍五入
diagnosisData.forEach(d => {
  d.accuracy = Math.round(d.accuracy * 10) / 10
})

console.log('=== 调整后 ===')
const afterAvg = diagnosisData.reduce((sum, d) => sum + d.accuracy, 0) / diagnosisData.length
console.log(`实际平均值: ${afterAvg.toFixed(2)}%`)
console.log('')

console.log('=== 各诊断正确率 ===')
diagnosisData.forEach((d, index) => {
  const marker = d.name === '单胎活产Z37.000X001' ? ' ⭐' : ''
  console.log(`${index + 1}. ${d.name}: ${d.accuracy}%${marker}`)
})

console.log('')
console.log('=== 验证 ===')
console.log(`目标: ${targetAvg}%`)
console.log(`实际: ${afterAvg.toFixed(1)}%`)
console.log(`误差: ${Math.abs(afterAvg - targetAvg).toFixed(2)}%`)
console.log(`是否达标: ${Math.abs(afterAvg - targetAvg) < 0.1 ? '✅ 是' : '❌ 否'}`)
