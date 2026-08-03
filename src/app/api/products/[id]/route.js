import { NextResponse } from 'next/server'
import { Product } from '@/models/Product'

export async function DELETE(req, { params }) {
  try {
    const { id } = params
    Product.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}