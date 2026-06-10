import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
  // 创建患者分配表
  await queryInterface.createTable('patient_assignments', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.INTEGER, // 修改为INTEGER以匹配inpatient_patients.id
      allowNull: false,
      comment: '患者ID',
      references: {
        model: 'inpatient_patients',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '用户ID（接收患者的用户）',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    assignedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '分配者ID（管理员）',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    isTemplate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否设为模板',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  })

  // 添加联合唯一索引，防止重复分配
  await queryInterface.addIndex('patient_assignments', ['patientId', 'userId'], {
    unique: true,
    name: 'unique_patient_user_assignment',
  })

  // 添加用户ID索引，加速查询
  await queryInterface.addIndex('patient_assignments', ['userId'], {
    name: 'idx_patient_assignments_user',
  })

  // 添加患者ID索引，加速查询
  await queryInterface.addIndex('patient_assignments', ['patientId'], {
    name: 'idx_patient_assignments_patient',
  })
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('patient_assignments', 'idx_patient_assignments_patient')
  await queryInterface.removeIndex('patient_assignments', 'idx_patient_assignments_user')
  await queryInterface.removeIndex('patient_assignments', 'unique_patient_user_assignment')
  await queryInterface.dropTable('patient_assignments')
}
