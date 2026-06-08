/**
 * 病案首页数据库扩展脚本
 * 
 * 根据病案首页图片，扩展 inpatient_records 表的 content JSON 结构
 * 支持以下模块：
 * 1. 患者基本信息（已有）
 * 2. 住院信息（新增详细字段）
 * 3. 出院诊断（新增：支持多个诊断及编码）
 * 4. 手术操作（新增：支持多个手术及编码）
 * 5. 费用信息（新增）
 * 6. 其他信息（新增）
 */

import { Sequelize } from 'sequelize'
import sequelize from '../config/database'

async function extendInpatientRecordStructure() {
  console.log('开始扩展住院病案表结构...')

  try {
    // 检查并添加新列（如果需要）
    const queryInterface = sequelize.getQueryInterface()
    
    // 检查 record_type 枚举是否需要扩展
    await queryInterface.sequelize.query(`
      ALTER TABLE inpatient_records 
      MODIFY COLUMN record_type ENUM('admission', 'progress', 'discharge', 'operation', 'home_page', 'other') 
      COMMENT '病案类型：admission-入院记录，progress-病程记录，discharge-出院记录，operation-手术记录，home_page-病案首页，other-其他'
    `)
    
    console.log('✅ 已更新 recordType 枚举，添加 home_page 类型')

    // 验证 content 字段是否可以存储JSON
    const [result] = await queryInterface.sequelize.query(`
      SHOW COLUMNS FROM inpatient_records LIKE 'content'
    `)
    
    if (result.length > 0) {
      console.log('✅ content 字段已存在，类型为 TEXT，可以存储JSON格式的病案首页数据')
    }

    console.log('\n 病案首页数据结构说明：')
    console.log('病案首页的所有字段将存储在 content JSON 字段中，结构如下：')
    console.log(`
{
  "homePage": {
    // 一、患者基本信息
    "medicalPaymentMethod": "2",  // 医疗付费方式
    "healthCardNo": "",           // 健康卡号
    "visitCount": 1,              // 第几次住院
    "caseNo": "",                 // 病案号
    "totalPages": 2,              // 总页数
    "currentPage": 1,             // 当前页码
    "name": "",                   // 姓名
    "gender": "2",                // 性别：1-男 2-女
    "birthDate": "",              // 出生日期
    "age": "",                    // 年龄
    "nationality": "",            // 国籍
    "infantAge": "",              // 婴儿年龄（不足1周岁）
    "infantAgeUnit": "",          // 婴儿年龄单位：月/日
    "newbornWeight": "",          // 新生儿出生体重
    "newbornAdmissionWeight": "", // 新生儿入院体重
    "birthPlace": "",             // 出生地
    "ancestralHome": "",          // 籍贯
    "ethnicity": "",              // 民族
    "idCardNo": "",               // 身份证号
    "occupation": "",             // 职业
    "marriage": "2",              // 婚姻：1-未婚 2-已婚 3-丧偶 4-离婚 5-其他
    "presentAddress": "",         // 现住址
    "phone": "",                  // 电话
    "postalCode": "",             // 邮编
    "householdAddress": "",       // 户口地址
    "workUnit": "",               // 工作单位及地址
    "workPhone": "",              // 单位电话
    "contactPerson": "",          // 联系人姓名
    "contactRelation": "",        // 关系
    "contactAddress": "",         // 地址
    "contactPhone": "",           // 电话
    
    // 二、住院信息
    "admissionRoute": "1",        // 入院途径：1-急诊 2-门诊 3-其他医疗机构转入 9-其他
    "admissionDate": "",          // 入院时间
    "admissionDept": "",          // 入院科别
    "admissionWard": "",          // 病房
    "admissionBed": "",           // 床号
    "transferDept": "",           // 转科科别
    "dischargeDate": "",          // 出院时间
    "dischargeDept": "",          // 出院科别
    "dischargeWard": "",          // 病房
    "dischargeBed": "",           // 床号
    "actualDays": 0,              // 实际住院天数
    "outpatientDiagnosis": "",    // 门(急)诊诊断
    "outpatientDiagnosisCode": "",// 疾病编码
    
    // 三、出院诊断（支持多个）
    "dischargeDiagnoses": [
      {
        "type": "main",           // main-主要诊断, other-其他诊断
        "name": "",               // 诊断名称
        "code": "",               // 疾病编码
        "admissionCondition": ""  // 入院病情：1-有 2-临床未确定 3-情况不明 4-无
      }
    ],
    
    // 四、病理诊断
    "pathologyDiagnosis": "",     // 病理诊断
    "pathologyMorphologyCode": "",// 形态学编码
    "pathologyNo": "",            // 病理号
    
    // 五、损伤中毒外部原因
    "externalCause": "",          // 损伤、中毒的外部原因
    "externalCauseCode": "",      // 疾病编码
    
    // 六、药物过敏
    "drugAllergy": "1",           // 1-无 2-有
    
    // 七、血型
    "bloodType": "3",             // 1-A 2-B 3-O 4-AB 5-不详 6-未查
    "rhFactor": "1",              // 1-阳 2-阴 3-不详 4-未查
    
    // 八、尸体解剖
    "autopsy": "1",               // 1-是 2-否
    
    // 九、手术及操作（支持多个）
    "operations": [
      {
        "code": "",               // 手术及操作编码
        "date": "",               // 手术及操作日期
        "level": "",              // 手术级别
        "name": "",               // 手术及操作名称
        "surgeon": "",            // 术者
        "firstAssistant": "",     // I助
        "secondAssistant": "",    // II助
        "incisionHealing": "",    // 切口愈合等级
        "anesthesiaMethod": "",   // 麻醉方式
        "anesthesiologist": ""    // 麻醉医师
      }
    ],
    
    // 十、离院方式
    "dischargeMethod": "",        // 离院方式
    
    // 十一、费用信息
    "totalCost": 0,               // 总费用
    "selfPayCost": 0,             // 自付金额
    "costBreakdown": {            // 费用分类
      "serviceFee": 0,            // 综合医疗服务类
      "diagnosisFee": 0,          // 诊断类
      "treatmentFee": 0,          // 治疗类
      "rehabilitationFee": 0,     // 康复类
      "chineseMedicineFee": 0,    // 中医类
      "westernMedicineFee": 0,    // 西药类
      "chineseHerbFee": 0,        // 中药类
      "bloodFee": 0,              // 血液和血液制品类
      "materialFee": 0,           // 耗材类
      "otherFee": 0               // 其他类
    },
    
    // 十二、其他信息
    "readmissionWithin31Days": "",// 31天内再住院计划
    "comaBeforeAdmission": "",    // 入院前昏迷时间
    "comaAfterAdmission": "",     // 入院后昏迷时间
    "criticalIllnessDays": 0,     // 病危天数
    "criticalIllnessCareDays": 0, // 病重护理天数
    "intensiveCareDays": 0,       // 重症监护天数
    "intensiveCareRoom": "",      // 重症监护室名称
    "icuEntryTime": "",           // 进入时间
    "icuExitTime": "",            // 转出时间
    "antibioticUse": "",          // 抗生素使用情况
    "pathogenTest": "",           // 病原学检查
    "infectionReport": "",        // 传染病报告
    "specialCareDays": 0,         // 特级护理天数
    "careLevel": "",              // 护理级别
    
    // 十三、诊断符合情况
    "diagnosisMatch": {
      "admissionMatch": "",       // 入院与出院
      "prePostMatch": "",         // 术前与术后
      "clinicalPathologyMatch": "" // 临床与病理
    },
    
    // 十四、主要诊断出院情况
    "mainDiagnosisOutcome": "",   // 主要诊断出院情况
    
    // 十五、医师签名
    "chiefDoctor": "",            // 科主任
    "deputyChiefDoctor": "",      // 主任(副主任)医师
    "attendingDoctor": "",        // 主治医师
    "residentDoctor": "",         // 住院医师
    "responsibleNurse": "",       // 责任护士
    "advancedDoctor": "",         // 进修医师
    "internDoctor": "",           // 实习医师
    "coder": "",                  // 编码员
    "qualityDoctor": "",          // 病案质量医师
    "qualityNurse": "",           // 病案质量护士
    "qualityDate": ""             // 质控日期
  }
}
    `)

    console.log('\n✅ 病案首页数据库扩展完成！')
    console.log('\n📝 使用说明：')
    console.log('1. 新增病案时，recordType 选择 "home_page"')
    console.log('2. 所有病案首页字段存储在 content JSON 中')
    console.log('3. 前端表单按照图片布局一比一还原')
    console.log('4. 支持多个出院诊断和手术操作的添加')

  } catch (error: any) {
    console.error('❌ 扩展失败：', error.message)
    throw error
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  extendInpatientRecordStructure()
    .then(() => {
      console.log('\n✨ 脚本执行完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('脚本执行失败：', error)
      process.exit(1)
    })
}

export default extendInpatientRecordStructure
