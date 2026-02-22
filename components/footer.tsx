import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif font-bold text-lg text-foreground mb-4">
              Hijab & Fashion
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Premium fashion accessories for the modern, stylish you.
            </p>
            <p className="text-xs text-muted-foreground">
              Serving Bangladesh with elegance since day one.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/shop" className="hover:text-primary transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/shop?category=hijabs" className="hover:text-primary transition-colors">
                  Hijabs
                </Link>
              </li>
              <li>
                <Link href="/shop?category=earrings" className="hover:text-primary transition-colors">
                  Earrings
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bags" className="hover:text-primary transition-colors">
                  Handbags
                </Link>
              </li>
              <li>
                <Link href="/shop?category=combos" className="hover:text-primary transition-colors">
                  Combo Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/shipping" className="hover:text-primary transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-primary transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-8 gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Hijab & Fashion. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground">
              📱 Available on
            </span>
            <p className="text-sm text-muted-foreground">
              Secure Payment • Fast Delivery • Quality Guaranteed
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
