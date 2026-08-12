// footer.js
import { FaHeart } from 'react-icons/fa'
import { FaInstagram, FaTelegram } from 'react-icons/fa'
import './footer.css'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-top">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <img src="/images/logo.png" alt="Peony Flowers" />
                                <span>Peony Flowers</span>
                            </div>
                            <p className="brand-desc">
                                Создаем неповторимые букеты из свежих цветов с любовью к каждой детали
                            </p>
                            <div className="brand-tagline">
                                <FaHeart /> Цветы, которые говорят без слов
                            </div>
                        </div>

                        <div className="footer-links">
                            <h4>Навигация</h4>
                            <a href="#catalog">Каталог</a>
                            <a href="#contacts">Контакты</a>
                        </div>

                        <div className="footer-social">
                            <h4>Связь с нами</h4>
                            <div className="social-icons">
                                <a href="https://www.instagram.com/peony_flowers_bukhara/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                    <FaInstagram />
                                </a>
                                <a href="https://t.me/gullar_sovgalar" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                                    <FaTelegram />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <div className="copyright">
                            <span>© {currentYear} Peony Flowers</span>
                            <span>•</span>
                            <span>Все права защищены</span>
                        </div>
                        <div className="footer-dev">
                            <span>Разработано с</span>
                            <FaHeart />
                            <a href="https://akbarsoft.uz" target="_blank" rel="noopener noreferrer">
                                Akbar Soft
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
};