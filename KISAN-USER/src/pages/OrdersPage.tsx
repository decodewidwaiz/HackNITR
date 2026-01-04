import { useEffect, useState } from 'react';
import { Order } from '../types';
import OrderCard from '../components/OrderCard';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { 
  Package, 
  Filter, 
  Search, 
  Calendar, 
  RefreshCw, 
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface OrdersPageProps {
  onNavigate: (page: string) => void;
}

type OrderStatus = 'all' | 'pending' | 'payment_pending' | 'confirmed' | 'delivery' | 'completed' | 'rejected';
type SortOption = 'newest' | 'oldest' | 'price-high' | 'price-low';

export default function OrdersPage({ onNavigate }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days' | '90days'>('all');
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadOrders();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, statusFilter, sortBy, dateRange]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const response = await fetch(API_ENDPOINTS.CUSTOMER_ORDERS(user.mobile));
      if (!response.ok) throw new Error('Failed to load orders');
      
      const data = await response.json();
      
      // Process the data to ensure all fields are properly set
      const processedOrders = data.map((order: any) => ({
        ...order,
        quantity: order.quantity && order.quantity > 0 ? order.quantity : 1,
        finalAmount: order.finalAmount || order.productPrice || 0,
        unit: order.unit || 'item',
        deliveryType: order.deliveryType || 'pickup',
        status: order.status || 'pending',
        paymentStatus: order.paymentStatus || 'pending'
      }));
      
      setOrders(processedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      showNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handlePaymentComplete = async (orderId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ORDERS}/${orderId}/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process payment');
      }

      const result = await response.json();
      
      showNotification(
        `Payment completed successfully! ₹${result.revenue.amount} credited to farmer. Your order is now ${result.order.status}.`,
        'success'
      );
      
      // Update the specific order in the state immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { 
                ...order, 
                status: result.order.status,
                paymentStatus: 'completed'
              }
            : order
        )
      );
      
      return result;
    
    } catch (error) {
      console.error('Error processing payment:', error);
      showNotification(
        error instanceof Error ? error.message : 'Payment failed. Please try again.',
        'error'
      );
      throw error;
    }
  };

  const handleOrderUpdate = () => {
    loadOrders();
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.ORDERS}/${orderId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: 'Cancelled by customer' })
      });

      if (!response.ok) throw new Error('Failed to cancel order');

      showNotification('Order cancelled successfully', 'success');
      await loadOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      showNotification('Failed to cancel order', 'error');
    }
  };

  const handleContactFarmer = (order: Order) => {
    showNotification(`Contacting farmer: ${order.farmerName}`, 'info');
  };

  const handleTrackOrder = (order: Order) => {
    showNotification(`Tracking order: ${order.productName}`, 'info');
  };

  const handleRateOrder = (order: Order) => {
    showNotification(`Rating order: ${order.productName}`, 'info');
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      const daysAgo = new Date();
      
      switch (dateRange) {
        case '7days':
          daysAgo.setDate(now.getDate() - 7);
          break;
        case '30days':
          daysAgo.setDate(now.getDate() - 30);
          break;
        case '90days':
          daysAgo.setDate(now.getDate() - 90);
          break;
      }

      filtered = filtered.filter(order => {
        try {
          const orderDate = new Date(order.date);
          return orderDate >= daysAgo;
        } catch (error) {
          return true;
        }
      });
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'price-high':
          return (b.finalAmount || b.productPrice) - (a.finalAmount || a.productPrice);
        case 'price-low':
          return (a.finalAmount || a.productPrice) - (b.finalAmount || b.productPrice);
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  };

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const paymentPending = orders.filter(o => o.status === 'payment_pending').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const delivery = orders.filter(o => o.status === 'delivery').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const rejected = orders.filter(o => o.status === 'rejected').length;
    
    const totalAmount = orders.reduce((sum, order) => {
      const quantity = order.quantity || 1;
      const price = order.finalAmount || order.productPrice || 0;
      return sum + (price * quantity);
    }, 0);

    return { total, pending, paymentPending, confirmed, delivery, completed, rejected, totalAmount };
  };

  const stats = getOrderStats();

  // Status filter tabs with counts
  const statusTabs = [
    { value: 'all' as OrderStatus, label: 'All Orders', count: stats.total, icon: BarChart3 },
    { value: 'pending' as OrderStatus, label: 'Pending', count: stats.pending, icon: Clock },
    { value: 'payment_pending' as OrderStatus, label: 'Payment Due', count: stats.paymentPending, icon: DollarSign },
    { value: 'confirmed' as OrderStatus, label: 'Confirmed', count: stats.confirmed, icon: CheckCircle2 },
    { value: 'delivery' as OrderStatus, label: 'Delivery', count: stats.delivery, icon: Package },
    { value: 'completed' as OrderStatus, label: 'Completed', count: stats.completed, icon: CheckCircle2 },
    { value: 'rejected' as OrderStatus, label: 'Cancelled', count: stats.rejected, icon: XCircle },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Package className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-blue-900 bg-clip-text text-transparent mb-4">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-10 text-lg max-w-md mx-auto leading-relaxed">
              Please sign in to view your order history, track deliveries, and manage your purchases
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('signin')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Sign In to Continue
              </button>
              <button
                onClick={() => onNavigate('products')}
                className="border-2 border-blue-600 text-blue-600 px-10 py-4 rounded-2xl font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-2xl shadow-lg">
                <Package className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-br from-gray-900 to-blue-900 bg-clip-text text-transparent">
                My Orders
              </h1>
            </div>
            <p className="text-gray-600 text-lg ml-12">Track and manage your purchases</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-200/50">
              <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
              <span>{stats.total} total orders</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-3 px-6 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 disabled:opacity-50 transform hover:-translate-y-0.5"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="font-medium">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Order Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-7 shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Total Orders</p>
                <p className="text-4xl font-bold text-gray-900 mb-1">{stats.total}</p>
                <p className="text-blue-600 text-sm font-semibold">
                  ₹{stats.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Package className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-7 shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Active Orders</p>
                <p className="text-4xl font-bold text-orange-600 mb-1">
                  {stats.pending + stats.paymentPending + stats.confirmed + stats.delivery}
                </p>
                <p className="text-gray-500 text-xs font-medium">In progress</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-7 shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Payment Pending</p>
                <p className="text-4xl font-bold text-red-600 mb-1">{stats.paymentPending}</p>
                <p className="text-gray-500 text-xs font-medium">Awaiting payment</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-7 shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Completed</p>
                <p className="text-4xl font-bold text-green-600 mb-1">{stats.completed}</p>
                <p className="text-gray-500 text-xs font-medium">Delivered orders</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-7 shadow-sm border border-gray-200/50 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders, products, or farmers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus)}
                className="px-4 py-3.5 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivery">Delivery</option>
                <option value="completed">Completed</option>
                <option value="rejected">Cancelled</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-3.5 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>

              {/* Date Range */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-4 py-3.5 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="mt-6 overflow-x-auto">
            <div className="flex space-x-2 min-w-max">
              {statusTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                      statusFilter === tab.value
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.label}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      statusFilter === tab.value
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50">
            <div className="inline-block animate-spin rounded-full h-14 w-14 border-[3px] border-blue-600 border-t-transparent"></div>
            <p className="mt-6 text-gray-600 text-lg">Loading your orders...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your order history</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order._id} 
                order={order} 
                onCancel={handleCancelOrder}
                onPaymentComplete={handlePaymentComplete}
                onTrack={handleTrackOrder}
                onContact={handleContactFarmer}
                onRate={handleRateOrder}
                onOrderUpdate={handleOrderUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {searchTerm || statusFilter !== 'all' || dateRange !== 'all' 
                ? 'No matching orders found' 
                : 'No orders yet'
              }
            </h3>
            <p className="text-gray-600 mb-10 text-lg max-w-md mx-auto leading-relaxed">
              {searchTerm || statusFilter !== 'all' || dateRange !== 'all'
                ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                : 'Start shopping and your orders will appear here for easy tracking and management.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('products')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Browse Products
              </button>
              {(searchTerm || statusFilter !== 'all' || dateRange !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateRange('all');
                  }}
                  className="border-2 border-blue-600 text-blue-600 px-10 py-4 rounded-2xl font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}