import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { 
  LogIn, 
  Eye, 
  EyeOff, 
  Leaf, 
  Smartphone, 
  Lock, 
  ArrowRight,
  Shield,
  CheckCircle,
  TrendingUp,
  Users,
  Truck
} from 'lucide-react';

interface SignInPageProps {
  onNavigate: (page: string) => void;
  onSuccess: () => void;
}

export default function SignInPage({ onNavigate, onSuccess }: SignInPageProps) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.CUSTOMER_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid mobile number or password');
      }

      const user = await response.json();
      login(user);
      onSuccess();
      onNavigate('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Truck className="h-5 w-5" />,
      text: "Direct from Farmers"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      text: "Secure Payments"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      text: "Quality Assured"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Brand & Features */}
          <div className="text-center lg:text-left">
            {/* Header */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-2xl shadow-lg">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-br from-gray-900 to-emerald-900 bg-clip-text text-transparent">
                  Kisan Mitra
                </h1>
                <p className="text-lg text-gray-600 mt-2">India's Farmer Marketplace</p>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Welcome to the Future of <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Farming</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect directly with farmers, get fresh produce, and support local agriculture with transparent pricing.
              </p>
              
              <div className="space-y-4 mb-10">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-4 text-gray-700">
                    <div className="bg-emerald-100 p-2 rounded-xl">
                      {feature.icon}
                    </div>
                    <span className="font-medium text-lg">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">500+</div>
                <div className="text-sm text-gray-600">Farmers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">10K+</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">50+</div>
                <div className="text-sm text-gray-600">Cities</div>
              </div>
            </div>
          </div>

          {/* Right Column - Sign In Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              {/* Sign In Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                <div className="p-8">
                  {/* Form Header */}
                  <div className="text-center mb-8">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <LogIn className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back</h2>
                    <p className="text-gray-600 text-lg">Sign in to continue your journey</p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-xl">
                          <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-red-800 text-sm font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Sign In Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Mobile Input */}
                    <div>
                      <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-3">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Smartphone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="mobile"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                          placeholder="Enter your mobile number"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full pl-12 pr-12 py-4 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-100"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Forgot Password */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold py-4 rounded-2xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-lg">Signing In...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-3">
                          <span className="text-lg">Continue to Account</span>
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </button>
                  </form>

                  {/* Sign Up Link */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-center text-gray-600">
                      New to Kisan Mitra?{' '}
                      <button
                        onClick={() => onNavigate('signup')}
                        className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-colors"
                      >
                        Create your account
                      </button>
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50/80 px-8 py-6 border-t border-gray-200/50">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      By continuing, you agree to our{' '}
                      <button className="text-emerald-600 font-semibold hover:underline">Terms of Service</button>{' '}
                      and{' '}
                      <button className="text-emerald-600 font-semibold hover:underline">Privacy Policy</button>
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Features */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/50">
                  <Shield className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-700">Secure</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/50">
                  <TrendingUp className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-700">Reliable</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/50">
                  <Users className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-700">Trusted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}