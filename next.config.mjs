/** @type {import('next').NextConfig} */
const remotePatterns = []
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

if (supabaseUrl) {
  const url = new URL(supabaseUrl)
  remotePatterns.push({
    protocol: url.protocol.replace(':', ''),
    hostname: url.hostname,
    pathname: '/storage/v1/object/public/**',
  })
}

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns,
  },
}

export default nextConfig
