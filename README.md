# Bangladesh Girls Fashion E-commerce Platform

A modern, mobile-first e-commerce website for selling girls fashion accessories in Bangladesh. Built with Next.js, Supabase, and SSLCommerz payment gateway.

## Features

### Customer Features
- **Email & Password Authentication** with Supabase Auth
- **Phone number field** with Bangladesh format validation
- **User Profile Dashboard** with order history
- **Address System** with Division, District, Thana, and full address
- **Wishlist** for saving favorite products
- **Shopping Cart** with persistent storage in database
- **Multiple Payment Options**:
  - SSLCommerz (Card, bKash, Nagad)
  - Cash on Delivery

### Product System
- **Categories**: Earrings, Hijabs, Handbags, Hair Accessories, Rings, Bracelets, Combo Offers
- **Multiple product images** with main image selection
- **Price & discount pricing**
- **Stock quantity tracking**
- **Color variants & sizes**
- **Featured & trending toggles**

### Shop Features
- **Advanced filtering** by category and price range
- **Search** by product name
- **Sorting** options (newest, low to high, high to low price)
- **Pagination** for product browsing
- **Responsive design** for all devices

### Checkout & Orders
- **Shipping address collection** with Bangladesh regions
- **Automatic delivery charge calculation**:
  - Inside Dhaka: 60 BDT
  - Outside Dhaka: 120 BDT
- **Coupon code support**
- **Order confirmation** and status tracking
- **Order history** in user dashboard

### Admin Panel
- **Role-based access control** (admin/customer)
- **Product Management**:
  - Add, edit, delete products
  - Manage stock and variants
  - Upload images
- **Order Management**:
  - View all orders
  - Change order status (Pending → Confirmed → Shipped → Delivered)
  - Track payments
- **Dashboard Analytics**:
  - Total sales
  - Total orders
  - Low stock warnings
  - Recent orders

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
- **user_roles**: Role assignment (customer/admin)
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
- **Role-based access control** for admin features
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

To create an admin user:
1. Register a new account normally
2. Go to your Supabase dashboard
3. In the `user_roles` table, add a role entry with:
   - `user_id`: The user's ID
   - `role`: Set to `'admin'`

Admin users can then access `/admin` routes.

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
