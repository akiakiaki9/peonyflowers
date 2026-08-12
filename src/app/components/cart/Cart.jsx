'use client'

import { useState, useEffect } from 'react'
import { FaTimes, FaTrash, FaPlus, FaMinus, FaShoppingBag } from 'react-icons/fa'
import CheckoutModal from './CheckoutModal'
import './cart.css'

export default function Cart({ isOpen, onClose, cartItems, onRemove, onUpdateQuantity }) {
    const [showCheckout, setShowCheckout] = useState(false)
    const [itemCount, setItemCount] = useState(0)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    useEffect(() => {
        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0)
        setItemCount(count)
    }, [cartItems])

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const handleCheckout = () => {
        setShowCheckout(true)
    }

    return (
        <>
            <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
            <div className={`cart-panel ${isOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2>
                        <FaShoppingBag style={{ color: '#dc143c' }} />
                        Корзина
                        {itemCount > 0 && <span>{itemCount}</span>}
                    </h2>
                    <button className="cart-close" onClick={onClose} aria-label="Закрыть корзину">
                        <FaTimes />
                    </button>
                </div>

                <div className="cart-body">
                    {cartItems.length === 0 ? (
                        <div className="cart-empty">
                            <span className="empty-icon">🌸</span>
                            <p>Корзина пуста</p>
                            <p className="empty-sub">Добавьте букеты из каталога</p>
                        </div>
                    ) : (
                        <>
                            <div className="cart-items">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="cart-item">
                                        <div className="cart-item-image">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} loading="lazy" />
                                            ) : (
                                                <div className="cart-item-placeholder">🌹</div>
                                            )}
                                        </div>
                                        <div className="cart-item-info">
                                            <h4>{item.name}</h4>
                                            <div className="item-meta">
                                                <span className="cart-item-price">
                                                    {item.price.toLocaleString()} сум
                                                </span>
                                            </div>
                                        </div>
                                        <div className="cart-item-controls">
                                            <button
                                                className="qty-btn"
                                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                aria-label="Уменьшить количество"
                                            >
                                                <FaMinus />
                                            </button>
                                            <span className="qty-count">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                aria-label="Увеличить количество"
                                            >
                                                <FaPlus />
                                            </button>
                                            <button
                                                className="remove-btn"
                                                onClick={() => onRemove(item.id)}
                                                aria-label="Удалить товар"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-footer">
                                <div className="cart-summary">
                                    <div className="cart-items-count">
                                        <span>Товаров:</span>
                                        <span>{itemCount} шт.</span>
                                    </div>
                                    <div className="cart-total">
                                        <span className="label">Итого:</span>
                                        <span className="total-price">{total.toLocaleString()} сум</span>
                                    </div>
                                </div>
                                <button className="checkout-btn" onClick={handleCheckout}>
                                    Оформить заказ
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <CheckoutModal
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                cartItems={cartItems}
                total={total}
            />
        </>
    )
}