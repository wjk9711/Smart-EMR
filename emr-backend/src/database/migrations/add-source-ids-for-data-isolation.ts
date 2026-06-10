import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
  // 1. 扩展 inpatient_patients 表，添加来源患者ID字段
  await queryInterface.addColumn('inpatient_patients', 'source_patient_id', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '来源患者ID（如果是复制的）',
    references: {
      model: 'inpatient_patients',
      key: 'id',
    },
    onDelete: 'SET NULL',
  })
  
  // 添加索引
  await queryInterface.addIndex('inpatient_patients', ['source_patient_id'], {
    name: 'idx_source_patient',
  })
  
  // 2. 扩展 inpatient_records 表，添加来源病案ID字段
  await queryInterface.addColumn('inpatient_records', 'source_record_id', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '来源病案ID（如果是复制的）',
    references: {
      model: 'inpatient_records',
      key: 'id',
    },
    onDelete: 'SET NULL',
  })
  
  // 添加索引
  await queryInterface.addIndex('inpatient_records', ['source_record_id'], {
    name: 'idx_source_record',
  })
  
  // 3. 扩展 patient_assignments 表，添加复制后的患者ID和复制时间
  await queryInterface.addColumn('patient_assignments', 'copied_patient_id', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '复制后的患者ID',
    references: {
      model: 'inpatient_patients',
      key: 'id',
    },
    onDelete: 'SET NULL',
  })
  
  await queryInterface.addColumn('patient_assignments', 'copied_at', {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '复制时间',
  })
  
  // 添加索引
  await queryInterface.addIndex('patient_assignments', ['copied_patient_id'], {
    name: 'idx_copied_patient',
  })
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // 删除索引
  await queryInterface.removeIndex('patient_assignments', 'idx_copied_patient')
  await queryInterface.removeIndex('inpatient_records', 'idx_source_record')
  await queryInterface.removeIndex('inpatient_patients', 'idx_source_patient')
  
  // 删除字段
  await queryInterface.removeColumn('patient_assignments', 'copied_at')
  await queryInterface.removeColumn('patient_assignments', 'copied_patient_id')
  await queryInterface.removeColumn('inpatient_records', 'source_record_id')
  await queryInterface.removeColumn('inpatient_patients', 'source_patient_id')
}
