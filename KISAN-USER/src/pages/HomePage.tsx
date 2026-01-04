import { useEffect, useState, useCallback } from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Pause,
  Sparkles,
  Shield,
  Truck,
  Leaf,
  Star,
  Users,
  MapPin,
  CheckCircle,
  TrendingUp,
  Clock,
  ShoppingBag
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onBuyProduct: (product: Product, quantity: number) => void;
}

// Constants
const FEATURED_PRODUCTS_COUNT = 6;
const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// Agricultural Images for Carousel
const CAROUSEL_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80',
    title: 'Fresh Farm Produce',
    description: 'Direct from farms to your doorstep with guaranteed freshness'
  },
  {
    url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80',
    title: 'Organic Farming',
    description: '100% natural and chemical-free products for healthy living'
  },
  {
    url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80',
    title: 'Support Local Farmers',
    description: 'Empowering farming communities across India with fair trade'
  },
  {
    url: 'https://static.investindia.gov.in/s3fs-public/2019-02/Blog%20Image.jpg',
    title: 'Seasonal Harvest',
    description: 'Fresh seasonal fruits and vegetables at their peak flavor'
  }
];

// Features data with icons
const FEATURES = [
  {
    icon: <Truck className="h-8 w-8" />,
    title: 'Direct from Farmers',
    description: 'Zero middlemen, maximum benefits for farmers and consumers'
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: 'Fair Prices',
    description: 'Competitive pricing with fair compensation for farmers'
  },
  {
    icon: <Leaf className="h-8 w-8" />,
    title: 'Organic & Fresh',
    description: 'Harvested at peak season, delivered with care'
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: 'Fast Delivery',
    description: 'Quick delivery network maintaining product freshness'
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'Quality Assured',
    description: 'Rigorous quality checks and certifications'
  },
  {
    icon: <CheckCircle className="h-8 w-8" />,
    title: 'Secure Payment',
    description: '100% secure and encrypted payment processing'
  }
];

const STATS = [
  { number: '500+', label: 'Happy Farmers', icon: <Users className="h-6 w-6" /> },
  { number: '10,000+', label: 'Products Sold', icon: <ShoppingBag className="h-6 w-6" /> },
  { number: '50+', label: 'Cities Served', icon: <MapPin className="h-6 w-6" /> },
  { number: '98%', label: 'Customer Satisfaction', icon: <Star className="h-6 w-6" /> }
];

const FARMER_TESTIMONIALS = [
  {
    name: 'Rajesh Kumar',
    role: 'Organic Farmer',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    quote: 'Kisan Mitra helped me reach customers directly and get better prices for my produce. My income has increased by 40% since joining.',
    location: 'Punjab',
    rating: 5
  },
  {
    name: 'Priya Sharma',
    role: 'Fruit Grower',
    image: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    quote: 'My organic fruits now reach customers across India. This platform changed my life and helped me expand my business nationwide.',
    location: 'Maharashtra',
    rating: 5
  }
];

const SEASONAL_PRODUCTS = [
  { name: 'Mangoes', season: 'Summer', icon: '🥭', color: 'from-yellow-400 to-orange-400' },
  { name: 'Apples', season: 'Winter', icon: '🍎', color: 'from-red-400 to-pink-400' },
  { name: 'Tomatoes', season: 'All Year', icon: '🍅', color: 'from-red-500 to-red-600' },
  { name: 'Potatoes', season: 'All Year', icon: '🥔', color: 'from-amber-400 to-amber-500' },
  { name: 'Wheat', season: 'Rabi', icon: '🌾', color: 'from-amber-300 to-amber-400' },
  { name: 'Rice', season: 'Kharif', icon: '🍚', color: 'from-white to-gray-100' }
];

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Farmers List Products',
    description: 'Verified farmers upload fresh produce with complete details and transparent pricing',
    icon: <Leaf className="h-8 w-8" />
  },
  {
    step: '02',
    title: 'Customers Browse & Order',
    description: 'Easy discovery and seamless ordering process with real-time availability',
    icon: <ShoppingBag className="h-8 w-8" />
  },
  {
    step: '03',
    title: 'Direct Delivery',
    description: 'Fast logistics network ensuring fresh delivery to your doorstep',
    icon: <Truck className="h-8 w-8" />
  }
];

