import sequelize from './src/config/database'
import { up } from './src/database/migrations/create-patient-assignments'

async function runMigration() {
  try {
    console.log('Running migration: create-patient-assignments...')
    await up(sequelize.getQueryInterface())
    console.log('✅ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
