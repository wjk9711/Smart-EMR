import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from './config'
import { testConnection, syncDatabase } from './config/database'
import './models' // 导入模型以建立关联

// 导入路由
import authRoutes from './routes/auth'
import patientRoutes from './routes/patients'
import outpatientRoutes from './routes/outpatient'
import templateRoutes from './routes/templates'
import inpatientRoutes from './routes/inpatient'
import qualityRoutes from './routes/quality'
import nursingRoutes from './routes/nursing'
import systemRoutes from './routes/system'
import userRoutes from './routes/users'

const app = express()

// 中间件
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// 静态文件服务(用于上传的文件)
app.use('/uploads', express.static(config.upload.dir))

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/outpatient', outpatientRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/inpatient', inpatientRoutes)
app.use('/api/quality', qualityRoutes)
app.use('/api/nursing', nursingRoutes)
app.use('/api/system', systemRoutes)
app.use('/api/users', userRoutes)

// 健康检查
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404处理
app.use((req: Request, res: Response) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
  })
})

// 错误处理
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    code: 500,
    message: config.nodeEnv === 'development' ? err.message : '服务器内部错误',
  })
})

// 启动服务器
async function start() {
  try {
    // 测试数据库连接
    await testConnection()

    // 同步数据库
    await syncDatabase()

    // 启动HTTP服务器
    const port = typeof config.port === 'string' ? parseInt(config.port) : config.port;
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`)
      console.log(`Environment: ${config.nodeEnv}`)
      console.log(`API URL: http://0.0.0.0:${port}/api`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()

export default app
