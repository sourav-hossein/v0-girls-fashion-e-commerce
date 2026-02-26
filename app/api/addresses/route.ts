import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
 
    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { division_id, district_id, thana_id } = body

    if (!division_id || !district_id || !thana_id) {
      return NextResponse.json({ message: 'Division, district, and thana are required' }, { status: 400 })
    }

    const { error } = await supabase.from('user_addresses').insert([
      {
        ...body,
        user_id: userData.user.id,
      },
    ])

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Address added' })
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, set_default, ...updates } = body

    if (!id) {
      return NextResponse.json({ message: 'Address id is required' }, { status: 400 })
    }

    if (set_default) {
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', userData.user.id)

      const { error } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', userData.user.id)

      if (error) throw error
      return NextResponse.json({ success: true, message: 'Default address updated' })
    }

    const { error } = await supabase
      .from('user_addresses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userData.user.id)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Address updated' })
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ message: 'Address id is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userData.user.id)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Address deleted' })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
