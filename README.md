# Bangladesh Girls Fashion E-commerce Platform

A modern, mobile-first e-commerce website for selling girls fashion accessories in Bangladesh. Built with Next.js 16, Supabase, SSLCommerz payment gateway, with full i18n support (English/Bengali) and dark mode.

## Features

### Authentication & User Management
- **Dual Authentication Methods**:
  - Email & Password with Supabase Auth
  - Phone-based OTP authentication (Bangladesh format)
- **User Profiles** with editable information
- **Multiple Address Management** with default address selection
- **Admin Access** with environment password
- **Automatic Phone Verification**

### Customer Features
- **Product Discovery**:
  - Advanced filtering by category and price range
  - Full-text search functionality
  - Sorting options (newest, price low-to-high, price high-to-low)
  - Pagination for browsing
  - Instagram-style product cards
- **Shopping Experience**:
  - Persistent shopping cart with database storage
  - Wishlist for saving favorite items
  - Real-time cart calculations
  - Coupon code support
- **Checkout & Payment**:
  - Complete checkout flow with address collection
  - Multiple payment options:
    - SSLCommerz (Card, bKash, Nagad)
    - Cash on Delivery
  - Automatic delivery charge calculation (Dhaka: 60 BDT, Outside: 120 BDT)
  - Order confirmation and tracking
- **User Dashboard**:
  - Order history with detailed tracking
  - Multiple address management
  - Account settings
  - Payment history

### Product System
- **Categories**: Earrings, Hijabs, Handbags, Hair Accessories, Rings, Bracelets, Combo Offers
- **Rich Product Information**:
  - Multiple images with main image selection
  - Detailed descriptions
  - Price and discount pricing
  - Stock quantity tracking
  - Color and size variants
  - Featured and trending badges
  - Customer reviews and ratings

### Admin Panel
- **Dashboard Analytics**:
  - Total sales and revenue tracking
  - Order count and trends
  - Low stock alerts
  - Quick statistics
- **Product Management**:
  - Add, edit, delete products
  - Manage categories
  - Stock and variant management
  - Image uploads and management
- **Order Management**:
  - View all orders with filtering
  - Order status workflow (Pending → Confirmed → Shipped → Delivered)
  - Customer information and tracking
  - Payment status monitoring
- **Admin-only Routes** with password protection

### Internationalization & Localization
- **Dual Language Support**:
  - English (Default)
  - Bengali (বাংলা)
- **Language Persistence** with localStorage
- **Complete Translation System** for UI strings
- **Easy Language Switching** from header menu

### Design & Theme
- **Dark/Light Mode Toggle** with system preference support
- **Soft Pastel Color Scheme**:
  - Rose Pink (#b46f7f) - Primary
  - Lavender (#a8a3d8) - Secondary
  - Peach (#d4a5a5) - Accent
- **Elegant Typography** with Cormorant Garamond for headings
- **Responsive Mobile-First Design**
- **Smooth Animations & Transitions**
- **Accessibility Features** (ARIA labels, semantic HTML)

### Database & Security
- **14 Production Tables** with proper relationships
- **Row Level Security (RLS)** for data protection
- **Password-protected Admin Panel**
- **Order and Payment Tracking** with transaction logs
- **Phone Verification** table with OTP management
- **Address Management** with multiple saved locations

### Development Features
- **Comprehensive Error Handling** with custom error classes
- **Advanced Logging System** with development and production modes
- **Input Validation Utilities**:
  - Bangladesh phone number validation
  - Email and password validation
  - OTP validation
  - Address validation
  - Price and quantity validation
- **TypeScript** throughout the codebase
- **SEO Optimized** with proper metadata
- **Performance Optimized** with server-side rendering

## Tech Stack

- **Frontend & Backend**: Next.js 16 (App Router)
- **Database & Auth**: Supabase (PostgreSQL)
- **Payment Gateway**: SSLCommerz
- **Storage**: Supabase Storage for product images
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Deployment**: Vercel

## Design

- **Theme**: Soft feminine pastel (rose pink, lavender, peach)
- **Typography**: Cormorant Garamond (headings), Geist (body)
- **Style**: Elegant, minimal, Instagram-style product cards
- **Responsive**: Mobile-first design

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd fashion-ecommerce
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Configure environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
- **Supabase**: Your project URL and anonymous key
- **SSLCommerz**: Your store ID and password
- **App URL**: Your application URL

### 4. Set up the database
The database schema will be automatically created via Supabase migrations.

### 5. Run the development server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Core Tables
- **users**: User profiles with address information
- **categories**: Product categories
- **products**: Product listings with pricing
- **product_images**: Multiple images per product
- **product_variants**: Size, color, and other variants
- **cart**: Persistent shopping cart
- **wishlists**: User's favorite products
- **orders**: Order headers with totals
- **order_items**: Individual items in orders
- **order_addresses**: Shipping addresses for orders
- **reviews**: Product reviews and ratings
- **coupons**: Discount codes
- **payment_logs**: Payment transaction history

### Security
- **Row Level Security (RLS)** enabled on all tables
- **Admin access control** via environment password
- **Secure password hashing** with bcrypt
- **Protected API routes** with authentication checks

## API Routes

### Public
- `GET /api/products` - Get all products (with filtering)
- `GET /api/categories` - Get all categories
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Protected (Authenticated Users)
- `GET/POST/DELETE /api/cart` - Manage shopping cart
- `GET/POST/DELETE /api/wishlist` - Manage wishlist
- `POST /api/checkout` - Create order

### Admin Only
- `GET/POST/PUT/DELETE /api/admin/products` - Product management
- `GET/PUT /api/admin/orders` - Order management
- `GET /api/admin/analytics` - Dashboard analytics

## Payment Integration

### SSLCommerz
The platform integrates with SSLCommerz for secure payments in Bangladesh.

**Supported Payment Methods**:
- Visa/Mastercard
- bKash
- Nagad
- Cash on Delivery (COD)

**Webhook Integration**: Automatic order confirmation upon successful payment

## Admin Access

Set `ADMIN_PASSWORD` in your environment. Visit `/admin/login` and enter the password to access admin routes.

## Deployment

### Deploy to Vercel
```bash
pnpm run build
vercel
```

The application will be deployed with automatic SSL certificates and global CDN.

## Performance Optimizations

- **Server-Side Rendering (SSR)** for product pages
- **Image optimization** with Next.js Image component
- **Database indexing** on frequently queried fields
- **Caching strategies** for product and category data
- **Code splitting** and lazy loading
- **Tailwind CSS** purging for minimal CSS bundle

## Security Features

- **Supabase Authentication** with secure session management
- **Row Level Security** on database queries
- **Environment variable** protection
- **CSRF protection** on form submissions
- **SQL injection prevention** with parameterized queries
- **Rate limiting** on API endpoints

## Future Enhancements

- [ ] Advanced analytics dashboard
- [ ] Email notifications for order updates
- [ ] Product review and rating system
- [ ] Inventory management with low stock alerts
- [ ] Customer support chat
- [ ] Multi-language support
- [ ] AR/VR product preview
- [ ] Social media integration
- [ ] Gift cards and loyalty program

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact support@fashionhub.bd or open an issue on the repository.

## Acknowledgments

- Supabase for the amazing database and auth platform
- SSLCommerz for Bangladesh payment processing
- shadcn/ui for beautiful components
- Tailwind CSS for utility-first styling
