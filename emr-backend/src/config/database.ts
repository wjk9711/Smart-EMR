import { Sequelize } from 'sequelize'
import { config } from './index'

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    logging: config.nodeEnv === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: '+08:00',
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
  }
)

export async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('Database connection established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    throw error
  }
}

export async function syncDatabase() {
  try {
    // 开发环境下使用 alter 模式，但捕获错误以避免索引重复问题
    if (config.nodeEnv === 'development') {
      try {
        await sequelize.sync({ alter: true })
        console.log('Database synchronized successfully.')
      } catch (syncError: any) {
        // 如果是索引重复错误，忽略并继续
        if (syncError.original?.code === 'ER_TOO_MANY_KEYS') {
          console.warn('Warning: Too many keys in table, skipping alter. Using existing schema.')
          console.log('Database connection ready (using existing schema).')
        } else {
          throw syncError
        }
      }
    } else {
      await sequelize.sync()
      console.log('Database synchronized successfully.')
    }
  } catch (error) {
    console.error('Failed to synchronize database:', error)
    throw error
  }
}

export default sequelize
