'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { useAuthStore, useCartStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowRight,
  Truck,
  Shield,
  CreditCard,
  Smartphone,
  Banknote,
  MapPin,
  User,
  Phone,
  Mail
} from 'lucide-react'

interface OrderItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  isAntiTarnish: boolean
  isWaterproof: boolean
}

const orderItems: OrderItem[] = [
  {
    id: '1',
    name: 'Golden Heart Necklace',
    price: 699,
    image: '/api/placeholder/60/60',
    quantity: 1,
    isAntiTarnish: true,
    isWaterproof: true
  },
  {
    id: '2',
    name: 'Crystal Drop Earrings',
    price: 549,
    image: '/api/placeholder/60/60',
    quantity: 2,
    isAntiTarnish: false,
    isWaterproof: true
  }
]

export default function CheckoutPage() {
  const router = useRouter()
  // const [loading, setLoading] = useState(false) // Removed loading state
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  const { user, isAuthenticated, token } = useAuthStore()
  const { items: cartItems, clearCart, subtotal } = useCartStore()
  const { toast } = useToast()

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout')
    }
  }, [isAuthenticated, router])

  const orderItems = cartItems.map(item => ({
    id: item.product.id,
    name: item.product.name,
    price: item.product.priceB2c, // Use appropriate price logic if needed
    image: item.product.images[0] || '/placeholder-jewelry.jpg',
    quantity: item.quantity,
    isAntiTarnish: false, // You might want to add these to product model if needed
    isWaterproof: false
  }))

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 7 days
  })

  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [verifyingPhone, setVerifyingPhone] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState('razorpay')

  // Removed artificial loading delay

  // const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) // Already from store
  const shipping = 0 // Free shipping
  const total = subtotal + shipping

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(shippingInfo.email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" })
      return
    }

    // Phone Validation
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(shippingInfo.phone)) {
      toast({ title: "Invalid Phone", description: "Please enter a valid 10-digit phone number.", variant: "destructive" })
      return
    }

    if (!isEmailVerified || !isPhoneVerified) {
      toast({ title: "Verification Required", description: "Please verify your email and phone number before proceeding.", variant: "destructive" })
      return
    }

    setCurrentStep(2)
  }

  const simulateVerification = async (type: 'email' | 'phone') => {
    if (type === 'email') setVerifyingEmail(true)
    else setVerifyingPhone(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (type === 'email') {
      setIsEmailVerified(true)
      setVerifyingEmail(false)
      toast({ title: "Email Verified", description: "Your email has been successfully verified." })
    } else {
      setIsPhoneVerified(true)
      setVerifyingPhone(false)
      toast({ title: "Phone Verified", description: "Your phone number has been successfully verified." })
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        shippingAddress: shippingInfo,
        billingAddress: shippingInfo,
        paymentMethod
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to place order')
      }

      // Success
      clearCart()
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been received.",
      })
      router.push('/order-success')

    } catch (error: any) {
      console.error('Checkout error:', error)
      toast({
        title: "Order Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRazorpayPayment = () => {
    // Razorpay integration would go here
    console.log('Processing Razorpay payment...')
  }


  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-yellow-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-yellow-600 text-white' : 'bg-gray-200'
                }`}>
                1
              </div>
              <span className="font-medium">Shipping</span>
            </div>
            <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-yellow-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-yellow-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-yellow-600 text-white' : 'bg-gray-200'
                }`}>
                2
              </div>
              <span className="font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-yellow-600" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleShippingSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={shippingInfo.fullName}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => {
                            setShippingInfo({ ...shippingInfo, email: e.target.value })
                            setIsEmailVerified(false)
                          }}
                          placeholder="Enter your email"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-1 text-xs text-yellow-600 h-auto p-0"
                          onClick={() => simulateVerification('email')}
                          disabled={isEmailVerified || verifyingEmail || !shippingInfo.email}
                        >
                          {verifyingEmail ? 'Verifying...' : isEmailVerified ? '✓ Verified' : 'Verify Email'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => {
                            setShippingInfo({ ...shippingInfo, phone: e.target.value })
                            setIsPhoneVerified(false)
                          }}
                          placeholder="Enter your phone number"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-1 text-xs text-yellow-600 h-auto p-0"
                          onClick={() => simulateVerification('phone')}
                          disabled={isPhoneVerified || verifyingPhone || !shippingInfo.phone}
                        >
                          {verifyingPhone ? 'Verifying...' : isPhoneVerified ? '✓ Verified' : 'Verify Phone'}
                        </Button>
                      </div>
                      <div>
                        <Label htmlFor="pincode">PIN Code *</Label>
                        <Input
                          id="pincode"
                          value={shippingInfo.pincode}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, pincode: e.target.value })}
                          placeholder="Enter PIN code"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        placeholder="Enter your street address"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                          placeholder="Enter your city"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={shippingInfo.state}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                          placeholder="Enter your state"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryDate">Preferred Delivery Date</Label>
                      <Input
                        id="deliveryDate"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={shippingInfo.deliveryDate}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, deliveryDate: e.target.value })}
                      />
                      <p className="text-xs text-gray-500">Default delivery is 7 days from today.</p>
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold">
                      Continue to Payment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-yellow-600" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="razorpay" id="razorpay" />
                        <Label htmlFor="razorpay" className="flex items-center gap-3 cursor-pointer flex-1">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Credit/Debit Card</p>
                            <p className="text-sm text-gray-600">Pay via Razorpay secure payment</p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Smartphone className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium">UPI Payment</p>
                            <p className="text-sm text-gray-600">Pay via any UPI app</p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Banknote className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="font-medium">Cash on Delivery</p>
                            <p className="text-sm text-gray-600">Pay when you receive</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Shipping Address</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{shippingInfo.fullName}</p>
                        <p>{shippingInfo.address}</p>
                        <p>{shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pincode}</p>
                        <p>{shippingInfo.phone}</p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Complete Order'}
                      {isProcessing ? (
                        <div className="w-4 h-4 ml-2 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4 ml-2" />
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="w-full"
                    >
                      Back to Shipping
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <div className="flex gap-2 mt-1">
                        {item.isAntiTarnish && (
                          <Badge className="bg-gradient-to-r from-purple-400 to-pink-600 text-white text-xs">
                            Anti-Tarnish
                          </Badge>
                        )}
                        {item.isWaterproof && (
                          <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-xs">
                            Waterproof
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    All prices include shipping
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm">Secure Checkout</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Your payment information is encrypted and secure. All transactions are protected by industry-standard security protocols.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}