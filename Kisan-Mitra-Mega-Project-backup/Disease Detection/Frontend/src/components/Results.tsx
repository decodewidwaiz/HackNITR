import { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle, AlertTriangle, Leaf, ShoppingCart, ArrowLeft, Loader2 } from 'lucide-react';

interface ResultsProps {
  imageUrl: string;
  onBack: () => void;
}

interface AnalysisResult {
  title: string;
  description: string;
  prevention: string;
  status: 'healthy' | 'disease';
  severity?: 'low' | 'medium' | 'high';
  confidence: number;
  recommendedProduct: {
    name: string;
    image: string;
    buyLink: string;
    description: string;
  };
}

const HEALTHY_RESULT: AnalysisResult = {
  title: 'Healthy Apple Leaf',
  description: 'Great news! Your plant appears to be healthy with no signs of disease. The leaf structure, color, and overall appearance indicate proper growth conditions and good plant health. Continue your current care routine to maintain this excellent condition.',
  prevention: 'Maintain consistent watering schedule. Provide adequate sunlight exposure. Use balanced organic fertilizer. Monitor regularly for early detection. Ensure proper air circulation around plants. Keep growing area clean and debris-free.',
  status: 'healthy',
  confidence: 94.5,
  recommendedProduct: {
    name: 'Organic Growth Fertilizer',
    image: 'https://images.unsplash.com/photo-1615671524827-c6481d431a2c?w=400&auto=format&fit=crop',
    buyLink: 'https://www.amazon.com/s?k=organic+plant+fertilizer',
    description: 'All-natural fertilizer for optimal plant growth'
  }
};

const DISEASE_RESULT: AnalysisResult = {
  title: 'Apple Scab Disease Detected',
  description: 'Apple scab is caused by the fungus Venturia inaequalis. It appears as olive-green to dark brown lesions on leaves and fruits. The disease thrives in cool, wet conditions and can significantly reduce fruit quality and yield if left untreated.',
  prevention: 'Remove and destroy infected leaves immediately. Apply fungicide at bud break stage. Ensure good air circulation through proper pruning. Avoid overhead watering to reduce leaf wetness. Plant resistant apple varieties when possible. Clean up fallen leaves in autumn.',
  status: 'disease',
  severity: 'medium',
  confidence: 87.3,
  recommendedProduct: {
    name: 'Apple Scab Fungicide',
    image: 'https://images.unsplash.com/photo-1589923186741-b7d59d6b2c4a?w=400&auto=format&fit=crop',
    buyLink: 'https://www.amazon.com/s?k=apple+scab+fungicide',
    description: 'Effective treatment for apple scab disease'
  }
};

const LOADING_MESSAGES = [
  'Analyzing leaf patterns...',
  'Checking for disease symptoms...',
  'Comparing with plant database...',
  'Generating recommendations...'
];

