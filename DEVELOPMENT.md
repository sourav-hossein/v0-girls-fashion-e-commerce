# Development Guide

This guide covers development setup, architecture, and best practices for the Bangladesh Girls Fashion E-commerce Platform.

## Project Structure

```
├── app/                          # Next.js app directory
│   ├── (public)/               # Public pages
│   │   ├── page.tsx           # Homepage
│   │   ├── shop/              # Shop page with filtering
│   │   ├── product/[slug]/    # Product detail page
│   │   ├── cart/              # Shopping cart
│   │   ├── wishlist/          # Wishlist page
│   │   ├── checkout/          # Checkout flow
│   │   └── order-success/     # Order confirmation
│   ├── auth/                   # Authentication pages
│   │   ├── login/             # Email login
│   │   ├── register/          # Email registration
│   │   └── phone/             # Phone OTP login
│   ├── account/                # User dashboard (protected)
│   │   ├── page.tsx           # Profile overview
│   │   ├── orders/            # Order history
│   │   ├── addresses/         # Address management
│   │   └── settings/          # Account settings
│   ├── admin/                  # Admin panel (role-protected)
│   │   ├── page.tsx           # Dashboard
│   │   ├── products/          # Product management
│   │   └── orders/            # Order management
│   ├── api/                    # API routes
│   │   ├── auth/              # Auth endpoints
│   │   ├── payment/           # Payment processing
│   │   ├── cart/              # Cart management
│   │   ├── addresses/         # Address CRUD
│   │   └── admin/             # Admin endpoints
│   ├── layout.tsx             # Root layout with providers
│   └── globals.css            # Global styles with design tokens
│
├── components/                 # Reusable React components
│   ├── ui/                     # shadcn/ui components
│   ├── header.tsx             # Main header with navigation
│   ├── footer.tsx             # Footer
│   ├── hero.tsx               # Homepage hero section
│   ├── product-card.tsx       # Product display card
│   ├── *-client.tsx           # Client-side component wrappers
│   └── theme-language-toggle.tsx # Theme/language switcher
│
├── lib/                        # Utility functions and configurations
│   ├── supabase.ts            # Supabase client setup
│   ├── supabase-server.ts     # Server-side Supabase client
│   ├── types.ts               # TypeScript type definitions
│   ├── translations.ts        # i18n translations (EN/BN)
│   ├── phone-auth.ts          # Phone authentication utilities
│   ├── sslcommerz.ts          # Payment gateway integration
│   ├── error-handler.ts       # Custom error classes
│   ├── logger.ts              # Logging utilities
│   ├── validators.ts          # Input validation functions
│   └── utils.ts               # General utility functions
│
├── hooks/                      # Custom React hooks
│   ├── use-translation.ts     # Translation hook
│   ├── use-mobile.ts          # Mobile breakpoint hook
│   └── use-toast.ts           # Toast notification hook
│
├── scripts/                    # Database and utility scripts
│   ├── 01_create_tables.sql   # Initial schema
│   ├── 02_create_rls_policies.sql # Security policies
│   ├── 03_add_phone_auth_fields.sql # Phone auth tables
│   └── seed-demo-data.sql     # Demo data
│
├── public/                     # Static assets
│   ├── icon.svg               # App icon
│   └── images/                # Product images
│
├── middleware.ts              # Next.js middleware for auth
├── .env.example               # Environment variables template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # Project documentation
```

## Key Technologies

### Core Framework
- **Next.js 16**: App Router, Server Components, API Routes
- **React 19**: Latest React features with optimizations
- **TypeScript**: Full type safety throughout

### Database & Auth
- **Supabase**: PostgreSQL database + authentication
- **Row Level Security**: Data protection at database level
- **Supabase SSR**: Server-side authentication handling

### UI & Styling
- **Tailwind CSS v4**: Utility-first styling
- **shadcn/ui**: High-quality accessible components
- **next-themes**: Dark mode support
- **Lucide React**: Icon library

### Additional Libraries
- **SWR**: Data fetching and caching
- **Zod**: Schema validation
- **date-fns**: Date formatting
- **Sonner**: Toast notifications
- **React Hook Form**: Form management

## Development Workflow

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Add your credentials:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SSLCOMMERZ_STORE_ID
# - SSLCOMMERZ_STORE_PASS
```

### 2. Start Development Server

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

### 3. Database Changes

New schema changes should be:
1. Written as migration SQL files in `/scripts`
2. Applied via Supabase dashboard or CLI
3. Not committed with data migrations

## Code Patterns & Best Practices

### Authentication
- Use `useAuth()` hook for client-side auth checks
- Use middleware for route protection
- Always check user role before admin operations

```typescript
// Client component
const { user, isLoading } = useAuth()
if (!user) return <Redirect to="/auth/login" />
```

### Data Fetching
- Use SWR for client-side data fetching
- Use Server Components for SSR data
- Implement proper error handling

```typescript
// Client component with SWR
import useSWR from 'swr'
const { data, error, isLoading } = useSWR('/api/products', fetcher)

