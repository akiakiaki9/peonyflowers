'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaBars, FaTimes, FaShoppingBag } from 'react-icons/fa'
import './navbar.css'

export default function Navbar({ cartCount, onCartOpen }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <Link href="/" className="nav-logo">
            <img src="/images/logo.png" alt="Peony Flowers" />
            <span>Peony Flowers</span>
          </Link>

          <div className="nav-links">
            <a href="#catalog">Каталог</a>
            <a href="#contacts">Контакты</a>
            {/* <button className="nav-cart-btn" onClick={onCartOpen} aria-label="Корзина">
              <FaShoppingBag />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button> */}
          </div>

          <button className="nav-toggle" onClick={toggleMenu} aria-label="Меню">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-logo">
            <img src="/images/logo.png" alt="Peony Flowers" />
            <span>Peony Flowers</span>
          </div>
          <button className="mobile-close" onClick={closeMenu} aria-label="Закрыть">
            <FaTimes />
          </button>
        </div>
        <div className="mobile-menu-body">
          <a href="#catalog" onClick={closeMenu}>Каталог</a>
          <a href="#contacts" onClick={closeMenu}>Контакты</a>
          {/* <button className="mobile-cart-btn" onClick={() => {
            closeMenu()
            onCartOpen()
          }}>
            <FaShoppingBag /> Корзина {cartCount > 0 && `(${cartCount})`}
          </button> */}
        </div>
      </div>
    </>
  )
}