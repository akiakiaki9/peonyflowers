const TelegramBot = require('node-telegram-bot-api')
const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const { open } = require('sqlite')

// Загружаем .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, ...value] = line.split('=')
      if (key && value.length > 0) {
        process.env[key.trim()] = value.join('=').trim()
      }
    })
  }
}

loadEnv()

const token = process.env.TELEGRAM_BOT_TOKEN
const adminId = process.env.ADMIN_TELEGRAM_ID

if (!token) {
  console.error('❌ Токен не найден в .env.local')
  process.exit(1)
}

if (!adminId) {
  console.error('❌ ADMIN_TELEGRAM_ID не найден в .env.local')
  process.exit(1)
}

const bot = new TelegramBot(token, { polling: true })
let db = null

async function initDB() {
  try {
    const dbPath = path.join(__dirname, 'database', 'peony.db')
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    console.log('✅ База данных подключена')
    
    // Проверяем наличие колонки comment
    const tableInfo = await db.all("PRAGMA table_info(orders)")
    const hasComment = tableInfo.some(col => col.name === 'comment')
    
    if (!hasComment) {
      console.log('🔄 Добавляем колонку comment в таблицу orders...')
      try {
        await db.exec('ALTER TABLE orders ADD COLUMN comment TEXT')
        console.log('✅ Колонка comment добавлена')
      } catch (error) {
        if (!error.message.includes('duplicate column name')) {
          console.error('❌ Ошибка при добавлении колонки:', error)
        }
      }
    }
    
    return db
  } catch (error) {
    console.error('❌ Ошибка подключения к БД:', error)
    return null
  }
}

