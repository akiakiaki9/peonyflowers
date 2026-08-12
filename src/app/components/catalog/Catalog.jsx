// catalog.js
'use client'

import { useState } from 'react'
import { FaPhone, FaTimes } from 'react-icons/fa'
import './catalog.css'

export default function Catalog({ products }) {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOrderClick = () => {
    window.location.href = 'tel:+998940837700'
  }

  const handleImageClick = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setIsModalOpen(false)
    document.body.style.overflow = 'unset'
    setTimeout(() => {
      setSelectedProduct(null)
    }, 300)
  }

  return (
    <>
      <section className="catalog-section" id="catalog">
        <div className="container">
          <div className="catalog-header">
            <h2 className="catalog-title">Наши букеты</h2>
            <p className="catalog-subtitle">Свежие цветы с любовью</p>
          </div>

          <div className="catalog-grid">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="catalog-card"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div
                  className="card-image"
                  onClick={() => handleImageClick(product)}
                  style={{ cursor: 'pointer' }}
                >
                  {product.image ? (
                    <img src={product.image} alt={product.name} loading="lazy" />
                  ) : (
                    <div className="card-placeholder">🌹</div>
                  )}
                </div>

                <div className="card-body">
                  <div className="card-footer">
                    <span className="card-price">{product.price.toLocaleString()} сум</span>
                    <button
                      className="card-btn"
                      onClick={handleOrderClick}
                    >
                      <FaPhone /> Заказать
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && selectedProduct && (
        <div className="product-modal-overlay" onClick={closeModal}>
          <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="product-modal-close" onClick={closeModal}>
              <FaTimes />
            </button>

            <div className="product-modal-image">
              {selectedProduct.image ? (
                <img src={selectedProduct.image} alt={selectedProduct.name} />
              ) : (
                <div className="modal-placeholder">🌹</div>
              )}
              <div className="product-modal-badge">{selectedProduct.category}</div>
            </div>

            <div className="product-modal-body">
              <h2 className="product-modal-name">{selectedProduct.name}</h2>
              <p className="product-modal-description">{selectedProduct.description}</p>

              <div className="product-modal-footer">
                <span className="product-modal-price">
                  {selectedProduct.price.toLocaleString()} сум
                </span>
                <button
                  className="product-modal-btn"
                  onClick={handleOrderClick}
                >
                  <FaPhone /> Заказать по телефону
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}