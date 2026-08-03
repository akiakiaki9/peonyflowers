import { getDB } from '@/lib/db'

export const Product = {
  async getAll() {
    const db = await getDB()
    return db.all('SELECT * FROM products ORDER BY created_at DESC')
  },

  async getById(id) {
    const db = await getDB()
    return db.get('SELECT * FROM products WHERE id = ?', id)
  },

  async create(data) {
    const db = await getDB()
    const result = await db.run(
      'INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)',
      data.name, data.price, data.description, data.image
    )
    return this.getById(result.lastID)
  },

  async delete(id) {
    const db = await getDB()
    return db.run('DELETE FROM products WHERE id = ?', id)
  },

  async update(id, data) {
    const db = await getDB()
    await db.run(
      'UPDATE products SET name = ?, price = ?, description = ?, image = ? WHERE id = ?',
      data.name, data.price, data.description, data.image, id
    )
    return this.getById(id)
  }
}