function generateCode() {
  return Math.floor(1000000 + Math.random() * 9000000).toString()
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function cleanPhone(phone) {
  return phone.replace(/[^0-9+]/g, '')
}

const userStates = {}

function isAdmin(chatId) {
  return chatId.toString() === adminId.toString()
}

// ============ МЕНЮ АДМИНА ============

bot.onText(/\/admin/, async (msg) => {
  const chatId = msg.chat.id
  
  if (!isAdmin(chatId)) {
    await bot.sendMessage(chatId, '⛔ У вас нет доступа к админ-панели')
    return
  }

  const keyboard = {
    reply_markup: {
      keyboard: [
        ['👤 Добавить клиента', '🛍 Добавить покупку'],
        ['📋 История клиента', '🔍 Поиск клиента'],
        ['📋 Список клиентов', '🗑 Удалить клиента'],
        ['❓ Помощь']
      ],
      resize_keyboard: true
    }
  }

  await bot.sendMessage(chatId, 
    '🤖 Админ-панель Peony Flowers\n\nВыберите действие:',
    keyboard
  )
})

// ============ КОМАНДЫ ============

bot.onText(/👤 Добавить клиента/, async (msg) => {
  const chatId = msg.chat.id
  if (!isAdmin(chatId)) return

  userStates[chatId] = { action: 'addclient' }
  await bot.sendMessage(chatId, 
    '👤 Добавление нового клиента\n\n' +
    'Введите: Имя, Телефон\n' +
    'Пример: Акбар, +998940837700\n\n' +
    'Или /cancel для отмены'
  )
})

bot.onText(/🛍 Добавить покупку/, async (msg) => {
  const chatId = msg.chat.id
  if (!isAdmin(chatId)) return

  userStates[chatId] = { action: 'addpurchase_step1' }
  await bot.sendMessage(chatId, 
    '🛍 Введите код клиента:\n\nИли /cancel для отмены'
  )
})

bot.onText(/📋 История клиента/, async (msg) => {
  const chatId = msg.chat.id
  if (!isAdmin(chatId)) return

  userStates[chatId] = { action: 'history' }
  await bot.sendMessage(chatId, 
    '📋 Введите код клиента:\n\nИли /cancel для отмены'
  )
})

bot.onText(/🔍 Поиск клиента/, async (msg) => {
  const chatId = msg.chat.id
  if (!isAdmin(chatId)) return

  userStates[chatId] = { action: 'search' }
  await bot.sendMessage(chatId, 
    '🔍 Введите имя, телефон или код для поиска:\n\nИли /cancel для отмены'
  )
})

bot.onText(/📋 Список клиентов/, async (msg) => {
  const chatId = msg.chat.id
  if (!isAdmin(chatId)) return

  try {
    if (!db) await initDB()
    
    const clients = await db.all(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM orders WHERE client_id = c.id) as purchases_count
      FROM clients c 
      ORDER BY purchases_count DESC, c.created_at DESC
    `)
    
    if (clients.length === 0) {
      await bot.sendMessage(chatId, '📭 Клиентов пока нет')
      return
    }
    
    let message = `📋 Все клиенты (${clients.length}):\n\n`
    for (const client of clients) {
      const hasTG = client.telegram_id ? '✅' : '❌'
      message += `${hasTG} ${client.name}\n`
      message += `   📱 ${client.phone}\n`
      message += `   🔑 ${client.code}\n`
      message += `   🛍 Покупок: ${client.purchases_count || 0}\n\n`
    }
    
    await bot.sendMessage(chatId, message)
    
  } catch (error) {
    console.error(error)
    await bot.sendMessage(chatId, '❌ Ошибка')
  }
})

bot.onText(/🗑 Удалить клиента/, async (msg) => {
  const chatId = msg.chat.id
  if (!isAdmin(chatId)) return

  userStates[chatId] = { action: 'delete_step1' }
  await bot.sendMessage(chatId, 
    '🗑 Введите код клиента для удаления:\n\nИли /cancel для отмены'
  )
})

bot.onText(/❓ Помощь/, async (msg) => {
  const chatId = msg.chat.id
  
  if (!isAdmin(chatId)) {
    await bot.sendMessage(chatId, '🌸 Для истории покупок: /start')
    return
  }
  
  await bot.sendMessage(chatId,
    '🤖 Админ-панель:\n\n' +
    '👤 Добавить клиента\n' +
    '🛍 Добавить покупку\n' +
    '📋 История клиента\n' +
    '🔍 Поиск клиента\n' +
    '📋 Список клиентов\n' +
    '🗑 Удалить клиента\n' +
    '❓ Помощь'
  )
})

bot.onText(/\/cancel/, async (msg) => {
  const chatId = msg.chat.id
  delete userStates[chatId]
  await bot.sendMessage(chatId, '✅ Отменено', {
    reply_markup: { 
      keyboard: [
        ['👤 Добавить клиента', '🛍 Добавить покупку'],
        ['📋 История клиента', '🔍 Поиск клиента'],
        ['📋 Список клиентов', '🗑 Удалить клиента'],
        ['❓ Помощь']
      ],
      resize_keyboard: true 
    }
  })
})

// ============ ОБРАБОТКА ДИАЛОГОВ ============

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const text = msg.text
  
  const state = userStates[chatId]
  if (!state) return
  
  if (!isAdmin(chatId)) {
    // Обработка клиентского входа
    if (state.action === 'client_login') {
      try {
        if (!db) await initDB()
        
        const code = text.trim()
        if (code.length !== 7) {
          await bot.sendMessage(chatId, '❌ Код должен быть 7 цифр')
          return
        }
        
        const client = await db.get('SELECT * FROM clients WHERE code = ?', code)
        if (!client) {
          await bot.sendMessage(chatId, '❌ Код не найден')
          return
        }
        
        await db.run(
          'UPDATE clients SET telegram_id = ? WHERE id = ?',
          chatId.toString(), client.id
        )
        
        delete userStates[chatId]
        await showHistory(chatId, client)
        
      } catch (error) {
        console.error(error)
        await bot.sendMessage(chatId, '❌ Ошибка')
      }
    }
    return
  }
  
  // ===== ДОБАВЛЕНИЕ КЛИЕНТА =====
  if (state.action === 'addclient') {
    if (text === '/cancel') {
      delete userStates[chatId]
      await bot.sendMessage(chatId, '✅ Отменено')
      return
    }
    
    try {
      const parts = text.split(',').map(p => p.trim())
      if (parts.length < 2) {
        await bot.sendMessage(chatId, '❌ Формат: Имя, Телефон')
        return
      }
      
      const name = parts[0]
      const phone = cleanPhone(parts[1])
      
      if (!db) await initDB()
      
      const existing = await db.get(
        'SELECT * FROM clients WHERE phone LIKE ?',
        `%${phone.replace(/[^0-9]/g, '')}%`
      )
      
      if (existing) {
        await bot.sendMessage(chatId, `⚠️ Клиент уже есть:\n${existing.name}\n${existing.phone}\nКод: ${existing.code}`)
        return
      }
      
      const code = generateCode()
      await db.run(
        'INSERT INTO clients (name, phone, code) VALUES (?, ?, ?)',
        name, phone, code
      )
      
      delete userStates[chatId]
      await bot.sendMessage(chatId, 
        `✅ Клиент добавлен!\n👤 ${name}\n📱 ${phone}\n🔑 ${code}`
      )
      
    } catch (error) {
      console.error(error)
      await bot.sendMessage(chatId, '❌ Ошибка')
    }
    return
  }
  
  // ===== ИСТОРИЯ КЛИЕНТА =====
  if (state.action === 'history') {
    if (text === '/cancel') {
      delete userStates[chatId]
      await bot.sendMessage(chatId, '✅ Отменено')
      return
    }
    
    const code = text.trim()
    if (!db) await initDB()
    
    const client = await db.get('SELECT * FROM clients WHERE code = ?', code)
    if (!client) {
      await bot.sendMessage(chatId, '❌ Клиент не найден')
      return
    }
    
    delete userStates[chatId]
    
    const purchases = await db.all(`
      SELECT o.*,
        (SELECT json_group_array(
          json_object(
            'name', oi.product_name,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) FROM order_items oi WHERE oi.order_id = o.id) as items_json
      FROM orders o
      WHERE o.client_id = ?
      ORDER BY o.date DESC
    `, client.id)
    
    let history = `📋 История ${client.name}\n\n`
    history += `📱 ${client.phone}\n🔑 ${client.code}\n`
    history += `🛍 Покупок: ${purchases.length}\n\n`
    
    if (purchases.length === 0) {
      history += 'Нет покупок 🌸'
    } else {
      purchases.forEach((p, i) => {
        history += `📦 #${i + 1}\n`
        const items = p.items_json ? JSON.parse(p.items_json) : []
        items.forEach(item => {
          history += `  • ${item.name} - ${item.price} сум x${item.quantity || 1}\n`
        })
        if (p.comment) history += `  📝 ${p.comment}\n`
        history += `💰 ${p.total} сум\n📅 ${formatDate(p.date)}\n\n`
      })
    }
    
    await bot.sendMessage(chatId, history)
    return
  }
  
  // ===== ПОИСК =====
  if (state.action === 'search') {
    if (text === '/cancel') {
      delete userStates[chatId]
      await bot.sendMessage(chatId, '✅ Отменено')
      return
    }
    
    try {
      const query = text.trim()
      if (!db) await initDB()
      
      const phoneQuery = query.replace(/[^0-9]/g, '')
      
      const clients = await db.all(`
        SELECT * FROM clients 
        WHERE 
          LOWER(name) LIKE LOWER(?)
          OR REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') LIKE ?
          OR code LIKE ?
        ORDER BY created_at DESC
      `, 
        `%${query}%`,
        `%${phoneQuery}%`,
        `%${query}%`
      )
      
      delete userStates[chatId]
      
      if (clients.length === 0) {
        await bot.sendMessage(chatId, '❌ Не найдено')
        return
      }
      
      let message = `🔍 Найдено ${clients.length}:\n\n`
      for (const client of clients) {
        const count = await db.get(
          'SELECT COUNT(*) as c FROM orders WHERE client_id = ?',
          client.id
        )
        message += `${client.telegram_id ? '✅' : '❌'} ${client.name}\n`
        message += `   📱 ${client.phone}\n🔑 ${client.code}\n`
        message += `   🛍 ${count ? count.c : 0}\n\n`
      }
      
      await bot.sendMessage(chatId, message)
      
    } catch (error) {
      console.error(error)
      await bot.sendMessage(chatId, '❌ Ошибка')
    }
    return
  }
  
  // ===== УДАЛЕНИЕ =====
  if (state.action === 'delete_step1') {
    if (text === '/cancel') {
      delete userStates[chatId]
      await bot.sendMessage(chatId, '✅ Отменено')
      return
    }
    
    const code = text.trim()
    if (!db) await initDB()
    
    const client = await db.get('SELECT * FROM clients WHERE code = ?', code)
    if (!client) {
      await bot.sendMessage(chatId, '❌ Не найден')
      return
    }
    
    state.action = 'confirm_delete'
    state.clientCode = code
    state.clientName = client.name
    
    await bot.sendMessage(chatId, 
      `⚠️ Удалить ${client.name}?\n\nОтправьте ДА или НЕТ`,
      {
        reply_markup: {
          keyboard: [['✅ ДА', '❌ НЕТ']],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      }
    )
    return
  }
  
  if (state.action === 'confirm_delete') {
    if (text === '✅ ДА' || text.toLowerCase() === 'да') {
      try {
        await db.run('DELETE FROM clients WHERE code = ?', state.clientCode)
        delete userStates[chatId]
        await bot.sendMessage(chatId, `✅ Удален`, {
          reply_markup: { 
            keyboard: [
              ['👤 Добавить клиента', '🛍 Добавить покупку'],
              ['📋 История клиента', '🔍 Поиск клиента'],
              ['📋 Список клиентов', '🗑 Удалить клиента'],
              ['❓ Помощь']
            ],
            resize_keyboard: true 
          }
        })
      } catch (error) {
        console.error(error)
        await bot.sendMessage(chatId, '❌ Ошибка')
      }
    } else {
      delete userStates[chatId]
      await bot.sendMessage(chatId, '❌ Отменено', {
        reply_markup: { 
          keyboard: [
            ['👤 Добавить клиента', '🛍 Добавить покупку'],
            ['📋 История клиента', '🔍 Поиск клиента'],
            ['📋 Список клиентов', '🗑 Удалить клиента'],
            ['❓ Помощь']
          ],
          resize_keyboard: true 
        }
      })
    }
    return
  }
  
  // ===== ДОБАВЛЕНИЕ ПОКУПКИ =====
  
  // Шаг 1: Ввод кода клиента
  if (state.action === 'addpurchase_step1') {
    if (text === '/cancel') {
      delete userStates[chatId]
      await bot.sendMessage(chatId, '✅ Отменено')
      return
    }
    
    const code = text.trim()
    if (!db) await initDB()
    
    const client = await db.get('SELECT * FROM clients WHERE code = ?', code)
    if (!client) {
      await bot.sendMessage(chatId, '❌ Клиент не найден. Попробуйте снова или /cancel')
      return
    }
    
    state.action = 'addpurchase_name'
    state.clientId = client.id
    state.clientName = client.name
    state.clientCode = client.code
    
    await bot.sendMessage(chatId,
      `👤 Клиент: ${client.name} (${client.code})\n\n` +
      `📝 Введите НАЗВАНИЕ товара:\n\n` +
      `Или /cancel для отмены`
    )
    return
  }
  
  // Шаг 2: Ввод названия
  if (state.action === 'addpurchase_name') {
    if (text === '/cancel') {
      delete userStates[chatId]
      await bot.sendMessage(chatId, '✅ Отменено')
      return
    }
    
    state.productName = text.trim()
    state.action = 'addpurchase_price'
    
    await bot.sendMessage(chatId,
      `🛍 Товар: ${state.productName}\n\n` +
      `💰 Введите ЦЕНУ (в сумах):\n\n` +
      `Пример: 400000\n\n` +
      `Или /cancel для отмены`
    )
    return
  }
  
  // Шаг 3: Ввод цены
  if (state.action === 'addpurchase_price') {
    if (text === '/cancel') {
      delete userStates[chatId]
      await bot.sendMessage(chatId, '✅ Отменено')
      return
    }
    
    const priceStr = text.replace(/[^0-9]/g, '')
    const price = parseInt(priceStr)
    
    if (isNaN(price) || price <= 0) {
      await bot.sendMessage(chatId, '❌ Неверная цена. Введите число:\n\nПример: 400000')
      return
    }
    
    state.price = price
    state.action = 'addpurchase_quantity'
    
    await bot.sendMessage(chatId,
      `🛍 Товар: ${state.productName}\n` +
      `💰 Цена: ${price.toLocaleString()} сум\n\n` +
      `📦 Введите КОЛИЧЕСТВО:\n\n` +
      `Пример: 2\n\n` +
      `Или /cancel для отмены`
    )
    return
  }
  
  // Шаг 4: Ввод количества
  if (state.action === 'addpurchase_quantity') {
    if (text === '/cancel') {
      delete userStates[chatId]
      await bot.sendMessage(chatId, '✅ Отменено')
      return
    }
    
    const qty = parseInt(text.replace(/[^0-9]/g, ''))
    
    if (isNaN(qty) || qty <= 0) {
      await bot.sendMessage(chatId, '❌ Неверное количество. Введите число:\n\nПример: 2')
      return
    }
    
    state.quantity = qty
    state.action = 'addpurchase_comment'
    
    await bot.sendMessage(chatId,
      `🛍 Товар: ${state.productName}\n` +
      `💰 Цена: ${state.price.toLocaleString()} сум\n` +
      `📦 Количество: ${state.quantity}\n` +
      `📝 Введите КОММЕНТАРИЙ (скидка, особые пожелания и т.д.)\n` +
      `Или отправьте "нет" если комментария нет:\n\n` +
      `Или /cancel для отмены`
    )
    return
  }
  
  // Шаг 5: Ввод комментария
  if (state.action === 'addpurchase_comment') {
    if (text === '/cancel') {
      delete userStates[chatId]
      await bot.sendMessage(chatId, '✅ Отменено')
      return
    }
    
    state.comment = text.trim() === 'нет' ? null : text.trim()
    
    let message = `📋 ПРОВЕРЬТЕ ДАННЫЕ:\n\n`
    message += `👤 Клиент: ${state.clientName} (${state.clientCode})\n`
    message += `🛍 Товар: ${state.productName}\n`
    message += `💰 Цена: ${state.price.toLocaleString()} сум\n`
    message += `📦 Количество: ${state.quantity}\n`
    if (state.comment) {
      message += `📝 Комментарий: ${state.comment}\n`
    }
    message += `\n✅ Сохранить покупку?`
    
    state.action = 'addpurchase_confirm'
    
    await bot.sendMessage(chatId, message, {
      reply_markup: {
        keyboard: [
          ['✅ ДА, СОХРАНИТЬ', '❌ ОТМЕНА']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    })
    return
  }
  
  // Шаг 6: Подтверждение
  if (state.action === 'addpurchase_confirm') {
    if (text === '✅ ДА, СОХРАНИТЬ') {
      try {
        const total = state.price * state.quantity
        const date = new Date()
        
        console.log('📝 Сохраняем покупку:', {
          clientId: state.clientId,
          total: total,
          date: date.toISOString(),
          comment: state.comment || null
        })
        
        const orderResult = await db.run(
          'INSERT INTO orders (client_id, total, date, comment) VALUES (?, ?, ?, ?)',
          state.clientId, 
          total.toString(), 
          date.toISOString(), 
          state.comment || null
        )
        
        const orderId = orderResult.lastID
        console.log(`✅ Заказ создан ID: ${orderId}`)
        
        await db.run(
          'INSERT INTO order_items (order_id, product_name, price, quantity) VALUES (?, ?, ?, ?)',
          orderId, 
          state.productName, 
          state.price.toString(), 
          state.quantity
        )
        
        console.log(`✅ Товар добавлен в заказ ${orderId}`)
        
        let message = `✅ ПОКУПКА СОХРАНЕНА!\n\n`
        message += `👤 Клиент: ${state.clientName}\n`
        message += `🛍 ${state.productName}\n`
        message += `💰 ${state.price.toLocaleString()} сум x${state.quantity}\n`
        message += `💳 Итого: ${total.toLocaleString()} сум\n`
        if (state.comment) {
          message += `📝 ${state.comment}\n`
        }
        message += `📅 ${formatDate(date)}`
        
        delete userStates[chatId]
        
        await bot.sendMessage(chatId, message, {
          reply_markup: { 
            keyboard: [
              ['👤 Добавить клиента', '🛍 Добавить покупку'],
              ['📋 История клиента', '🔍 Поиск клиента'],
              ['📋 Список клиентов', '🗑 Удалить клиента'],
              ['❓ Помощь']
            ],
            resize_keyboard: true 
          }
        })
        
      } catch (error) {
        console.error('❌ Ошибка при сохранении:', error)
        await bot.sendMessage(chatId, 
          `❌ Ошибка при сохранении в базу:\n${error.message}\n\n` +
          `Попробуйте еще раз или нажмите /cancel для отмены`
        )
      }
      return
    }
    
    if (text === '❌ ОТМЕНА') {
      delete userStates[chatId]
      await bot.sendMessage(chatId, '❌ Отменено', {
        reply_markup: { 
          keyboard: [
            ['👤 Добавить клиента', '🛍 Добавить покупку'],
            ['📋 История клиента', '🔍 Поиск клиента'],
            ['📋 Список клиентов', '🗑 Удалить клиента'],
            ['❓ Помощь']
          ],
          resize_keyboard: true 
        }
      })
      return
    }
    
    await bot.sendMessage(chatId, '❌ Нажмите кнопку: "✅ ДА, СОХРАНИТЬ" или "❌ ОТМЕНА"')
    return
  }
})

// ============ КЛИЕНТЫ ============

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id
  
  if (isAdmin(chatId)) {
    const keyboard = {
      reply_markup: {
        keyboard: [
          ['👤 Добавить клиента', '🛍 Добавить покупку'],
          ['📋 История клиента', '🔍 Поиск клиента'],
          ['📋 Список клиентов', '🗑 Удалить клиента'],
          ['❓ Помощь']
        ],
        resize_keyboard: true
      }
    }
    await bot.sendMessage(chatId, '🤖 Админ-панель', keyboard)
    return
  }
  
  try {
    if (!db) await initDB()
    
    let client = await db.get(
      'SELECT * FROM clients WHERE telegram_id = ?',
      chatId.toString()
    )
    
    if (!client) {
      userStates[chatId] = { action: 'client_login' }
      await bot.sendMessage(chatId, 
        '🌸 Введите ваш 7-значный код:'
      )
      return
    }
    
    await showHistory(chatId, client)
    
  } catch (error) {
    console.error(error)
    await bot.sendMessage(chatId, '❌ Ошибка')
  }
})

