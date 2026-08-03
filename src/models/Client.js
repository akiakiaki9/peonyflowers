import { getDB, generateCode } from '@/lib/db'

export const Client = {
  async getAll() {
    const db = await getDB()
    return db.all(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM orders WHERE client_id = c.id) as orders_count
      FROM clients c 
      ORDER BY c.created_at DESC
    `)
  },

  async getById(id) {
    const db = await getDB()
    return db.get(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM orders WHERE client_id = c.id) as orders_count
      FROM clients c 
      WHERE c.id = ?
    `, id)
  },

  async getByCode(code) {
    const db = await getDB()
    return db.get('SELECT * FROM clients WHERE code = ?', code)
  },

  async create(data) {
    const db = await getDB()
    const code = generateCode()
    const result = await db.run(
      'INSERT INTO clients (name, phone, telegram_id, code) VALUES (?, ?, ?, ?)',
      data.name, data.phone, data.telegramId || null, code
    )
    return this.getById(result.lastID)
  },

  async delete(id) {
    const db = await getDB()
    return db.run('DELETE FROM clients WHERE id = ?', id)
  },

  async update(id, data) {
    const db = await getDB()
    await db.run(
      'UPDATE clients SET name = ?, phone = ?, telegram_id = ? WHERE id = ?',
      data.name, data.phone, data.telegramId || null, id
    )
    return this.getById(id)
  },

  async getOrders(id) {
    const db = await getDB()
    const orders = await db.all(`
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
    `, id)
    
    // Парсим JSON
    return orders.map(order => ({
      ...order,
      items: order.items_json ? JSON.parse(order.items_json) : []
    }))
  },

  async addOrder(clientId, items, total) {
    const db = await getDB()
    
    // Создаем заказ
    const orderResult = await db.run(
      'INSERT INTO orders (client_id, total) VALUES (?, ?)',
      clientId, total
    )
    const orderId = orderResult.lastID

    // Добавляем товары в заказ
    for (const item of items) {
      await db.run(
        'INSERT INTO order_items (order_id, product_name, price, quantity) VALUES (?, ?, ?, ?)',
        orderId, item.name, item.price, item.quantity || 1
      )
    }

    return this.getOrders(clientId)
  }
}