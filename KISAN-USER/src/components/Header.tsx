import { Sprout, LogOut, User, ShoppingBag, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartItemsCount?: number;
}

export default function Header({ currentPage, onNavigate, cartItemsCount = 0 }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate('home');
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => onNavigate('home')}
          >
            <div className="bg-green-600 p-2 rounded-lg group-hover:bg-green-700 transition-colors">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-green-800">Kisan Mitra</span>
              <p className="text-xs text-gray-500 -mt-1">Farm Fresh Direct</p>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search for vegetables, fruits, grains..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'home' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('products')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'products' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
              }`}
            >
              Products
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => onNavigate('orders')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === 'orders' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                  }`}
                >
                  My Orders
                </button>
                <button
                  onClick={() => onNavigate('cart')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                    currentPage === 'cart' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4 inline mr-1" />
                  Cart
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* Search Button - Mobile */}
            <button className="lg:hidden p-2 text-gray-600 hover:text-green-700">
              <Search className="h-5 w-5" />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <button className="p-2 text-gray-600 hover:text-green-700 relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-green-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {user?.name}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setShowUserMenu(false);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="h-4 w-4" />
                        <span>My Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('orders');
                          setShowUserMenu(false);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>My Orders</span>
                      </button>
                      <div className="border-t my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => onNavigate('signin')}
                  className="px-4 py-2 text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors border border-green-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search for vegetables, fruits, grains..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex space-x-1 pb-4 overflow-x-auto">
          <button
            onClick={() => onNavigate('home')}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium ${
              currentPage === 'home' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('products')}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium ${
              currentPage === 'products' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Products
          </button>
          {isAuthenticated && (
            <>
              <button
                onClick={() => onNavigate('orders')}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium ${
                  currentPage === 'orders' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => onNavigate('cart')}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium relative ${
                  currentPage === 'cart' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cart
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}