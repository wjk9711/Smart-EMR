import sequelize from './src/config/database'
import { up } from './src/database/migrations/add-source-ids-for-data-isolation'

async function runMigration() {
  try {
    console.log('Running migration: add-source-ids-for-data-isolation...')
    await up(sequelize.getQueryInterface())
    console.log('✅ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
