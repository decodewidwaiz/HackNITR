import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { 
  UserPlus, 
  User, 
  Smartphone, 
  Lock, 
  MapPin, 
  ArrowRight,
  Shield,
  CheckCircle,
  Truck,
  Leaf,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

interface SignUpPageProps {
  onNavigate: (page: string) => void;
  onSuccess: () => void;
}

export default function SignUpPage({ onNavigate, onSuccess }: SignUpPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { login } = useAuth();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return 'Weak';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.CUSTOMER_SIGNUP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sign up failed');
      }

      const user = await response.json();
      login(user);
      onSuccess();
      onNavigate('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: <Truck className="h-5 w-5" />,
      text: "Direct from Farmers",
      description: "Get fresh produce straight from local farms"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      text: "Secure Payments",
      description: "100% safe and encrypted transactions"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      text: "Quality Assured",
      description: "Rigorous quality checks on all products"
    },
    {
      icon: <Leaf className="h-5 w-5" />,
      text: "Organic Options",
      description: "Wide selection of organic products"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Benefits */}
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
                <p className="text-lg text-gray-600 mt-2">Join India's Farming Revolution</p>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Start Your <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Fresh Journey</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join thousands of customers enjoying farm-fresh products directly from source. Experience the difference today.
              </p>
              
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/50">
                    <div className="bg-emerald-100 p-3 rounded-xl flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{benefit.text}</h3>
                      <p className="text-gray-600 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Join 10,000+ Happy Customers</p>
                  <p className="text-emerald-100 text-sm">Rated 4.8/5 by our community</p>
                </div>
              </div>
              <p className="text-emerald-100 italic">
                "Kisan Mitra transformed how I shop for groceries. Fresh, affordable, and directly from farmers!"
              </p>
            </div>
          </div>

          {/* Right Column - Sign Up Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              {/* Sign Up Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                <div className="p-8">
                  {/* Form Header */}
                  <div className="text-center mb-8">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <UserPlus className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Create Account</h2>
                    <p className="text-gray-600 text-lg">Join the farming revolution today</p>
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

                  {/* Sign Up Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Input */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

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
                          value={formData.mobile}
                          onChange={(e) => handleChange('mobile', e.target.value)}
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
                          value={formData.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          required
                          className="w-full pl-12 pr-12 py-4 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                          placeholder="Create a strong password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-100"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Meter */}
                      {formData.password && (
                        <div className="mt-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Password strength</span>
                            <span className={`text-sm font-semibold ${
                              passwordStrength < 50 ? 'text-red-600' : 
                              passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                              style={{ width: `${passwordStrength}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Location Input */}
                    <div>
                      <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-3">
                        Delivery Location
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleChange('location', e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 placeholder-gray-400"
                          placeholder="Enter your delivery location"
                        />
                      </div>
                    </div>

                    {/* Terms Agreement */}
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        className="mt-1 w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the{' '}
                        <button type="button" className="text-emerald-600 font-semibold hover:underline">
                          Terms of Service
                        </button>{' '}
                        and{' '}
                        <button type="button" className="text-emerald-600 font-semibold hover:underline">
                          Privacy Policy
                        </button>
                      </label>
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
                          <span className="text-lg">Creating Account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-3">
                          <span className="text-lg">Create My Account</span>
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </button>
                  </form>

                  {/* Sign In Link */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-center text-gray-600">
                      Already have an account?{' '}
                      <button
                        onClick={() => onNavigate('signin')}
                        className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-colors"
                      >
                        Sign in here
                      </button>
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50/80 px-8 py-6 border-t border-gray-200/50">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Your data is securely encrypted and protected
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}