async function showHistory(chatId, client) {
  try {
    const purchases = await db.all(`
      SELECT o.*,
        (SELECT json_group_array(
          json_object(
            'name', oi.product_name,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) FROM order_items oi WHERE oi.order_id = o.id) as items_json
      FROM orders o
      WHERE o.client_id = ?
      ORDER BY o.date DESC
    `, client.id)
    
    let history = `🌸 История ${client.name}\n\n`
    
    if (purchases.length === 0) {
      history += 'Нет покупок 🌸'
    } else {
      purchases.forEach((p, i) => {
        history += `📦 #${i + 1}\n`
        const items = p.items_json ? JSON.parse(p.items_json) : []
        items.forEach(item => {
          history += `  • ${item.name} - ${item.price} сум x${item.quantity || 1}\n`
        })
        if (p.comment) history += `  📝 ${p.comment}\n`
        history += `💰 ${p.total} сум\n📅 ${formatDate(p.date)}\n\n`
      })
    }
    
    await bot.sendMessage(chatId, history)
    
  } catch (error) {
    console.error(error)
    await bot.sendMessage(chatId, '❌ Ошибка')
  }
}

// ============ ЗАПУСК ============

initDB().then(() => {
  console.log('🤖 Бот запущен!')
  console.log('👤 Админ ID:', adminId)
})

bot.on('error', (error) => {
  console.error('❌ Ошибка:', error)
})