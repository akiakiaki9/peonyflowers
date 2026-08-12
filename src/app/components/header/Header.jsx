// header.js
'use client'

import { FaInstagram, FaTelegram, FaWhatsapp, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import VideoBackground from '../VideoBackground/VideoBackground'
import './header.css'

export default function Header() {
    const scrollToCatalog = () => {
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
    }

    const scrollToContacts = () => {
        document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <VideoBackground>
            <div className="header-content">
                <div className="header-text">
                    <h1 className="header-title">
                        <span className="title-line">Peony</span>
                        <span className="title-line">Flowers</span>
                    </h1>
                    <p className="header-subtitle">Букеты на любой вкус</p>

                    <div className="header-info">
                        <span><FaClock /> 24/7</span>
                        <span><FaMapMarkerAlt /> Бухара, старый автовокзал</span>
                        <span><FaPhone /> +998 94 083-77-00</span>
                    </div>

                    <div className="header-buttons">
                        <button className="btn-primary" onClick={scrollToCatalog}>
                            Каталог
                        </button>
                        <button className="btn-secondary" onClick={scrollToContacts}>
                            Контакты
                        </button>
                    </div>

                    <div className="header-social">
                        <a href="https://www.instagram.com/peony_flowers_bukhara/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <FaInstagram />
                        </a>
                        <a href="https://t.me/gullar_sovgalar" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                            <FaTelegram />
                        </a>
                        <a href="https://wa.me/998940837700" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                            <FaWhatsapp />
                        </a>
                    </div>
                </div>
            </div>
        </VideoBackground>
    )
}