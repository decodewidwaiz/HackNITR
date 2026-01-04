import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useNotification } from './hooks/useNotification';
import Header from './components/Header';
import Notification from './components/Notification';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import { Product } from './types';
import { API_ENDPOINTS } from './config/api';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const { notification, showNotification } = useNotification();
  const { user } = useAuth();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  // Updated to accept delivery type and location
  const handleBuyProduct = async (
    product: Product, 
    quantity: number = 1, 
    deliveryType: 'pickup' | 'home_delivery' = 'pickup',
    location?: { lat: number; lng: number; address: string }
  ) => {
    if (!user) {
      showNotification('Please sign in to purchase products', 'error');
      setCurrentPage('signin');
      return;
    }

    try {
      console.log('Creating order with delivery type:', deliveryType);
      
      // Calculate final amount with delivery charge
      let baseAmount = product.price * quantity;
      let deliveryCharge = 0;
      let finalAmount = baseAmount;

      if (deliveryType === 'home_delivery') {
        deliveryCharge = baseAmount * 0.03; // 3% delivery charge
        finalAmount = baseAmount + deliveryCharge;
      }

      const orderData = {
        productId: product._id,
        productName: product.name,
        productPrice: product.price,
        finalAmount: finalAmount,
        quantity: quantity,
        unit: product.unit,
        farmerAadhar: product.aadhaar,
        farmerName: product.farmerName,
        customerName: user.name,
        customerMobile: user.mobile,
        deliveryType: deliveryType,
        deliveryCharge: deliveryCharge,
        deliveryLocation: deliveryType === 'home_delivery' && location ? location.address : '',
        customerLocation: deliveryType === 'home_delivery' ? location : undefined,
        date: new Date().toLocaleDateString('en-IN'),
        status: 'pending',
      };

      console.log('Sending order data:', orderData);

      const response = await fetch(API_ENDPOINTS.ORDERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      const createdOrder = await response.json();
      console.log('Order created successfully:', createdOrder);

      showNotification(
        `Order placed successfully for ${quantity} ${product.unit}! Waiting for farmer confirmation.`, 
        'success'
      );
      setCurrentPage('orders');
    } catch (error) {
      console.error('Error placing order:', error);
      showNotification(
        error instanceof Error ? error.message : 'Failed to place order. Please try again.', 
        'error'
      );
    }
  };

  const handleAuthSuccess = () => {
    showNotification('Welcome to Kisan Mitra!', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <Notification {...notification} />

      {currentPage === 'home' && (
        <HomePage onNavigate={handleNavigate} onBuyProduct={handleBuyProduct} />
      )}
      {currentPage === 'products' && (
        <ProductsPage onNavigate={handleNavigate} onBuyProduct={handleBuyProduct} />
      )}
      {currentPage === 'orders' && <OrdersPage onNavigate={handleNavigate} />}
      {currentPage === 'signin' && (
        <SignInPage onNavigate={handleNavigate} onSuccess={handleAuthSuccess} />
      )}
      {currentPage === 'signup' && (
        <SignUpPage onNavigate={handleNavigate} onSuccess={handleAuthSuccess} />
      )}

      <footer className="bg-green-900 text-white text-center py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <p>&copy; 2025 Kisan Mitra - Farming Products Platform</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;