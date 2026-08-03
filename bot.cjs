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

// Подключение к базе данных
async function initDB() {
  try {
    const dbPath = path.join(__dirname, 'database', 'peony.db')
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    console.log('✅ База данных подключена')
    return db
  } catch (error) {
    console.error('❌ Ошибка подключения к БД:', error)
    return null
  }
}

// Генерация кода
function generateCode() {
  return Math.floor(1000000 + Math.random() * 9000000).toString()
}

// Форматирование даты
function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Очистка телефона от лишних символов
function cleanPhone(phone) {
  return phone.replace(/[^0-9+]/g, '')
}

// Состояния для диалогов
const userStates = {}

// Проверка админа
function isAdmin(chatId) {
  return chatId.toString() === adminId.toString()
}

// ============ КОМАНДЫ ДЛЯ АДМИНА ============

// Главное меню админа
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
    '🤖 Админ-панель Peony Flowers\n\n' +
    'Выберите действие:',
    keyboard
  )
})

// 1. Добавить клиента
bot.onText(/👤 Добавить клиента/, async (msg) => {
  const chatId = msg.chat.id
  
  if (!isAdmin(chatId)) return

  userStates[chatId] = { action: 'addclient' }
  await bot.sendMessage(chatId, 
    '👤 Добавление нового клиента\n\n' +
    'Введите данные в формате:\n' +
    'Имя, Телефон\n\n' +
    'Пример: Акбар, +998940837700\n\n' +
    'Telegram ID клиента привяжется автоматически,\n' +
    'когда клиент впервые войдет в бота по коду.\n\n' +
    'Или отправьте /cancel для отмены'
  )
})

// 2. Добавить покупку
bot.onText(/🛍 Добавить покупку/, async (msg) => {
  const chatId = msg.chat.id
  
  if (!isAdmin(chatId)) return

  userStates[chatId] = { action: 'addpurchase_step1' }
  await bot.sendMessage(chatId, 
    '🛍 Добавление покупки\n\n' +
    'Введите код клиента:\n\n' +
    'Или отправьте /cancel для отмены'
  )
})

// 3. История клиента
bot.onText(/📋 История клиента/, async (msg) => {
  const chatId = msg.chat.id
  
  if (!isAdmin(chatId)) return

  userStates[chatId] = { action: 'history' }
  await bot.sendMessage(chatId, 
    '📋 Введите код клиента для просмотра истории покупок:\n\n' +
    'Или отправьте /cancel для отмены'
  )
})

// 4. Поиск клиента
bot.onText(/🔍 Поиск клиента/, async (msg) => {
  const chatId = msg.chat.id
  
  if (!isAdmin(chatId)) return

  userStates[chatId] = { action: 'search' }
  await bot.sendMessage(chatId, 
    '🔍 Введите поисковый запрос:\n\n' +
    'Я ищу по:\n' +
    '• Имени (полное или частичное)\n' +
    '• Телефону (в любом формате)\n' +
    '• Коду клиента (7 цифр)\n\n' +
    'Примеры:\n' +
    '• Акбар\n' +
    '• 94 083\n' +
    '• 4172722\n\n' +
    'Или отправьте /cancel для отмены'
  )
})

// 5. Список клиентов
bot.onText(/📋 Список клиентов/, async (msg) => {
  const chatId = msg.chat.id
  
  if (!isAdmin(chatId)) return

  try {
    if (!db) await initDB()
    
    const clients = await db.all(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM orders WHERE client_id = c.id) as purchases_count
      FROM clients c 
      ORDER BY 
        CASE WHEN c.telegram_id IS NOT NULL THEN 1 ELSE 2 END,
        purchases_count DESC,
        c.created_at DESC
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
    
    if (message.length > 4000) {
      const parts = message.match(/.{1,4000}/g)
      for (const part of parts) {
        await bot.sendMessage(chatId, part)
      }
    } else {
      await bot.sendMessage(chatId, message)
    }
    
  } catch (error) {
    console.error(error)
    await bot.sendMessage(chatId, '❌ Ошибка при получении списка')
  }
})

// 6. Удалить клиента
bot.onText(/🗑 Удалить клиента/, async (msg) => {
  const chatId = msg.chat.id
  
  if (!isAdmin(chatId)) return

  userStates[chatId] = { action: 'delete_step1' }
  await bot.sendMessage(chatId, 
    '🗑 Введите код клиента для удаления:\n\n' +
    'Или отправьте /cancel для отмены'
  )
})

