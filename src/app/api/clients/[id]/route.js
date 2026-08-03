import { NextResponse } from 'next/server'
import { Client } from '@/models/Client'

export async function DELETE(req, { params }) {
    try {
        const { id } = params
        Client.delete(id)
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET(req, { params }) {
    try {
        const { id } = params
        const client = Client.getById(id)
        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }
        const orders = Client.getOrders(id)
        return NextResponse.json({ ...client, orders })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = params
        const body = await req.json()
        Client.update(id, body)
        const client = Client.getById(id)
        return NextResponse.json(client)
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}