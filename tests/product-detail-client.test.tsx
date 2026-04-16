import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductDetailClient from '@/components/product-detail-client'
import { renderWithProviders } from './test-utils'
import { Product, ProductImage, ProductVariant, Review } from '@/lib/types'

const {
  pushMock,
  addToCartMock,
  trackEventMock,
  toastSuccessMock,
  toastErrorMock,
  MockCartAuthError,
} = vi.hoisted(() => {
  class HoistedMockCartAuthError extends Error {}

  return {
    pushMock: vi.fn(),
    addToCartMock: vi.fn(),
    trackEventMock: vi.fn(),
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
    MockCartAuthError: HoistedMockCartAuthError,
  }
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('@/lib/cart-api', () => ({
  addToCart: (...args: any[]) => addToCartMock(...args),
  CartAuthError: MockCartAuthError,
}))

vi.mock('@/lib/analytics-client', () => ({
  trackEvent: (...args: any[]) => trackEventMock(...args),
}))

vi.mock('sonner', () => ({
  toast: {
    success: (...args: any[]) => toastSuccessMock(...args),
    error: (...args: any[]) => toastErrorMock(...args),
  },
}))

const baseProduct: Product = {
  id: 'prod-rose-dress',
  name: 'Rose Garden Party Dress',
  slug: 'rose-garden-party-dress',
  description: 'Soft chiffon dress with floral print.',
  price: 3200,
  discount_price: 2800,
  category_id: 'cat-dresses',
  stock_quantity: 40,
  featured: true,
  trending: true,
  deleted_at: null,
  created_at: '2026-02-28T00:00:00.000Z',
  updated_at: '2026-02-28T00:00:00.000Z',
}

const images: ProductImage[] = [
  {
    id: 'img-1',
    product_id: 'prod-rose-dress',
    image_url: 'https://placehold.co/600x800?text=Rose',
    alt_text: 'Rose Garden Party Dress',
    is_main: true,
    display_order: 0,
    created_at: '2026-02-28T00:00:00.000Z',
  },
]

const variants: ProductVariant[] = [
  {
    id: 'var-s',
    product_id: 'prod-rose-dress',
    variant_type: 'size',
    variant_value: 'S',
    stock_quantity: 10,
    created_at: '2026-02-28T00:00:00.000Z',
    updated_at: '2026-02-28T00:00:00.000Z',
  },
]

const reviews: Review[] = [
  {
    id: 'rev-1',
    product_id: 'prod-rose-dress',
    user_id: 'user-1',
    rating: 5,
    comment: 'Great fit.',
    created_at: '2026-02-28T00:00:00.000Z',
    updated_at: '2026-02-28T00:00:00.000Z',
  },
]

describe('ProductDetailClient', () => {
  beforeEach(() => {
    pushMock.mockClear()
    addToCartMock.mockReset()
    trackEventMock.mockClear()
    toastSuccessMock.mockClear()
    toastErrorMock.mockClear()
    ;(global.fetch as any) = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    })
  })

  it('renders product details and pricing', () => {
    renderWithProviders(
      <ProductDetailClient
        product={baseProduct}
        images={images}
        variants={variants}
        reviews={reviews}
        relatedProducts={[]}
      />,
    )

    expect(screen.getByText('Rose Garden Party Dress')).toBeInTheDocument()
    expect(screen.getByText('2800')).toBeInTheDocument()
    expect(screen.getByText('3200')).toBeInTheDocument()
  })

  it('requires variant selection before add to cart', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ProductDetailClient
        product={baseProduct}
        images={images}
        variants={variants}
        reviews={reviews}
        relatedProducts={[]}
      />,
    )

    await user.click(screen.getByRole('button', { name: /add to cart/i }))
    expect(addToCartMock).not.toHaveBeenCalled()
    expect(toastErrorMock).toHaveBeenCalledWith('Please select a variant')
  })

  it('adds to cart with selected variant', async () => {
    const user = userEvent.setup()
    addToCartMock.mockResolvedValueOnce(undefined)
    renderWithProviders(
      <ProductDetailClient
        product={baseProduct}
        images={images}
        variants={variants}
        reviews={reviews}
        relatedProducts={[]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'S' }))
    await user.click(screen.getByRole('button', { name: /add to cart/i }))

    await waitFor(() => {
      expect(addToCartMock).toHaveBeenCalledWith({
        productId: baseProduct.id,
        variantId: variants[0].id,
        quantity: 1,
      })
    })
    expect(toastSuccessMock).toHaveBeenCalledWith('Added to cart!')
  })

  it('redirects to login on auth error', async () => {
    const user = userEvent.setup()
    addToCartMock.mockRejectedValueOnce(new MockCartAuthError('Please login'))
    renderWithProviders(
      <ProductDetailClient
        product={baseProduct}
        images={images}
        variants={variants}
        reviews={reviews}
        relatedProducts={[]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'S' }))
    await user.click(screen.getByRole('button', { name: /add to cart/i }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Please login')
      expect(pushMock).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('toggles wishlist on success', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      })
    ;(global.fetch as any) = fetchMock

    renderWithProviders(
      <ProductDetailClient
        product={baseProduct}
        images={images}
        variants={variants}
        reviews={reviews}
        relatedProducts={[]}
      />,
    )

    await user.click(screen.getByRole('button', { name: /add to wishlist/i }))
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/wishlist')
      expect(fetchMock).toHaveBeenCalledWith('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: baseProduct.id }),
      })
    })
    expect(toastSuccessMock).toHaveBeenCalledWith('Added to wishlist')
  })
})
