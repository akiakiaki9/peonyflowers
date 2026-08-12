// contacts.js
'use client'

import { FaPhone, FaMapMarkerAlt, FaClock, FaInstagram, FaTelegram, FaWhatsapp, FaTaxi } from 'react-icons/fa'
import { IoMdCar } from 'react-icons/io'
import './contacts.css'

export default function Contacts() {
    const latitude = "39.792293"
    const longitude = "64.419117"
    const fullAddress = "Eski avtovokzal, Globus supermarket bormasdan, Bukhara, Uzbekistan"

    const handleYandexTaxi = () => {
        const deeplink = `yandextaxi://route/?end-lat=${latitude}&end-lon=${longitude}&end-address=${encodeURIComponent(fullAddress)}`;
        const fallbackUrl = `https://taxi.yandex.uz/?rto=${latitude},${longitude}&text=${encodeURIComponent(fullAddress)}`;
        
        // Пробуем открыть приложение
        const appWindow = window.open(deeplink, '_blank');
        
        // Если не открылось, через 1 секунду переходим на веб-версию
        setTimeout(() => {
            if (appWindow) {
                appWindow.close();
            }
            window.location.href = fallbackUrl;
        }, 1000);
    };

    const handleGoogleMaps = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
        window.open(url, '_blank');
    };

    return (
        <section className="contacts-section" id="contacts">
            <div className="container">
                <div className="contacts-header">
                    <h2 className="contacts-title">
                        Контакты
                        <span className="underline"></span>
                    </h2>
                    <p className="contacts-subtitle">Свяжитесь с нами любым удобным способом</p>
                </div>

                <div className="contacts-grid">
                    <div className="contacts-info">
                        <div className="contact-card">
                            <div className="contact-icon"><FaPhone /></div>
                            <div>
                                <h4>Телефон</h4>
                                <a href="tel:+998940837700">+998 94 083-77-00</a>
                            </div>
                        </div>

                        <div className="contact-card">
                            <div className="contact-icon"><FaMapMarkerAlt /></div>
                            <div>
                                <h4>Адрес</h4>
                                <p>Бухара, старый автовокзал, не доходя до Globus supermarket</p>
                            </div>
                        </div>

                        <div className="contact-card">
                            <div className="contact-icon"><FaClock /></div>
                            <div>
                                <h4>Режим работы</h4>
                                <p>Круглосуточно 24/7</p>
                            </div>
                        </div>

                        <div className="contact-social">
                            <h4>Мы в соцсетях</h4>
                            <div className="social-links">
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

                        <div className="taxi-buttons">
                            <button className="taxi-btn taxi-yandex" onClick={handleYandexTaxi}>
                                <FaTaxi /> Яндекс Go
                            </button>
                            <button className="taxi-btn taxi-google" onClick={handleGoogleMaps}>
                                <IoMdCar /> Google Maps
                            </button>
                        </div>
                    </div>

                    <div className="contacts-map">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1160.861296138889!2d64.419117!3d39.792293!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sru!2s!4v1700000000000"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Peony Flowers location"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}