// Server component
const data = await fetch('...', { cache: 'force-cache' })
```

### Form Handling
- Use React Hook Form for complex forms
- Validate with custom validators or Zod schemas
- Show inline errors and loading states

```typescript
const { register, handleSubmit, formState: { errors } } = useForm()
```

### Error Handling
- Use custom error classes from `lib/error-handler.ts`
- Always log errors with `logger.error()`
- Show user-friendly error messages

```typescript
try {
  // operation
} catch (error) {
  logger.error('Operation failed', error)
  toast.error(getErrorMessage(error))
}
```

### Translations
- Use `useTranslation()` hook to get current language
- Add new translations to `lib/translations.ts`
- Always provide both EN and BN translations

```typescript
const { language } = useTranslation()
const text = t('key', language) // Returns EN or BN text
```

## Component Development Guidelines

### Creating New Components
1. Place reusable components in `/components`
2. Use Client Components (`'use client'`) only when necessary
3. Extract UI logic into separate `-client` component
4. Use TypeScript for type safety

```typescript
// server-side component
export default function ProductPage() {
  const data = await fetchProduct()
  return <ProductClient product={data} />
}

// client component
'use client'
export function ProductClient({ product }: Props) {
  const [state, setState] = useState()
  return <div>...</div>
}
```

### Component Props
Always use TypeScript interfaces:

```typescript
interface Props {
  title: string
  onSubmit: (data: FormData) => Promise<void>
  isLoading?: boolean
  className?: string
}
```

## Database Best Practices

### Queries
- Always use parameterized queries to prevent SQL injection
- Include proper indexes for performance
- Use RLS policies for security

```typescript
// Good
const { data, error } = await supabase
  .from('users')
  .select()
  .eq('id', userId)
  .single()

// Avoid raw queries
const { data } = await supabase.rpc('raw_query', { sql: userInput })
```

### Mutations
- Always update the `updated_at` timestamp
- Use transactions for related updates
- Handle conflicts gracefully

```typescript
const { error } = await supabase
  .from('users')
  .update({ ...userData, updated_at: new Date() })
  .eq('id', userId)
```

## Performance Optimization

### Image Optimization
- Use Next.js Image component
- Provide proper width/height
- Use appropriate image formats

```typescript
import Image from 'next/image'
<Image src="/image.jpg" alt="..." width={400} height={300} />
```

### Code Splitting
- Use dynamic imports for large components
- Implement lazy loading for modals and heavy sections

```typescript
const Modal = dynamic(() => import('@/components/Modal'))
```

### Caching Strategy
- Cache static pages with `revalidate`
- Use SWR for client-side caching
- Implement proper cache invalidation

## Testing Tips

### Manual Testing Checklist
- [ ] All pages load without errors
- [ ] Authentication flows work (email + phone)
- [ ] Cart and checkout complete successfully
- [ ] Admin operations restricted to admins
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Dark mode toggle works
- [ ] Language switching updates UI
- [ ] Payment flow initiates correctly
- [ ] Order confirmation displays properly
- [ ] All forms validate correctly

### Browser DevTools
- Check Console for errors and warnings
- Use Network tab to verify API calls
- Check Performance tab for optimization opportunities
- Verify Lighthouse scores

## Debugging

### Using Logger
```typescript
import { logger } from '@/lib/logger'

logger.debug('Message', { data })
logger.info('Information', metadata)
logger.warn('Warning', details)
logger.error('Error', error)
```

### Common Issues

**Authentication failures**
- Check Supabase URL and key in .env
- Verify RLS policies are correct
- Check user role assignments

**Payment issues**
- Verify SSLCommerz credentials
- Check transaction logs in database
- Review SSLCommerz documentation

**Data not updating**
- Check RLS policies allow the operation
- Verify user ID matches owner ID
- Check for database triggers or constraints

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Security headers configured
- [ ] CORS properly set
- [ ] Error tracking setup (Sentry optional)
- [ ] Analytics configured
- [ ] Email notifications setup
- [ ] Payment gateway in production mode
- [ ] Rate limiting enabled
- [ ] Backups configured

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [SSLCommerz Integration](https://www.sslcommerz.com/)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

## Support

For issues or questions, check:
1. Project README.md
2. Code comments and docstrings
3. Database schema documentation
4. External library documentation
