// CheckoutModal.js
'use client'

import { useState } from 'react'
import { FaTimes, FaPhone, FaTelegram, FaCheckCircle } from 'react-icons/fa'
import './checkout-modal.css'

export default function CheckoutModal({ isOpen, onClose, cartItems, total }) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [errors, setErrors] = useState({})

    const validateForm = () => {
        const newErrors = {}
        if (!name.trim()) newErrors.name = 'Введите ваше имя'
        if (!phone.trim()) newErrors.phone = 'Введите номер телефона'
        else if (!/^[\d\s+()-]{7,15}$/.test(phone)) {
            newErrors.phone = 'Введите корректный номер'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setLoading(true)
        try {
            const orderData = {
                name: name.trim(),
                phone: phone.trim(),
                items: cartItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                total: total,
                date: new Date().toISOString()
            }

            const response = await fetch('/api/send-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            })

            const result = await response.json()

            if (result.success) {
                setSuccess(true)
                setTimeout(() => {
                    onClose()
                    setSuccess(false)
                    setName('')
                    setPhone('')
                }, 3000)
            } else {
                alert('Ошибка при отправке заказа. Попробуйте позже.')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Ошибка при отправке заказа. Попробуйте позже.')
        } finally {
            setLoading(false)
        }
    }

    const handlePhoneCall = () => {
        window.location.href = 'tel:+998940837700'
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <FaCheckCircle /> Оформление заказа
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    {success ? (
                        <div className="modal-success">
                            <span className="success-icon">✅</span>
                            <h3>Заказ отправлен!</h3>
                            <p>Мы свяжемся с вами в ближайшее время</p>
                        </div>
                    ) : (
                        <>
                            <div className="order-summary">
                                <h3>Ваш заказ</h3>
                                {cartItems.map((item, index) => (
                                    <div key={index} className="order-item">
                                        <span>{item.name} × {item.quantity}</span>
                                        <span>{(item.price * item.quantity).toLocaleString()} сум</span>
                                    </div>
                                ))}
                                <div className="order-total">
                                    <span>Итого:</span>
                                    <span className="total-price">{total.toLocaleString()} сум</span>
                                </div>
                            </div>

                            <div className="order-divider">или</div>

                            <div className="modal-options">
                                <button className="modal-option-btn call-btn" onClick={handlePhoneCall}>
                                    <FaPhone />
                                    <span>Позвонить</span>
                                </button>
                            </div>

                            <div className="order-divider">или заполните форму</div>

                            <form className="modal-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="name">Имя</label>
                                        <input
                                            id="name"
                                            type="text"
                                            placeholder="Ваше имя"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className={errors.name ? 'error' : ''}
                                            disabled={loading}
                                        />
                                        {errors.name && <span style={{ color: '#dc143c', fontSize: '0.8rem' }}>{errors.name}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="phone">Телефон</label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            placeholder="+998 90 123 45 67"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className={errors.phone ? 'error' : ''}
                                            disabled={loading}
                                        />
                                        {errors.phone && <span style={{ color: '#dc143c', fontSize: '0.8rem' }}>{errors.phone}</span>}
                                    </div>
                                </div>
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Отправка...' : (
                                        <>
                                            <FaTelegram /> Отправить заказ
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}