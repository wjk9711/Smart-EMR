import sequelize from './src/config/database'
import { DataTypes, QueryInterface } from 'sequelize'

async function migrateDatabase() {
  try {
    console.log('开始数据库迁移...')
    
    const queryInterface = sequelize.getQueryInterface() as QueryInterface
    
    // 检查inpatient_records表是否存在submit_status字段
    const tableInfo = await queryInterface.describeTable('inpatient_records')
    
    if (!tableInfo.submit_status) {
      console.log('添加 submit_status 字段...')
      await queryInterface.addColumn('inpatient_records', 'submit_status', {
        type: DataTypes.ENUM('not_submitted', 'pending_review', 'passed', 'rejected'),
        defaultValue: 'not_submitted',
        comment: '提交状态：not_submitted-未提交，pending_review-待检查，passed-通过，rejected-不通过',
      })
    }
    
    if (!tableInfo.teacher_id) {
      console.log('添加 teacher_id 字段...')
      await queryInterface.addColumn('inpatient_records', 'teacher_id', {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: '教师ID（提交给哪位教师）',
        references: {
          model: 'users',
          key: 'id',
        },
      })
    }
    
    if (!tableInfo.quality_comment) {
      console.log('添加 quality_comment 字段...')
      await queryInterface.addColumn('inpatient_records', 'quality_comment', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '质控意见',
      })
    }
    
    if (!tableInfo.submitted_at) {
      console.log('添加 submitted_at 字段...')
      await queryInterface.addColumn('inpatient_records', 'submitted_at', {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '提交时间',
      })
    }
    
    if (!tableInfo.reviewed_at) {
      console.log('添加 reviewed_at 字段...')
      await queryInterface.addColumn('inpatient_records', 'reviewed_at', {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '审核时间',
      })
    }
    
    console.log('✓ 数据库迁移完成！')
    process.exit(0)
  } catch (error) {
    console.error('✗ 数据库迁移失败:', error)
    process.exit(1)
  }
}

migrateDatabase()
