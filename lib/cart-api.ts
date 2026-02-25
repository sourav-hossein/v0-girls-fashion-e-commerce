export class CartAuthError extends Error {
  status: number

  constructor(message: string, status = 401) {
    super(message)
    this.name = 'CartAuthError'
    this.status = status
  }
}

type CartResponse<T> = T

async function parseJson<T>(response: Response): Promise<CartResponse<T>> {
  const data = await response.json().catch(() => ({}))
  if (response.status === 401) {
    throw new CartAuthError('Please log in to continue.')
  }
  if (!response.ok) {
    throw new Error((data as { error?: string })?.error || 'Cart request failed')
  }
  return data as CartResponse<T>
}

export async function getCart() {
  const response = await fetch('/api/cart')
  return parseJson<any[]>(response)
}

export async function addToCart({
  productId,
  variantId,
  quantity = 1,
}: {
  productId: string
  variantId?: string | null
  quantity?: number
}) {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: productId,
      variant_id: variantId ?? null,
      quantity,
    }),
  })
  return parseJson<any>(response)
}

export async function updateCartItem({
  id,
  quantity,
}: {
  id: string
  quantity: number
}) {
  const response = await fetch('/api/cart', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, quantity }),
  })
  return parseJson<any>(response)
}

export async function removeCartItem(id: string) {
  const response = await fetch(`/api/cart?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  return parseJson<{ success: boolean }>(response)
}
