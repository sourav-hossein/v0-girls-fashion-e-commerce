import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies })

    const { data: banners, error } = await supabase
      .from('hero_banners')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error

    return NextResponse.json(banners)
  } catch (error) {
    console.error('[v0] Error fetching banners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const body = await request.json()

    const { data: banner, error } = await supabase
      .from('hero_banners')
      .insert([{
        title: body.title,
        subtitle: body.subtitle,
        desktop_image_url: body.desktop_image_url,
        mobile_image_url: body.mobile_image_url,
        cta_text: body.cta_text,
        cta_url: body.cta_url,
        display_order: body.display_order || 0,
        active: body.active !== false,
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(banner)
  } catch (error) {
    console.error('[v0] Error creating banner:', error)
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    )
  }
}
