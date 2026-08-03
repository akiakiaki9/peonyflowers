export async function POST(request) {
  try {
    const orderData = await request.json()
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const adminId = process.env.ADMIN_TELEGRAM_ID
    
    if (!botToken || !adminId) {
      console.error('❌ TELEGRAM_BOT_TOKEN или ADMIN_TELEGRAM_ID не настроены')
      return new Response(JSON.stringify({ 
        error: 'Бот не настроен. Обратитесь к администратору.' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Формируем сообщение
    const message = 
`🆕 НОВЫЙ ЗАКАЗ С САЙТА!

👤 Имя: ${orderData.name}
📱 Телефон: ${orderData.phone}
🌸 Товар: ${orderData.product}
📦 Количество: ${orderData.quantity}
💰 Цена: ${orderData.price} сум
💳 Итого: ${orderData.total} сум
📅 Время: ${new Date(orderData.date).toLocaleString('ru-RU')}

📌 Свяжитесь с клиентом!`

    // Отправляем через Telegram Bot API
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: adminId,
        text: message,
        parse_mode: 'HTML'
      })
    })

    const result = await response.json()

    if (!result.ok) {
      console.error('❌ Ошибка Telegram API:', result)
      return new Response(JSON.stringify({ 
        error: 'Не удалось отправить уведомление' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('✅ Уведомление отправлено админу')
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Ошибка:', error)
    return new Response(JSON.stringify({ 
      error: 'Внутренняя ошибка сервера' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}