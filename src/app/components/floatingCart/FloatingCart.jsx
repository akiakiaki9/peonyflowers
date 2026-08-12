// FloatingCart.js
'use client'

import { useState, useEffect } from 'react'
import { FaShoppingBag } from 'react-icons/fa'
import './floating-cart.css'

export default function FloatingCart({ cartCount, onCartOpen }) {
    const [isVisible, setIsVisible] = useState(true)
    const [prevScrollY, setPrevScrollY] = useState(0)
    const [animateBadge, setAnimateBadge] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            if (currentScrollY > prevScrollY && currentScrollY > 100) {
                setIsVisible(false)
            } else {
                setIsVisible(true)
            }
            setPrevScrollY(currentScrollY)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [prevScrollY])

    // Анимация бейджа при изменении количества
    useEffect(() => {
        if (cartCount > 0) {
            setAnimateBadge(true)
            setTimeout(() => setAnimateBadge(false), 500)
        }
    }, [cartCount])

    const handleClick = () => {
        console.log('🛒 Floating cart clicked, opening cart...')
        if (onCartOpen) {
            onCartOpen()
        } else {
            console.error('❌ onCartOpen is not defined!')
        }
    }

    return (
        <div
            className="floating-cart"
            style={{
                transform: isVisible ? 'translateY(0)' : 'translateY(120px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            <button
                className="floating-cart-btn"
                onClick={handleClick}
                aria-label="Открыть корзину"
            >
                <FaShoppingBag className="cart-icon" />
                <span className={`cart-badge ${cartCount === 0 ? 'empty' : ''} ${animateBadge ? 'animate' : ''}`}>
                    {cartCount > 0 && cartCount}
                </span>
                <span className="floating-cart-tooltip">
                    {cartCount > 0 ? `${cartCount} товар${cartCount === 1 ? '' : cartCount < 5 ? 'а' : 'ов'} в корзине` : 'Корзина пуста'}
                </span>
            </button>
        </div>
    )
}