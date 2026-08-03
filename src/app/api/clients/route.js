export async function GET() {
  return new Response(JSON.stringify({ 
    message: 'Clients API',
    clients: []
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function POST() {
  return new Response(JSON.stringify({ 
    message: 'Client created',
    success: true
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}