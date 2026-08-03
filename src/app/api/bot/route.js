export async function GET() {
  return new Response(JSON.stringify({ 
    message: 'Bot API',
    status: 'ok'
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function POST() {
  return new Response(JSON.stringify({ 
    status: 'ok'
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}