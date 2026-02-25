import { unstable_cache } from 'next/cache'
import { createServerClient } from '@supabase/ssr'
import { Category } from '@/lib/types'

const getCategories = async (): Promise<Category[]> => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    },
  )

  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return data || []
}

export const getCachedCategories = unstable_cache(
  getCategories,
  ['categories'],
  { revalidate: 300, tags: ['categories'] },
)
