'use client'

import { useState } from 'react'
import { FaPhone, FaWhatsapp, FaTimes, FaShoppingCart } from 'react-icons/fa'
import './catalog.css'

export default function Catalog({ products }) {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    quantity: 1
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const openModal = (product) => {
    setSelectedProduct(product)
    setFormData({
      name: '',
      phone: '',
      quantity: 1
    })
    setSuccess(false)
    setError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
    setError('')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Проверка телефона
    if (formData.phone.length < 9) {
      setError('Введите корректный номер телефона')
      setIsLoading(false)
      return
    }

    const total = selectedProduct.price * formData.quantity

    const orderData = {
      name: formData.name,
      phone: formData.phone,
      product: selectedProduct.name,
      quantity: formData.quantity,
      price: selectedProduct.price,
      total: total,
      date: new Date().toISOString()
    }

    try {
      const response = await fetch('/api/send-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setIsLoading(false)
      } else {
        setError(data.error || 'Ошибка при отправке заказа')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Ошибка соединения. Попробуйте позже.')
      setIsLoading(false)
    }
  }

  return (
    <div className="catalog-container">
      <div className="catalog-grid">
        {products.map((product) => (
          <div key={product.id} className="catalog-card">
            <div className="catalog-image">
              {product.image ? (
                <img src={product.image} alt={product.name} />
              ) : (
                <div className="catalog-placeholder">🌸</div>
              )}
              <div className="catalog-badge">{product.category}</div>
            </div>
            <div className="catalog-body">
              <h3 className="catalog-name">{product.name}</h3>
              <p className="catalog-description">{product.description}</p>
              <div className="catalog-footer">
                <span className="catalog-price">{product.price.toLocaleString()} сум</span>
                <button 
                  className="catalog-btn"
                  onClick={() => openModal(product)}
                >
                  <FaShoppingCart /> Заказать
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <FaTimes />
            </button>

            {success ? (
              <div className="modal-success">
                <div className="success-icon">✅</div>
                <h2>Заказ принят!</h2>
                <p>Мы свяжемся с вами в ближайшее время</p>
                <div className="order-summary">
                  <p><strong>Товар:</strong> {selectedProduct.name}</p>
                  <p><strong>Количество:</strong> {formData.quantity}</p>
                  <p><strong>Итого:</strong> {(selectedProduct.price * formData.quantity).toLocaleString()} сум</p>
                </div>
                <div className="success-actions">
                  <a 
                    href={`https://wa.me/998940837700?text=${encodeURIComponent(
                      `Здравствуйте! Я заказал(а) ${selectedProduct.name} (${formData.quantity} шт.)\nИмя: ${formData.name}\nТелефон: ${formData.phone}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="success-btn wa"
                  >
                    <FaWhatsapp /> Написать в WhatsApp
                  </a>
                  <a 
                    href="tel:+998940837700"
                    className="success-btn call"
                  >
                    <FaPhone /> Позвонить
                  </a>
                </div>
                <button className="modal-btn" onClick={closeModal}>
                  Закрыть
                </button>
              </div>
            ) : (
              <>
                <h2 className="modal-title">🌷 Оформление заказа</h2>
                <div className="modal-product">
                  <h3>{selectedProduct.name}</h3>
                  <p className="modal-price">{selectedProduct.price.toLocaleString()} сум</p>
                </div>

                {error && (
                  <div className="modal-error">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="modal-form">
                  <div className="form-group">
                    <label>Ваше имя *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Например: Акбар"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Номер телефона *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+998 94 083-77-00"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Количество</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      max="99"
                    />
                  </div>

                  <div className="modal-total">
                    <span>Итого:</span>
                    <span className="total-price">
                      {(selectedProduct.price * formData.quantity).toLocaleString()} сум
                    </span>
                  </div>

                  <button 
                    type="submit" 
                    className="modal-submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Отправка...' : '✅ Оформить заказ'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}