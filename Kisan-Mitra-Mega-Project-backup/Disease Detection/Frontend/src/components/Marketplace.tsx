import { useState } from 'react';
import { ShoppingCart, Filter, Star, Package, Clock } from 'lucide-react';

export default function Marketplace() {
  const [activeFilter, setActiveFilter] = useState('all');

  const products = [
    {
      id: 1,
      name: 'Organic Neem Oil Fungicide',
      image: 'https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=400',
      category: 'supplement',
      disease: 'Apple Scab',
      rating: 4.5,
      buyLink: 'https://www.amazon.com/s?k=neem+oil'
    },
    {
      id: 2,
      name: 'All-Purpose Plant Fertilizer',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
      category: 'fertilizer',
      disease: 'General Plant Health',
      rating: 4.8,
      buyLink: 'https://www.amazon.com/s?k=plant+fertilizer'
    },
    {
      id: 3,
      name: 'Copper Fungicide Spray',
      image: 'https://images.unsplash.com/photo-1617791160588-241658c0f566?w=400',
      category: 'supplement',
      disease: 'Tomato Blight',
      rating: 4.3,
      buyLink: 'https://www.amazon.com/s?k=copper+fungicide'
    },
    {
      id: 4,
      name: 'Organic Compost Mix',
      image: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=400',
      category: 'fertilizer',
      disease: 'Soil Enhancement',
      rating: 4.7,
      buyLink: 'https://www.amazon.com/s?k=organic+compost'
    },
    {
      id: 5,
      name: 'Sulfur-Based Fungicide',
      image: 'https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=400',
      category: 'supplement',
      disease: 'Powdery Mildew',
      rating: 4.2,
      buyLink: 'https://www.amazon.com/s?k=sulfur+fungicide'
    },
    {
      id: 6,
      name: 'NPK Growth Booster',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
      category: 'fertilizer',
      disease: 'Growth Enhancement',
      rating: 4.6,
      buyLink: 'https://www.amazon.com/s?k=npk+fertilizer'
    },
  ];

  const filters = [
    { id: 'all', label: 'All Products', icon: Package },
    { id: 'fertilizer', label: 'Fertilizers', icon: Package },
    { id: 'supplement', label: 'Supplements', icon: Package },
  ];

  const filteredProducts = activeFilter === 'all'
    ? products
    : products.filter(p => p.category === activeFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <ShoppingCart className="h-12 w-12 text-green-700" />
          </div>
          <h1 className="text-5xl font-bold text-green-900 mb-4">🌱 Plant Care Marketplace</h1>
          <p className="text-xl text-gray-700 mb-6">
            Premium supplements and fertilizers for healthy plant growth and disease treatment
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Organic Products', 'Fast Delivery', 'Expert Recommended'].map((badge, idx) => (
              <span key={idx} className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="h-6 w-6 text-gray-700" />
            <h3 className="text-xl font-bold text-gray-900">Filter Products</h3>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  activeFilter === filter.id
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, idx) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 opacity-0 animate-fadeInUp"
              style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className="relative h-56 overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold text-white ${
                  product.category === 'fertilizer' ? 'bg-green-600' : 'bg-yellow-600'
                }`}>
                  {product.category === 'fertilizer' ? '❤️ Fertilizer' : '🎯 Supplement'}
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-3">For {product.disease}</p>

                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({product.rating})</span>
                </div>

                <div className="space-y-3">
                  <a
                    href={product.buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-center rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                  >
                    <ShoppingCart className="inline h-5 w-5 mr-2" />
                    Buy Now
                  </a>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <span className="text-green-600 font-semibold text-sm">Free Delivery</span>
                  <span className="text-gray-600 text-sm flex items-center gap-1">
                    <Clock className="h-4 w-4" /> 2-3 Days
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Get Plant Care Tips</h2>
          <p className="text-lg mb-6 opacity-90">
            Subscribe to our newsletter for gardening tips, exclusive offers, and product updates
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-3 rounded-full text-gray-900"
            />
            <button className="px-8 py-3 bg-white text-green-600 rounded-full font-semibold hover:shadow-lg transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
