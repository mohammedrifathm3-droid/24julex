'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, ShoppingBag, Heart, Settings, LogOut, Camera, ArrowRight, Shield, Award, Edit, Trash2, Loader2, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BackButton } from '@/components/ui/back-button'

interface Order {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  items: Array<{
    product: {
      name: string
      images: string
    }
    quantity: number
  }>
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, isAuthenticated, token } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: '' // Phone not currently in user object, would need API
      })
      fetchOrders()
    }
  }, [isAuthenticated, user, router])

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true)
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Failed to fetch orders", error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleSaveProfile = () => {
    // Placeholder for API call
    setTimeout(() => {
      setEditingProfile(false)
      // alert('Profile updated successfully!') 
    }, 1000)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user) return null

  const stats = {
    totalOrders: orders.length,
    wishlistItems: 0, // Placeholder
    totalSpent: orders.reduce((acc, order) => acc + order.total, 0),
    averageOrderValue: orders.length > 0 ? Math.round(orders.reduce((acc, order) => acc + order.total, 0) / orders.length) : 0
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      paid: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Paid' },
      failed: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Failed' },
      refunded: { icon: AlertCircle, color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
    }
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-6 h-6" />
                My Profile
              </h1>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${user.role === 'reseller'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-100 text-gray-800'
                  }`}>
                  {user.role === 'reseller' ? 'Reseller' : 'Customer'}
                </div>
                {user.reseller?.isVerified && (
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Verified
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 font-medium transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <BackButton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-24">
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'orders', label: 'Orders', icon: ShoppingBag },
                  { id: 'wishlist', label: 'Wishlist', icon: Heart },
                  { id: 'addresses', label: 'Addresses', icon: MapPin },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-3xl font-bold">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <button className="absolute bottom-0 right-0 bg-yellow-400 text-black p-2 rounded-full">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-4 mb-4">
                        <h2 className="font-display text-2xl font-bold text-gray-900">
                          {user.name}
                        </h2>
                        <button
                          onClick={() => setEditingProfile(!editingProfile)}
                          className="text-gray-700 hover:text-yellow-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <Award className="w-4 h-4" />
                          <span>Member</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">{stats.totalOrders}</div>
                    <div className="text-gray-600">Total Orders</div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">{stats.wishlistItems}</div>
                    <div className="text-gray-600">Wishlist Items</div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">₹{stats.totalSpent.toLocaleString()}</div>
                    <div className="text-gray-600">Total Spent</div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">₹{stats.averageOrderValue.toLocaleString()}</div>
                    <div className="text-gray-600">Avg Order Value</div>
                  </div>
                </div>

                {/* Business Info (for resellers) */}
                {user.role === 'reseller' && user.reseller && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <h3 className="font-display text-xl font-bold text-purple-900 mb-4">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Business Name:</span>
                        <p className="font-medium text-purple-900">{user.reseller.businessName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Business Type:</span>
                        <p className="font-medium text-purple-900">{user.reseller.businessType}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <div className="flex items-center gap-2 mt-1">
                          {user.reseller.isVerified ? (
                            <span className="flex items-center gap-1 text-green-700 font-medium">
                              <Shield className="w-4 h-4" /> Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-yellow-700 font-medium">
                              Pending Verification
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Profile Form */}
                {editingProfile && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-6">Edit Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
                        <input
                          type="email"
                          disabled
                          value={profileData.email}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Add phone number"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                      <Button
                        onClick={handleSaveProfile}
                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => setEditingProfile(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-gray-900">Order History</h2>

                {loadingOrders ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-6">Start shopping to see your orders here.</p>
                    <Link href="/products">
                      <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                        Shop Now
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="overflow-hidden border-0 shadow-md">
                        <CardHeader className="bg-gray-50 flex flex-row items-center justify-between p-4">
                          <div>
                            <CardTitle className="text-sm font-medium text-gray-500">
                              Order #{order.orderNumber}
                            </CardTitle>
                            <CardDescription>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-4">
                            {getStatusBadge(order.status)}
                            <span className="font-bold">₹{order.total.toLocaleString()}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                    {item.product.images ? (
                                      <img src={JSON.parse(item.product.images)[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                    ) : <Package className="w-6 h-6 text-gray-400" />}

                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{item.product.name}</p>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">💝</div>
                <h3 className="font-display text-2xl font-bold text-gray-900 mb-4">
                  {stats.wishlistItems} items in wishlist
                </h3>
                <p className="text-gray-600 mb-8">
                  View your full wishlist with detailed product information and quick actions.
                </p>
                <Link
                  href="/wishlist"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Heart className="w-5 h-5" />
                  View Full Wishlist
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-gray-900">Saved Addresses</h2>
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                    Add New Address
                  </Button>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No addresses saved yet.</p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Security
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900">Change Password</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}