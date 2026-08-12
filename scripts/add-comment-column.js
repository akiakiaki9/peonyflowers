import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function addCommentColumn() {
  const dbPath = path.join(__dirname, '../database', 'peony.db')
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  })

  try {
    await db.exec('ALTER TABLE orders ADD COLUMN comment TEXT')
    console.log('✅ Колонка comment добавлена в таблицу orders')
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('ℹ️ Колонка comment уже существует')
    } else {
      console.error('❌ Ошибка:', error)
    }
  }

  await db.close()
}

addCommentColumn().catch(console.error)