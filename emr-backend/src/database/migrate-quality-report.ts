import sequelize from '../config/database'
import { DataTypes } from 'sequelize'

async function migrate() {
  try {
    console.log('开始创建质控报告表...')

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS quality_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL COMMENT '用户ID',
        report_key VARCHAR(15) NOT NULL UNIQUE COMMENT '报告唯一关键值（15位随机字符串）',
        report_name VARCHAR(255) NOT NULL COMMENT '报告名称',
        file_path VARCHAR(500) NOT NULL COMMENT 'Word文档存储路径',
        file_size INT NOT NULL DEFAULT 0 COMMENT '文件大小（字节）',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_user_id (user_id),
        INDEX idx_report_key (report_key),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质控报告表';
    `)

    console.log('✅ 质控报告表创建成功！')
    process.exit(0)
  } catch (error) {
    console.error('❌ 迁移失败:', error)
    process.exit(1)
  }
}

migrate()
