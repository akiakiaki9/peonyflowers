'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaBars, FaTimes } from 'react-icons/fa'
import './navbar.css'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <Link href="/" className="nav-logo">
          <span className="logo-icon">🌸</span>
          Peony Flowers
        </Link>

        <div className="nav-links">
          <Link href="/">Главная</Link>
          <Link href="#products">Букеты</Link>
          <a href="https://t.me/gullar_sovgalar" target="_blank" rel="noopener noreferrer">Бот</a>
        </div>

        <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`nav-mobile ${isOpen ? 'open' : ''}`}>
          <Link href="/" onClick={() => setIsOpen(false)}>Главная</Link>
          <Link href="#products" onClick={() => setIsOpen(false)}>Букеты</Link>
          <a href="https://t.me/gullar_sovgalar" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>Бот</a>
        </div>
      </div>
    </nav>
  )
}