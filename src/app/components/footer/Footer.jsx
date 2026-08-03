import { FaInstagram, FaTelegram, FaWhatsapp, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import './footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>🌸 Peony Flowers</h3>
            <p>Свежие цветы с любовью</p>
          </div>
          <div className="footer-col">
            <h4>Контакты</h4>
            <p><FaPhone /> +998 94 083-77-00</p>
            <p><FaMapMarkerAlt /> Eski avtovokzal, Globus supermarket bormasdan</p>
            <p><FaClock /> 24/7</p>
          </div>
          <div className="footer-col">
            <h4>Мы в соцсетях</h4>
            <div className="footer-social">
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
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Peony Flowers. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}