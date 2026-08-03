export async function GET() {
  return new Response(JSON.stringify({ 
    message: 'Products API',
    products: []
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function POST() {
  return new Response(JSON.stringify({ 
    message: 'Product created',
    success: true
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}