import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { headers } from 'next/headers'

async function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1]
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  return payload
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartItems = await db.cartItem.findMany({
      where: { userId: user.userId },
      include: {
        product: true
      }
    })

    return NextResponse.json({ items: cartItems })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity } = await request.json()

    // check if item exists
    const existingItem = await db.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.userId,
          productId
        }
      }
    })

    if (existingItem) {
      const updated = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      })
      return NextResponse.json({ item: updated })
    }

    const newItem = await db.cartItem.create({
      data: {
        userId: user.userId,
        productId,
        quantity
      }
    })

    return NextResponse.json({ item: newItem })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity } = await request.json()

    const existingItem = await db.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.userId,
          productId
        }
      }
    })

    if (existingItem) {
      const updated = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: quantity }
      })
      return NextResponse.json({ item: updated })
    }

    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()

    await db.cartItem.delete({
      where: {
        userId_productId: {
          userId: user.userId,
          productId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}