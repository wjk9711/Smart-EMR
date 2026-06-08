import { syncDatabase } from '../config/database'

async function migrate() {
  console.log('Starting database migration...')
  
  try {
    await syncDatabase()
    console.log('Database migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Database migration failed:', error)
    process.exit(1)
  }
}

migrate()
