import HeaderClient from '@/components/header-client'
import { getCachedCategories } from '@/lib/categories'

export default async function Header() {
  const categories = await getCachedCategories()
  return <HeaderClient categories={categories} />
}
