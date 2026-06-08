import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'
import bcrypt from 'bcryptjs'

export interface UserAttributes {
  id: number
  username: string
  passwordHash: string
  realName: string
  departmentId?: number
  roleId?: number
  roleType: 'student' | 'teacher' | 'admin' // 角色类型：学生/教师/管理员
  status: 'active' | 'inactive'
  createdAt?: Date
  updatedAt?: Date
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number
  public username!: string
  public passwordHash!: string
  public realName!: string
  public departmentId?: number
  public roleId?: number
  public roleType!: 'student' | 'teacher' | 'admin'
  public status!: 'active' | 'inactive'
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // 实例方法：验证密码
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash)
  }

  // 实例方法：获取公开信息（不包含密码）
  toJSON() {
    const values = { ...this.get() }
    delete (values as any).passwordHash
    return values
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名',
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码哈希',
    },
    realName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '真实姓名',
    },
    departmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '科室ID',
    },
    roleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '角色ID',
    },
    roleType: {
      type: DataTypes.ENUM('student', 'teacher', 'admin'),
      defaultValue: 'student',
      comment: '角色类型：学生/教师/管理员',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      comment: '状态',
    },
  },
  {
    tableName: 'users',
    sequelize,
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.passwordHash) {
          const salt = await bcrypt.genSalt(10)
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt)
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('passwordHash')) {
          const salt = await bcrypt.genSalt(10)
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt)
        }
      },
    },
  }
)

export default User
