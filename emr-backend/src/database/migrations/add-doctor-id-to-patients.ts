import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
  // 为 patients 表添加 doctor_id 字段
  await queryInterface.addColumn('patients', 'doctor_id', {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: '创建该患者的医生ID',
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })

  // 为 inpatient_patients 表添加 doctor_id 字段
  await queryInterface.addColumn('inpatient_patients', 'doctor_id', {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: '创建该患者的医生ID',
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })

  // 添加索引以提高查询性能
  await queryInterface.addIndex('patients', ['doctor_id'])
  await queryInterface.addIndex('inpatient_patients', ['doctor_id'])
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // 移除索引
  await queryInterface.removeIndex('patients', ['doctor_id'])
  await queryInterface.removeIndex('inpatient_patients', ['doctor_id'])

  // 移除字段
  await queryInterface.removeColumn('patients', 'doctor_id')
  await queryInterface.removeColumn('inpatient_patients', 'doctor_id')
}
