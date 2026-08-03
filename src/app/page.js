'use client'

import { FaWhatsapp, FaTelegram, FaInstagram } from 'react-icons/fa'
import { BiPhone, BiMapPin, BiTime } from 'react-icons/bi'
import { catalog } from '@/utils/data'
import './globals.css'
import Navbar from './components/navbar/Navbar'
import Catalog from './components/catalog/Catalog'
import Footer from './components/footer/Footer'

export default function Home() {
  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content container">
          <h1 className="fade-in-up">Peony Flowers</h1>
          <p className="fade-in-up" style={{ animationDelay: '0.2s' }}>Букеты на любой вкус</p>
          <div className="hero-info fade-in-up" style={{ animationDelay: '0.4s' }}>
            <span><BiTime /> 24/7</span>
            <span><BiMapPin /> Eski avtovokzal, Globus supermarket bormasdan</span>
            <span><BiPhone /> +998 94 083-77-00</span>
          </div>
          <div className="hero-social fade-in-up" style={{ animationDelay: '0.6s' }}>
            <a href="https://www.instagram.com/peony_flowers_bukhara/" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://t.me/gullar_sovgalar" target="_blank" rel="noopener noreferrer">
              <FaTelegram />
            </a>
            <a href="https://wa.me/998940837700" target="_blank" rel="noopener noreferrer">
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="catalog-section container" id="products">
        <h2 className="section-title fade-in">Наши букеты</h2>
        <Catalog products={catalog} />
      </section>

      {/* Info Section */}
      <section className="info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-card fade-in-up">
              <h3>🚗 Доставка по городу</h3>
              <p>Быстрая и аккуратная доставка цветов в любой район города</p>
            </div>
            <div className="info-card fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h3>🕤 24/7</h3>
              <p>Работаем круглосуточно, принимаем заказы в любое время</p>
            </div>
            <div className="info-card fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h3>💐 Свежие цветы</h3>
              <p>Только свежие цветы от проверенных поставщиков</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bot Info */}
      <section className="bot-section">
        <div className="container">
          <div className="bot-card fade-in-up">
            <h2>📱 Наш Telegram бот</h2>
            <p>Получите доступ к истории покупок через Telegram бота</p>
            <div className="bot-info">
              <div className="bot-step">
                <span className="step-number">1</span>
                <p>Напишите боту <a href="https://t.me/peony_flowers_bot" target="_blank">@peony_flowers_bot</a></p>
              </div>
              <div className="bot-step">
                <span className="step-number">2</span>
                <p>Нажмите /start</p>
              </div>
              <div className="bot-step">
                <span className="step-number">3</span>
                <p>Введите 7-значный код, полученный от администратора</p>
              </div>
            </div>
            <a href="https://t.me/peony_flowers_bot" target="_blank" className="bot-btn">
              <FaTelegram /> Перейти в бот
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}