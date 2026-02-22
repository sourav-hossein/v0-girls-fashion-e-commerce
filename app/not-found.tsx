import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-6xl font-bold text-primary mb-4">404</div>
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Sorry, we couldn't find the page you're looking for. Let's get you back to shopping!
        </p>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
