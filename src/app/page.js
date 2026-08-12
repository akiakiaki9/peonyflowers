// app/page.js (обновленный)
'use client'

import { useState, useEffect } from 'react'
import Navbar from './components/navbar/Navbar'
import Header from './components/header/Header'
import Catalog from './components/catalog/Catalog'
import Contacts from './components/contacts/Contacts'
import Footer from './components/footer/Footer'
import Cart from './components/cart/Cart'
import FloatingCart from './components/floatingCart/FloatingCart'
import { catalog } from '@/app/utils/data'

export default function Home() {
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Загружаем корзину из localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (e) {
        console.error('Error loading cart:', e)
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    }
  }, [cartItems, mounted])

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id)
      return
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleOpenCart = () => {
    setIsCartOpen(true)
  }

  return (
    <>
      <Navbar cartCount={totalItems} onCartOpen={handleOpenCart} />
      <Header />
      <Catalog products={catalog} onAddToCart={addToCart} />
      <Contacts />
      <Footer />

      {/* <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
      /> */}

      {/* <FloatingCart
        cartCount={totalItems}
        onCartOpen={handleOpenCart}
      /> */}
    </>
  )
}