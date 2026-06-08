import sequelize from './src/config/database'
import { DataTypes, QueryInterface } from 'sequelize'

async function migrateOutpatientSubmitFields() {
  try {
    console.log('开始门诊病历提交流程字段迁移...')
    
    const queryInterface = sequelize.getQueryInterface() as QueryInterface
    
    // 检查outpatient_records表是否存在submit_status字段
    const tableInfo = await queryInterface.describeTable('outpatient_records')
    
    if (!tableInfo.submit_status) {
      console.log('添加 submit_status 字段...')
      await queryInterface.addColumn('outpatient_records', 'submit_status', {
        type: DataTypes.ENUM('not_submitted', 'pending_review', 'passed', 'rejected'),
        defaultValue: 'not_submitted',
        comment: '提交状态：not_submitted-未提交，pending_review-待检查，passed-通过，rejected-不通过',
      })
    }
    
    if (!tableInfo.teacher_id) {
      console.log('添加 teacher_id 字段...')
      await queryInterface.addColumn('outpatient_records', 'teacher_id', {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: '教师ID（提交给哪位教师）',
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      })
    }
    
    if (!tableInfo.quality_comment) {
      console.log('添加 quality_comment 字段...')
      await queryInterface.addColumn('outpatient_records', 'quality_comment', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '质控意见',
      })
    }
    
    if (!tableInfo.submitted_at) {
      console.log('添加 submitted_at 字段...')
      await queryInterface.addColumn('outpatient_records', 'submitted_at', {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '提交时间',
      })
    }
    
    if (!tableInfo.reviewed_at) {
      console.log('添加 reviewed_at 字段...')
      await queryInterface.addColumn('outpatient_records', 'reviewed_at', {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '审核时间',
      })
    }
    
    console.log('✅ 门诊病历提交流程字段迁移完成！')
    process.exit(0)
  } catch (error) {
    console.error('❌ 迁移失败:', error)
    process.exit(1)
  }
}

migrateOutpatientSubmitFields()
