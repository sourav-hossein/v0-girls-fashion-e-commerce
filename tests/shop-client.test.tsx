import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShopClient from '@/components/shop-client'
import { renderWithProviders } from './test-utils'
import { Category, Product, ProductImage } from '@/lib/types'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(''),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('ShopClient', () => {
  beforeEach(() => {
    pushMock.mockClear()
  })

  const categories: Category[] = [
    {
      id: 'cat-dresses',
      name: 'Dresses',
      slug: 'dresses',
      created_at: '2026-02-28T00:00:00.000Z',
      updated_at: '2026-02-28T00:00:00.000Z',
    },
  ]

  const productImages: ProductImage[] = [
    {
      id: 'img-1',
      product_id: 'prod-1',
      image_url: 'https://placehold.co/600x800?text=Rose',
      is_main: true,
      display_order: 0,
      created_at: '2026-02-28T00:00:00.000Z',
    },
  ]

  const products: (Product & { product_images?: ProductImage[] })[] = [
    {
      id: 'prod-1',
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
      product_images: productImages,
    },
  ]

  it('renders products', () => {
    renderWithProviders(
      <ShopClient
        initialProducts={products}
        categories={categories}
        currentSort="newest"
        currentPage={1}
        totalPages={1}
        totalProducts={1}
      />,
    )

    expect(screen.getByText('Rose Garden Party Dress')).toBeInTheDocument()
  })

  it('updates router on category change', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ShopClient
        initialProducts={products}
        categories={categories}
        currentSort="newest"
        currentPage={1}
        totalPages={1}
        totalProducts={1}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Dresses' }))
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining('category=dresses'))
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining('sort=newest'))
  })

  it('updates router on search', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ShopClient
        initialProducts={products}
        categories={categories}
        currentSort="newest"
        currentPage={1}
        totalPages={1}
        totalProducts={1}
      />,
    )

    await user.type(screen.getByPlaceholderText('Search products...'), 'rose')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining('search=rose'))
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining('sort=newest'))
  })

  it('updates router on sort change', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ShopClient
        initialProducts={products}
        categories={categories}
        currentSort="newest"
        currentPage={1}
        totalPages={1}
        totalProducts={1}
      />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Price: Low to High' }))
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining('sort=price-low'))
  })

  it('updates router on pagination', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ShopClient
        initialProducts={products}
        categories={categories}
        currentSort="newest"
        currentPage={1}
        totalPages={2}
        totalProducts={20}
      />,
    )

    await user.click(screen.getByRole('button', { name: '2' }))
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining('page=2'))
  })
})
