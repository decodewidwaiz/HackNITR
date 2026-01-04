import { ShoppingCart, MapPin, Star, Heart, TrendingUp, Truck, Home } from 'lucide-react';
import { Product } from '../types';
import { useState } from 'react';
import QuantitySelector from './QuantitySelector';

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product, quantity: number, deliveryType: 'pickup' | 'home_delivery', location?: { lat: number; lng: number; address: string }) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onAddToWishlist?: (product: Product) => void;
}

export default function ProductCard({ product, onBuy, onAddToCart, onAddToWishlist }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showOptions, setShowOptions] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'home_delivery'>('pickup');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjhmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzllYTBhNiIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.(product);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // In real app, you would reverse geocode to get address
          const address = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
          setUserLocation({ lat: latitude, lng: longitude, address });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleBuyClick = () => {
    if (!showOptions) {
      setShowOptions(true);
      if (deliveryType === 'home_delivery' && !userLocation) {
        getCurrentLocation();
      }
    } else {
      onBuy(product, quantity, deliveryType, deliveryType === 'home_delivery' ? userLocation || undefined : undefined);
      setShowOptions(false);
      setQuantity(1);
    }
  };

  const handleAddToCart = () => {
    onAddToCart?.(product, quantity);
    setShowOptions(false);
    setQuantity(1);
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  const calculateTotalPrice = () => {
    const basePrice = product.price * quantity;
    if (deliveryType === 'home_delivery') {
      return basePrice + (basePrice * 0.03); // 3% delivery charge
    }
    return basePrice;
  };

  const calculateOriginalTotalPrice = () => {
    const basePrice = product.originalPrice ? product.originalPrice * quantity : product.price * quantity;
    if (deliveryType === 'home_delivery' && product.originalPrice) {
      return basePrice + (basePrice * 0.03);
    }
    return product.originalPrice ? basePrice : null;
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({rating})</span>
      </div>
    );
  };

  const getDiscountBadge = () => {
    if (product.originalPrice && product.originalPrice > product.price) {
      const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      return (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          {discount}% OFF
        </span>
      );
    }
    return null;
  };

  const getStockStatus = () => {
    if (product.quantity === 0) {
      return <span className="text-red-600 text-xs font-medium">Out of Stock</span>;
    } else if (product.quantity < 10) {
      return <span className="text-orange-600 text-xs font-medium">Only {product.quantity} left</span>;
    } else {
      return <span className="text-green-600 text-xs font-medium">In Stock</span>;
    }
  };

  const isOutOfStock = product.quantity === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-green-200 group">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-50 overflow-hidden">
        <img
          src={imageError ? placeholderImage : product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        
        {getDiscountBadge()}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          disabled={isOutOfStock}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
            isWishlisted 
              ? 'bg-red-500 text-white' 
              : 'bg-white text-gray-400 hover:bg-red-50 hover:text-red-500'
          } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Trending Badge */}
        {product.isTrending && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            Trending
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Category */}
        <div className="mb-2">
          <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-green-700 transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        {/* Rating */}
        <div className="flex items-center justify-between mb-3">
          {renderRating(product.rating || 4.2)}
          {getStockStatus()}
        </div>

        {/* Farmer Info */}
        <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 rounded-lg">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-green-700">F</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-900">{product.farmerName}</p>
            <p className="text-xs text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {product.location}
            </p>
          </div>
        </div>

        {/* Purchase Options */}
        {showOptions && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200 space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <QuantitySelector
                quantity={quantity}
                onQuantityChange={handleQuantityChange}
                max={product.quantity}
                disabled={isOutOfStock}
              />
            </div>

            {/* Delivery Options */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Delivery Option</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-3 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                    deliveryType === 'pickup'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Truck className="h-4 w-4" />
                  <span>Self Pickup</span>
                </button>
                <button
                  onClick={() => {
                    setDeliveryType('home_delivery');
                    if (!userLocation) {
                      getCurrentLocation();
                    }
                  }}
                  className={`p-3 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                    deliveryType === 'home_delivery'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Home Delivery</span>
                </button>
              </div>
            </div>

            {/* Location Display */}
            {deliveryType === 'home_delivery' && userLocation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <p className="text-xs text-blue-700 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  Delivery to: {userLocation.address}
                </p>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="bg-white rounded-lg p-3 border">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>₹{product.price * quantity}</span>
                </div>
                {deliveryType === 'home_delivery' && (
                  <div className="flex justify-between">
                    <span>Delivery Charge (3%):</span>
                    <span>₹{(product.price * quantity * 0.03).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-1 flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">₹{calculateTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-green-700">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
            )}
            <span className="text-xs text-gray-500">/{product.unit}</span>
          </div>

          <div className="flex space-x-2">
            {onAddToCart && (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add to Cart"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleBuyClick}
              disabled={isOutOfStock}
              className={`font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-1 ${
                showOptions
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <span>{showOptions ? 'Confirm Purchase' : 'Buy Now'}</span>
            </button>
          </div>
        </div>

        {/* Cancel Options */}
        {showOptions && (
          <div className="mt-3 text-center">
            <button
              onClick={() => {
                setShowOptions(false);
                setQuantity(1);
                setDeliveryType('pickup');
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}