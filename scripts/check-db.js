import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function checkDB() {
    const dbPath = path.join(__dirname, '../database', 'peony.db')
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    })

    console.log('📋 Проверка структуры таблиц:\n')

    // Проверяем таблицу clients
    const clientsInfo = await db.all("PRAGMA table_info(clients)")
    console.log('Таблица clients:')
    console.table(clientsInfo)

    // Проверяем таблицу orders
    const ordersInfo = await db.all("PRAGMA table_info(orders)")
    console.log('\nТаблица orders:')
    console.table(ordersInfo)

    // Проверяем таблицу order_items
    const itemsInfo = await db.all("PRAGMA table_info(order_items)")
    console.log('\nТаблица order_items:')
    console.table(itemsInfo)

    // Проверяем есть ли колонка comment в orders
    const hasComment = ordersInfo.some(col => col.name === 'comment')
    console.log(`\n📝 Колонка comment в orders: ${hasComment ? '✅ есть' : '❌ нет'}`)

    await db.close()
}

checkDB().catch(console.error)