export default function Results({ imageUrl, onBack }: ResultsProps) {
  const [typewriterText, setTypewriterText] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Simulate API call with loading states
  useEffect(() => {
    let isMounted = true;
    let messageIndex = 0;

    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      if (!isMounted) return;
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 1500);

    // Simulate analysis delay
    const analysisTimeout = setTimeout(() => {
      if (!isMounted) return;
      
      // Use a more stable random determination
      const randomValue = Math.random();
      const result = randomValue > 0.5 ? HEALTHY_RESULT : DISEASE_RESULT;
      
      setAnalysisResult(result);
      setIsLoading(false);
      clearInterval(messageInterval);
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(messageInterval);
      clearTimeout(analysisTimeout);
    };
  }, []);

  // Typewriter effect for description
  useEffect(() => {
    if (!analysisResult || isLoading) return;

    const text = analysisResult.description;
    let index = 0;
    let animationFrameId: number;

    const animate = () => {
      if (index < text.length) {
        setTypewriterText(text.slice(0, index + 1));
        index++;
        animationFrameId = requestAnimationFrame(() => {
          setTimeout(animate, 30);
        });
      } else {
        setShowContent(true);
      }
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [analysisResult, isLoading]);

  const preventionSteps = useMemo(() => {
    if (!analysisResult) return [];
    return analysisResult.prevention.split('. ').filter(step => step.trim().length > 0);
  }, [analysisResult]);

  const getStatusConfig = useCallback(() => {
    if (!analysisResult) return null;
    
    const configs = {
      healthy: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: CheckCircle,
        badge: 'bg-green-100 text-green-700',
        gradient: 'from-green-50 to-green-100'
      },
      disease: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: AlertTriangle,
        badge: 'bg-yellow-100 text-yellow-700',
        gradient: 'from-yellow-50 to-orange-50'
      }
    };

    return configs[analysisResult.status];
  }, [analysisResult]);

  const nextSteps = useMemo(() => [
    { 
      icon: '🕐', 
      title: 'Next Steps', 
      desc: 'Monitor plant progress and take photos weekly' 
    },
    { 
      icon: '📅', 
      title: 'Follow-up', 
      desc: analysisResult?.status === 'healthy' 
        ? 'Continue monitoring every 2 weeks' 
        : 'Re-analyze in 1 week to ensure treatment effectiveness' 
    },
    { 
      icon: '💬', 
      title: 'Need Help?', 
      desc: 'Consult with our plant experts for personalized advice' 
    }
  ], [analysisResult]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2 className="h-16 w-16 text-green-600 animate-spin" />
            <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping"></div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">Analyzing Your Plant</h2>
          <p className="text-gray-600 max-w-md">{loadingMessage}</p>
          <div className="mt-4 text-sm text-gray-500">
            This usually takes 2-3 seconds...
          </div>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Analysis Failed</h2>
          <p className="text-gray-600 mb-6">Unable to analyze the image. Please try again.</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Try Another Image
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig();
  if (!statusConfig) return null;

  const StatusIcon = statusConfig.icon;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${statusConfig.gradient} py-8 md:py-12 transition-all duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full ${statusConfig.bg} transform transition-transform duration-300 hover:scale-105`}>
              <StatusIcon className="h-12 w-12 md:h-16 md:w-16" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {analysisResult.title}
          </h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-3">
            <span className={`inline-block px-4 py-2 rounded-full font-semibold ${statusConfig.badge}`}>
              {analysisResult.status === 'healthy' ? 'Healthy Plant Detected' : 'Disease Detected'}
            </span>
            <span className="text-sm text-gray-600">
              Confidence: {analysisResult.confidence}%
              {analysisResult.severity && ` • Severity: ${analysisResult.severity}`}
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          {/* Left Column - Image & Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Image</h3>
              <div className="relative rounded-xl overflow-hidden shadow-md mb-6">
                <img 
                  src={imageUrl} 
                  alt="Analyzed leaf" 
                  className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&auto=format&fit=crop';
                  }}
                />
              </div>
              <button
                onClick={onBack}
                className="w-full py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Analyze Another Image
              </button>
            </div>
          </div>

          {/* Right Columns - Results & Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Diagnosis Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl ${statusConfig.bg}`}>
                  <Leaf className={`h-7 w-7 ${statusConfig.text}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {analysisResult.status === 'healthy' ? 'Plant Health Analysis' : 'Disease Diagnosis'}
                </h3>
              </div>
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed text-lg">
                  {typewriterText}
                  {typewriterText.length < analysisResult.description.length && (
                    <span className="inline-block w-1 h-5 bg-green-600 ml-1 animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Prevention/Care Steps */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="h-7 w-7 text-green-700" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {analysisResult.status === 'healthy' ? 'Care Recommendations' : 'Prevention Steps'}
                  </h3>
                </div>
                <ul className="space-y-4">
                  {preventionSteps.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-4 opacity-0 animate-fadeInUp"
                      style={{ 
                        animationDelay: `${showContent ? idx * 100 : 0}ms`, 
                        animationFillMode: 'forwards' 
                      }}
                    >
                      <span className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 leading-relaxed">{step}.</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Product */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <ShoppingCart className="h-7 w-7 text-purple-700" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {analysisResult.status === 'healthy' ? 'Recommended Product' : 'Suggested Treatment'}
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={analysisResult.recommendedProduct.image}
                      alt={analysisResult.recommendedProduct.name}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1589923186741-b7d59d6b2c4a?w=400&auto=format&fit=crop';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">
                      {analysisResult.recommendedProduct.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      {analysisResult.recommendedProduct.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {analysisResult.confidence > 90 ? 'Highly recommended' : 'Recommended'} based on analysis
                    </p>
                  </div>
                  <a
                    href={analysisResult.recommendedProduct.buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all text-center"
                  >
                    View Product Details
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Next Steps</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {nextSteps.map((item, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h4 className="font-bold text-gray-900 mb-3">{item.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}