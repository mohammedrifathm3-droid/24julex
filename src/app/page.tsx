
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ProductGrid from '@/components/ProductGrid'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Sparkles, Shield, Truck } from 'lucide-react'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const products = await db.product.findMany({
    take: 12,
    where: {
      isActive: true
    },
    include: {
      category: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const featuredProducts = products.map(product => ({
    ...product,
    description: product.description || '',
    images: product.images ? JSON.parse(product.images) : [],
    priceB2b: product.priceB2b || undefined
  }))

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-yellow-50 via-white to-pink-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <Badge className="bg-gradient-to-r from-purple-400 to-pink-600 text-white text-sm font-medium px-4 py-2">
              ✨ Premium Anti-Tarnish Jewelry
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-deep-900 leading-tight">
              Jewelry That
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                {' '}Lasts Forever
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our stunning collection of waterproof, anti-tarnish jewelry designed for the modern Gen-Z fashion enthusiast. Made in Salem, loved worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold px-8 py-4 text-lg">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/collections">
                <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-yellow-400 font-semibold px-8 py-4 text-lg">
                  View Collections
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-gold transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-deep-900">Anti-Tarnish Technology</h3>
                <p className="text-gray-600">Advanced coating that keeps your jewelry shining bright for years, no tarnish guaranteed.</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-gold transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-deep-900">Waterproof Design</h3>
                <p className="text-gray-600">Wear it anywhere, anytime. Our jewelry is completely waterproof and perfect for everyday wear.</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-gold transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-deep-900">Fast Shipping</h3>
                <p className="text-gray-600">Quick delivery across India. Express shipping available for all your urgent fashion needs.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-sm font-medium mb-4">
              Featured Products
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-deep-900 mb-4">
              Trending Now
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our most loved pieces that are taking the Gen-Z fashion world by storm.
            </p>
          </div>

          <ProductGrid products={featuredProducts} loading={false} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-yellow-400 to-yellow-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-black mb-6">
            Ready to Start Your Reseller Journey?
          </h2>
          <p className="text-lg text-black/80 mb-8 max-w-2xl mx-auto">
            Join our B2B program and get exclusive access to wholesale pricing, bulk ordering, and special reseller benefits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="bg-white hover:bg-gray-100 text-black font-semibold px-8 py-4 text-lg">
                Become a Reseller
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-2 border-black hover:bg-black hover:text-white font-semibold px-8 py-4 text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-deep-900 font-bold text-sm">24J</span>
                </div>
                <span className="font-display text-xl font-bold">24julex</span>
              </div>
              <p className="text-gray-400 text-sm">
                Premium anti-tarnish jewelry for the modern Gen-Z fashion enthusiast.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/products" className="hover:text-yellow-400 transition-colors">All Products</Link></li>
                <li><Link href="/products?sort=new" className="hover:text-yellow-400 transition-colors">New Arrivals</Link></li>
                <li><Link href="/products?sort=best" className="hover:text-yellow-400 transition-colors">Best Sellers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-yellow-400 transition-colors">About Us</Link></li>
                <li><Link href="/register" className="hover:text-yellow-400 transition-colors">Reseller Program</Link></li>
                <li><Link href="/contact" className="hover:text-yellow-400 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">WhatsApp</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Email</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 24julex. All rights reserved. Made with ❤️ in Salem, Tamil Nadu.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}