import { FaShoppingCart } from 'react-icons/fa'
import './productCard.css'

export default function ProductCard({ product, onOrder }) {
  return (
    <div className="product-card">
      <div className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="product-placeholder">🌸</div>
        )}
      </div>
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description || 'Свежие цветы'}</p>
        <div className="product-footer">
          <span className="product-price">{product.price} сум</span>
          <button className="product-btn" onClick={() => onOrder(product)}>
            <FaShoppingCart /> Заказать
          </button>
        </div>
      </div>
    </div>
  )
}