// 7. Помощь
bot.onText(/❓ Помощь/, async (msg) => {
  const chatId = msg.chat.id
  
  if (!isAdmin(chatId)) {
    await bot.sendMessage(chatId, 
      '🌸 Peony Flowers Bot\n\n' +
      'Для просмотра истории покупок:\n' +
      '/start - войти по коду'
    )
    return
  }
  
  await bot.sendMessage(chatId,
    '🤖 Админ-панель Peony Flowers\n\n' +
    '👤 Добавить клиента - добавить нового клиента\n' +
    '🛍 Добавить покупку - добавить покупку клиенту\n' +
    '📋 История клиента - посмотреть историю покупок клиента\n' +
    '🔍 Поиск клиента - найти клиента по имени/телефону/коду\n' +
    '📋 Список клиентов - показать всех клиентов\n' +
    '🗑 Удалить клиента - удалить клиента по коду\n' +
    '❓ Помощь - эта справка\n\n' +
    '📱 Команды для клиентов:\n' +
    '/start - войти по коду или ID'
  )
})

// 8. Отмена
bot.onText(/\/cancel/, async (msg) => {
  const chatId = msg.chat.id
  delete userStates[chatId]
  await bot.sendMessage(chatId, '✅ Действие отменено', {
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

// ============ ОБРАБОТКА СООБЩЕНИЙ (диалоги) ============

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const text = msg.text
  
  const state = userStates[chatId]
  if (!state) return
  
  if (isAdmin(chatId)) {
    
    // ===== ДОБАВЛЕНИЕ КЛИЕНТА =====
    if (state.action === 'addclient') {
      if (text === '/cancel') {
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
        return
      }
      
      try {
        const parts = text.split(',').map(p => p.trim())
        if (parts.length < 2) {
          await bot.sendMessage(chatId, 
            '❌ Неверный формат. Используйте: Имя, Телефон\n' +
            'Пример: Акбар, +998940837700'
          )
          return
        }
        
        const name = parts[0]
        const phone = cleanPhone(parts[1])
        
        if (!db) await initDB()
        
        const phoneDigits = phone.replace(/[^0-9]/g, '')
        const existing = await db.get(
          'SELECT * FROM clients WHERE REPLACE(REPLACE(REPLACE(phone, " ", ""), "-", ""), "+", "") LIKE ?',
          `%${phoneDigits}%`
        )
        
        if (existing) {
          await bot.sendMessage(chatId, 
            `⚠️ Клиент с таким телефоном уже существует:\n\n` +
            `👤 ${existing.name}\n` +
            `📱 ${existing.phone}\n` +
            `🔑 Код: ${existing.code}\n\n` +
            `Хотите добавить нового? Отправьте /cancel для отмены`
          )
          return
        }
        
        const code = generateCode()
        await db.run(
          'INSERT INTO clients (name, phone, code) VALUES (?, ?, ?)',
          name, phone, code
        )
        
        delete userStates[chatId]
        await bot.sendMessage(chatId, 
          `✅ Клиент добавлен!\n\n` +
          `👤 Имя: ${name}\n` +
          `📱 Телефон: ${phone}\n` +
          `🔑 Код: ${code}\n\n` +
          `📌 Отправьте этот код клиенту.`,
          {
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
        )
      } catch (error) {
        console.error(error)
        await bot.sendMessage(chatId, '❌ Ошибка при добавлении клиента')
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
        await bot.sendMessage(chatId, '❌ Клиент не найден. Попробуйте снова или /cancel')
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
      
      let history = `📋 История покупок ${client.name}\n\n`
      history += `📱 Телефон: ${client.phone}\n`
      history += `🔑 Код: ${client.code}\n`
      history += `📨 TG: ${client.telegram_id || 'не привязан'}\n`
      history += `🛍 Всего покупок: ${purchases.length}\n\n`
      
      if (purchases.length === 0) {
        history += 'У клиента пока нет покупок 🌸'
      } else {
        purchases.forEach((purchase, index) => {
          history += `📦 Покупка #${index + 1}\n`
          const items = purchase.items_json ? JSON.parse(purchase.items_json) : []
          items.forEach(item => {
            history += `  • ${item.name} - ${item.price} сум x${item.quantity || 1}\n`
          })
          if (purchase.comment) {
            history += `  📝 Комментарий: ${purchase.comment}\n`
          }
          history += `💰 Итого: ${purchase.total} сум\n`
          history += `📅 ${formatDate(purchase.date)}\n\n`
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
            OR REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') LIKE ?
            OR code LIKE ?
          ORDER BY created_at DESC
        `, 
          `%${query}%`,
          `%${phoneQuery}%`,
          `%${query}%`
        )
        
        delete userStates[chatId]
        
        if (clients.length === 0) {
          await bot.sendMessage(chatId, '❌ Клиенты не найдены')
          return
        }
        
        let message = `🔍 Найдено ${clients.length} клиентов:\n\n`
        for (const client of clients) {
          const purchasesCount = await db.get(
            'SELECT COUNT(*) as count FROM orders WHERE client_id = ?',
            client.id
          )
          
          const lastPurchase = await db.get(`
            SELECT date FROM orders 
            WHERE client_id = ? 
            ORDER BY date DESC LIMIT 1
          `, client.id)
          
          const hasTG = client.telegram_id ? '✅' : '❌'
          message += `${hasTG} ${client.name}\n`
          message += `   📱 ${client.phone}\n`
          message += `   🔑 Код: ${client.code}\n`
          if (client.telegram_id) {
            message += `   📨 TG ID: ${client.telegram_id}\n`
          } else {
            message += `   📨 TG: не привязан\n`
          }
          message += `   🛍 Покупок: ${purchasesCount ? purchasesCount.count : 0}\n`
          if (lastPurchase) {
            message += `   📅 Последняя покупка: ${formatDate(lastPurchase.date)}\n`
          }
          message += `\n`
        }
        
        await bot.sendMessage(chatId, message)
        
      } catch (error) {
        console.error(error)
        await bot.sendMessage(chatId, '❌ Ошибка при поиске')
      }
      return
    }
    
    // ===== УДАЛЕНИЕ КЛИЕНТА =====
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
        await bot.sendMessage(chatId, '❌ Клиент не найден. Попробуйте снова или /cancel')
        return
      }
      
      state.action = 'confirm_delete'
      state.clientCode = code
      state.clientName = client.name
      
      await bot.sendMessage(chatId, 
        `⚠️ Вы действительно хотите удалить клиента?\n\n` +
        `👤 ${client.name}\n` +
        `📱 ${client.phone}\n` +
        `🔑 ${client.code}\n\n` +
        `Отправьте ДА или НЕТ`,
        {
          reply_markup: {
            keyboard: [
              ['✅ ДА', '❌ НЕТ']
            ],
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
          await bot.sendMessage(chatId, 
            `✅ Клиент ${state.clientName} удален`,
            { 
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
          )
        } catch (error) {
          console.error(error)
          await bot.sendMessage(chatId, '❌ Ошибка при удалении')
        }
      } else if (text === '❌ НЕТ' || text.toLowerCase() === 'нет') {
        delete userStates[chatId]
        await bot.sendMessage(chatId, 
          '❌ Удаление отменено',
          { 
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
        )
      }
      return
    }
    
    // ===== ДОБАВЛЕНИЕ ПОКУПКИ =====
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
      
      state.action = 'addpurchase_step2'
      state.clientId = client.id
      state.clientName = client.name
      
      await bot.sendMessage(chatId,
        `👤 Клиент: ${client.name}\n\n` +
        `🛍 Введите покупку в формате:\n` +
        `Название, Цена, Количество, Комментарий (опционально)\n\n` +
        `⚠️ Цена указывается с учетом скидки!\n\n` +
        `Примеры:\n` +
        `• Букет роз, 355000, 2, Скидка 25%\n` +
        `• Букет пионов, 250000, 1\n` +
        `• Букет тюльпанов, 180000, 3, Подарочная упаковка\n\n` +
        `Или отправьте /cancel для отмены`
      )
      return
    }
    
    if (state.action === 'addpurchase_step2') {
      if (text === '/cancel') {
        delete userStates[chatId]
        await bot.sendMessage(chatId, '✅ Отменено')
        return
      }
      
      try {
        const parts = text.split(',').map(p => p.trim())
        if (parts.length < 2) {
          await bot.sendMessage(chatId, 
            '❌ Неверный формат.\n\n' +
            'Используйте: Название, Цена, Количество, Комментарий\n' +
            'Пример: Букет роз, 355000, 2, Скидка 25%'
          )
          return
        }
        
        const name = parts[0]
        const priceStr = parts[1].replace(/\s/g, '')
        const price = parseInt(priceStr)
        
        if (isNaN(price) || price <= 0) {
          await bot.sendMessage(chatId, 
            '❌ Неверная цена. Укажите число.\n' +
            'Пример: Букет роз, 355000, 2, Скидка 25%'
          )
          return
        }
        
        const quantity = parseInt(parts[2]) || 1
        
        if (quantity <= 0) {
          await bot.sendMessage(chatId, '❌ Количество должно быть больше 0')
          return
        }
        
        const comment = parts[3] || null
        const date = new Date()
        
        const total = price * quantity
        
        const orderResult = await db.run(
          'INSERT INTO orders (client_id, total, date, comment) VALUES (?, ?, ?, ?)',
          state.clientId, total.toString(), date.toISOString(), comment
        )
        const orderId = orderResult.lastID
        
        await db.run(
          'INSERT INTO order_items (order_id, product_name, price, quantity) VALUES (?, ?, ?, ?)',
          orderId, name, price.toString(), quantity
        )
        
        delete userStates[chatId]
        
        let message = `✅ Покупка добавлена!\n\n`
        message += `👤 Клиент: ${state.clientName}\n`
        message += `🛍 ${name}\n`
        message += `💰 ${price.toLocaleString()} сум x${quantity}\n`
        message += `💳 Итого: ${total.toLocaleString()} сум\n`
        if (comment) {
          message += `📝 Комментарий: ${comment}\n`
        }
        message += `📅 ${formatDate(date)}`
        
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
        console.error(error)
        await bot.sendMessage(chatId, 
          '❌ Ошибка при добавлении покупки\n\n' +
          'Проверьте формат:\n' +
          'Название, Цена, Количество, Комментарий\n' +
          'Пример: Букет роз, 355000, 2, Скидка 25%'
        )
      }
      return
    }
  }
})

// ============ КОМАНДЫ ДЛЯ КЛИЕНТОВ ============

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
    await bot.sendMessage(chatId, 
      '🤖 Добро пожаловать в админ-панель Peony Flowers!\n\n' +
      'Выберите действие:',
      keyboard
    )
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
        '🌸 Добро пожаловать в Peony Flowers!\n\n' +
        'Введите ваш 7-значный код:\n\n' +
        'Если у вас нет кода, обратитесь к администратору.'
      )
      return
    }
    
    await showHistory(chatId, client)
    
  } catch (error) {
    console.error(error)
    await bot.sendMessage(chatId, '❌ Ошибка при входе')
  }
})

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const text = msg.text
  
  if (isAdmin(chatId)) return
  
  const state = userStates[chatId]
  if (!state || state.action !== 'client_login') return
  
  try {
    if (!db) await initDB()
    
    const code = text.trim()
    if (code.length !== 7) {
      await bot.sendMessage(chatId, '❌ Код должен состоять из 7 цифр. Попробуйте снова')
      return
    }
    
    const client = await db.get('SELECT * FROM clients WHERE code = ?', code)
    if (!client) {
      await bot.sendMessage(chatId, '❌ Код не найден. Проверьте правильность ввода')
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
    await bot.sendMessage(chatId, '❌ Ошибка при входе')
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
    
    let history = `🌸 История покупок ${client.name}\n\n`
    
    if (purchases.length === 0) {
      history += 'У вас пока нет покупок 🌸'
    } else {
      purchases.forEach((purchase, index) => {
        history += `📦 Покупка #${index + 1}\n`
        const items = purchase.items_json ? JSON.parse(purchase.items_json) : []
        items.forEach(item => {
          history += `  • ${item.name} - ${item.price} сум x${item.quantity || 1}\n`
        })
        if (purchase.comment) {
          history += `  📝 Комментарий: ${purchase.comment}\n`
        }
        history += `💰 Итого: ${purchase.total} сум\n`
        history += `📅 ${formatDate(purchase.date)}\n\n`
      })
    }
    
    await bot.sendMessage(chatId, history)
    
  } catch (error) {
    console.error(error)
    await bot.sendMessage(chatId, '❌ Ошибка при получении истории')
  }
}

// ============ ЗАПУСК ============

initDB().then(() => {
  console.log('🤖 Бот Peony Flowers запущен!')
  console.log('👤 Админ ID:', adminId)
  console.log('📱 Напишите /start или /admin для начала работы')
})

bot.on('error', (error) => {
  console.error('❌ Ошибка бота:', error)
})