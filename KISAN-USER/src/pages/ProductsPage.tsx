import { useEffect, useState } from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { 
  Filter, 
  ShoppingCart, 
  Search, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Leaf,
  Clock,
  Star
} from 'lucide-react';

interface ProductsPageProps {
  onNavigate: (page: string) => void;
  onBuyProduct: (product: Product, quantity: number) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
}

type SortOption = 'name' | 'price-low' | 'price-high' | 'rating' | 'newest';
type ViewMode = 'grid' | 'list';

export default function ProductsPage({ onNavigate, onBuyProduct, onAddToCart }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [selectedCategory, searchTerm, sortBy, priceRange, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.PRODUCTS);
      if (!response.ok) throw new Error('Failed to load products');
      const data = await response.json();
      setProducts(data);

      const uniqueCategories = Array.from(new Set(data.map((p: Product) => p.category)))
        .filter(Boolean)
        .sort();
      setCategories(uniqueCategories);

      // Set initial price range based on products
      const prices = data.map((p: Product) => p.price);
      const minPrice = Math.floor(Math.min(...prices));
      const maxPrice = Math.ceil(Math.max(...prices));
      setPriceRange([minPrice, maxPrice]);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter((p) => 
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleBuy = (product: Product, quantity: number) => {
    if (!isAuthenticated) {
      onNavigate('signin');
      return;
    }
    onBuyProduct(product, quantity);
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    if (!isAuthenticated) {
      onNavigate('signin');
      return;
    }
    onAddToCart?.(product, quantity);
  };

  const getProductStats = () => {
    const total = products.length;
    const categoriesCount = categories.length;
    const averageRating = products.reduce((sum, p) => sum + (p.rating || 0), 0) / total || 0;
    const organicCount = products.filter(p => p.isOrganic).length;

    return { total, categoriesCount, averageRating, organicCount };
  };

  const stats = getProductStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-2xl shadow-lg">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-br from-gray-900 to-green-900 bg-clip-text text-transparent">
              Farm Fresh Products
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover fresh, organic produce directly from local farmers. Quality you can trust, delivered to you.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-2xl">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Categories</p>
                <p className="text-3xl font-bold text-gray-900">{stats.categoriesCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-2xl">
                <Grid3X3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Organic Items</p>
                <p className="text-3xl font-bold text-gray-900">{stats.organicCount}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <Sparkles className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Avg Rating</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-2xl">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-7 shadow-sm border border-gray-200/50 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            {/* Search Bar */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, categories, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-3.5 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
              >
                <option value="newest">Newest First</option>
                <option value="name">Name A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filter by Category:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                }`}
              >
                All Products
                <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-sm">
                  {products.length}
                </span>
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                  }`}
                >
                  {category}
                  <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-sm">
                    {products.filter(p => p.category === category).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-700">Price Range:</span>
              </div>
              <span className="text-green-600 font-semibold">
                ₹{priceRange[0]} - ₹{priceRange[1]}
              </span>
            </div>
            <div className="px-2">
              <input
                type="range"
                min={0}
                max={10000}
                step={100}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-green"
              />
              <style>{`
                .slider-green::-webkit-slider-thumb {
                  appearance: none;
                  height: 20px;
                  width: 20px;
                  border-radius: 50%;
                  background: #16a34a;
                  cursor: pointer;
                  border: 2px solid white;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                }
                .slider-green::-moz-range-thumb {
                  height: 20px;
                  width: 20px;
                  border-radius: 50%;
                  background: #16a34a;
                  cursor: pointer;
                  border: 2px solid white;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                }
              `}</style>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
            {selectedCategory !== 'all' && (
              <span> in <span className="font-semibold text-green-600">{selectedCategory}</span></span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp className="h-4 w-4" />
            <span>Fresh from local farms</span>
          </div>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50">
            <div className="inline-block animate-spin rounded-full h-14 w-14 border-[3px] border-green-600 border-t-transparent"></div>
            <p className="mt-6 text-gray-600 text-lg">Loading fresh products...</p>
            <p className="text-gray-500 text-sm mt-2">Gathering the best from our partner farms</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onBuy={handleBuy}
                onAddToCart={handleAddToCart}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              No products found
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto leading-relaxed">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                : 'No products available at the moment. Please check back later.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setPriceRange([0, 10000]);
                }}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-2xl font-semibold hover:bg-green-50 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}