export default function HomePage({ onNavigate, onBuyProduct }: HomePageProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingState, setLoadingState] = useState<typeof LOADING_STATES[keyof typeof LOADING_STATES]>(LOADING_STATES.IDLE);
  const [error, setError] = useState<string>('');
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isCarouselPlaying, setIsCarouselPlaying] = useState(true);
  const { isAuthenticated, user } = useAuth();

  // Auto-rotate carousel
  useEffect(() => {
    if (!isCarouselPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentCarouselIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isCarouselPlaying]);

  const loadFeaturedProducts = useCallback(async () => {
    try {
      setLoadingState(LOADING_STATES.LOADING);
      setError('');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(API_ENDPOINTS.PRODUCTS, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to load products: ${response.status} ${response.statusText}`);
      }

      const products: Product[] = await response.json();
      
      const featured = products
        .filter(product => product.isActive !== false)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, FEATURED_PRODUCTS_COUNT);
      
      setFeaturedProducts(featured);
      setLoadingState(LOADING_STATES.SUCCESS);
    } catch (error) {
      const errorMessage = error.name === 'AbortError' 
        ? 'Request timed out. Please check your connection.'
        : error instanceof Error 
          ? error.message
          : 'Failed to load featured products';

      setError(errorMessage);
      setLoadingState(LOADING_STATES.ERROR);
      console.error('Error loading featured products:', error);
    }
  }, []);

  useEffect(() => {
    loadFeaturedProducts();
  }, [loadFeaturedProducts]);

  const handleBuy = useCallback((product: Product, quantity: number) => {
    if (!isAuthenticated) {
      onNavigate('signin');
      return;
    }
    onBuyProduct(product, quantity);
  }, [isAuthenticated, onNavigate, onBuyProduct]);

  const handleRetry = () => {
    loadFeaturedProducts();
  };

  const handleViewAllProducts = () => {
    onNavigate('products');
  };

  const handleBecomeFarmer = () => {
    onNavigate('signup');
  };

  const nextCarousel = () => {
    setCurrentCarouselIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  };

  const prevCarousel = () => {
    setCurrentCarouselIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  };

  const goToCarousel = (index: number) => {
    setCurrentCarouselIndex(index);
  };

  const toggleCarousel = () => {
    setIsCarouselPlaying(!isCarouselPlaying);
  };

  const renderLoadingState = () => (
    <div className="text-center py-16" role="status" aria-live="polite">
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="h-6 w-6 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
      <p className="text-gray-600 text-lg">Loading fresh products...</p>
      <p className="text-gray-500 text-sm mt-2">Harvesting the best for you</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-red-100 max-w-2xl mx-auto" role="alert">
      <div className="bg-gradient-to-br from-red-100 to-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <div className="bg-red-500 p-3 rounded-2xl">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Products</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
      <button
        onClick={handleRetry}
        className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        Try Again
      </button>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-gray-100 to-gray-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <ShoppingBag className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">No Featured Products</h3>
      <p className="text-gray-600 mb-2">Fresh products are coming soon!</p>
      <p className="text-gray-500 text-sm">Our farmers are preparing the next harvest</p>
    </div>
  );

  const renderProductsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list" aria-label="Featured products">
      {featuredProducts.map((product, index) => (
        <div 
          key={product._id}
          className="transform hover:-translate-y-2 transition-all duration-500"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <ProductCard 
            product={product} 
            onBuy={handleBuy}
            aria-label={`Product: ${product.name}`}
          />
        </div>
      ))}
    </div>
  );

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Hero Section with Enhanced Carousel */}
      <section className="relative h-screen overflow-hidden">
        {/* Carousel */}
        <div className="relative h-full">
          {CAROUSEL_IMAGES.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentCarouselIndex 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-105'
              }`}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
                style={{ backgroundImage: `url('${image.url}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          ))}
          
          {/* Carousel Content */}
          <div className="relative h-full flex items-center justify-center text-center text-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span className="text-sm font-medium">India's Largest Farmer Marketplace</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-br from-white to-emerald-100 bg-clip-text text-transparent leading-tight">
                  Kisan Mitra
                </h1>
                <p className="text-2xl md:text-3xl mb-8 max-w-4xl mx-auto font-light leading-relaxed">
                  {CAROUSEL_IMAGES[currentCarouselIndex].description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={handleViewAllProducts}
                    className="group bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center gap-3"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Shop Fresh Products
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={handleBecomeFarmer}
                    className="group border-2 border-white text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white hover:text-emerald-700 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm flex items-center gap-3"
                  >
                    <Leaf className="h-5 w-5" />
                    Become a Seller
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Carousel Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6">
            <button
              onClick={prevCarousel}
              className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-2xl transition-all duration-300 backdrop-blur-sm hover:scale-110"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            
            <button
              onClick={toggleCarousel}
              className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-2xl transition-all duration-300 backdrop-blur-sm hover:scale-110"
            >
              {isCarouselPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>

            <div className="flex space-x-3">
              {CAROUSEL_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToCarousel(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentCarouselIndex 
                      ? 'bg-white scale-125 shadow-lg' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextCarousel}
              className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-2xl transition-all duration-300 backdrop-blur-sm hover:scale-110"
            >
              <ArrowRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 bg-gradient-to-br from-white to-emerald-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold bg-gradient-to-br from-gray-900 to-emerald-900 bg-clip-text text-transparent mb-4">
              Trusted by Farmers & Customers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands who have transformed their farming and shopping experience
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div 
                key={index} 
                className="text-center group p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-4xl font-black bg-gradient-to-br from-gray-900 to-emerald-900 bg-clip-text text-transparent mb-3">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-semibold text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="h-4 w-4" />
              Why Choose Kisan Mitra?
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-br from-gray-900 to-emerald-900 bg-clip-text text-transparent mb-6">
              Revolutionizing Agriculture
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're building the future of farming with technology that connects farmers directly with consumers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <div 
                key={index} 
                className="group p-8 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100"
              >
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Seasonal Products */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-amber-50/30 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <TrendingUp className="h-4 w-4" />
              Seasonal Favorites
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-br from-gray-900 to-amber-900 bg-clip-text text-transparent mb-4">
              Fresh Seasonal Specials
            </h2>
            <p className="text-xl text-gray-600">Enjoy the best of each season with our curated selection</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {SEASONAL_PRODUCTS.map((product, index) => (
              <div 
                key={index} 
                className="group text-center p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50"
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${product.color} flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {product.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{product.name}</h3>
                <p className="text-sm font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  {product.season}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Featured Products Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-20">
            <div className="mb-8 lg:mb-0">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Star className="h-4 w-4" />
                Featured Products
              </div>
              <h2 className="text-5xl font-bold bg-gradient-to-br from-gray-900 to-emerald-900 bg-clip-text text-transparent mb-4">
                Handpicked Freshness
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl">Curated selection of premium products from our trusted partner farms</p>
            </div>
            {featuredProducts.length > 0 && (
              <button
                onClick={handleViewAllProducts}
                className="group bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3"
              >
                Explore All Products
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {loadingState === LOADING_STATES.LOADING && renderLoadingState()}
          {loadingState === LOADING_STATES.ERROR && renderErrorState()}
          {loadingState === LOADING_STATES.SUCCESS && (
            <>
              {featuredProducts.length > 0 ? renderProductsGrid() : renderEmptyState()}
            </>
          )}
        </div>
      </section>

      {/* Enhanced Farmer Testimonials */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-emerald-50/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-slate-300 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.8))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Users className="h-4 w-4" />
              Farmer Stories
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-br from-gray-900 to-emerald-900 bg-clip-text text-transparent mb-6">
              Voices from Our Fields
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Real success stories from our growing farming community</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {FARMER_TESTIMONIALS.map((testimonial, index) => (
              <div 
                key={index} 
                className="group p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="flex items-start space-x-6 mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-2xl object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 text-xl">{testimonial.name}</h4>
                      {renderStarRating(testimonial.rating)}
                    </div>
                    <p className="text-emerald-700 font-semibold">{testimonial.role}</p>
                    <p className="text-gray-500 text-sm">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed italic border-l-4 border-emerald-500 pl-4">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-emerald-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="h-4 w-4" />
              Simple Process
            </div>
            <h2 className="text-5xl font-bold mb-6">How Kisan Mitra Works</h2>
            <p className="text-xl text-emerald-200 max-w-3xl mx-auto">Three simple steps to get fresh farm products delivered to you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROCESS_STEPS.map((step, index) => (
              <div 
                key={index} 
                className="group text-center p-8 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-500 transform hover:-translate-y-3"
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    {step.step}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white border border-white/20">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-emerald-200 text-lg leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-400/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-white/20">
            <Sparkles className="h-4 w-4" />
            Join the Revolution
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-8">
            Ready to Experience <span className="bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text text-transparent">Freshness?</span>
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-emerald-100 leading-relaxed">
            Join thousands of customers enjoying fresh farm products directly from source. Taste the difference today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleViewAllProducts}
              className="group bg-white text-emerald-700 px-12 py-6 rounded-2xl font-black text-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center gap-4"
            >
              <ShoppingBag className="h-6 w-6" />
              Start Shopping Now
              <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </button>
            <button
              onClick={handleBecomeFarmer}
              className="group border-2 border-white text-white px-12 py-6 rounded-2xl font-black text-xl hover:bg-white hover:text-emerald-700 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm flex items-center gap-4"
            >
              <Leaf className="h-6 w-6" />
              Join as Farmer
            </button>
          </div>
          <p className="mt-12 text-emerald-200 text-lg">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('signin')}
              className="text-white font-black underline hover:no-underline text-xl hover:text-amber-300 transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}