import { ArrowRight, Zap, Leaf, Bot, Star } from 'lucide-react';
import { CropInfo } from '../types';

interface HomePageProps {
  onNavigate: (page: 'analyzer') => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const crops: CropInfo[] = [
    {
      name: 'Apple',
      image: 'https://post.healthline.com/wp-content/uploads/2020/09/Do_Apples_Affect_Diabetes_and_Blood_Sugar_Levels-732x549-thumbnail-1-732x549.jpg',
      diseaseCount: 4,
      diseases: ['Scab', 'Black Rot', 'Cedar Rust', 'Healthy'],
      icon: '🍎'
    },
    {
      name: 'Grape',
      image: 'https://i.ndtvimg.com/i/2015-09/grapes_625x350_61443376353.jpg',
      diseaseCount: 4,
      diseases: ['Black Rot', 'Esca', 'Leaf Blight', 'Healthy'],
      icon: '🍇'
    },
    {
      name: 'Tomato',
      image: 'https://images-prod.healthline.com/hlcmsresource/images/AN_images/tomatoes-1296x728-feature.jpg',
      diseaseCount: 10,
      diseases: ['Early Blight', 'Late Blight', 'Leaf Mold', 'Septoria Leaf Spot', 'Spider Mites', 'Target Spot', 'Yellow Leaf Curl Virus', 'Mosaic Virus', 'Bacterial Spot', 'Healthy'],
      icon: '🍅'
    },
    {
      name: 'Potato',
      image: 'https://m.economictimes.com/thumb/height-450,width-600,imgsize-111140,msid-72862126/potato-getty.jpg',
      diseaseCount: 3,
      diseases: ['Early Blight', 'Late Blight', 'Healthy'],
      icon: '🥔'
    },
    {
      name: 'Corn',
      image: 'https://www.mayoclinichealthsystem.org/-/media/national-files/images/hometown-health/2018/corn.jpg',
      diseaseCount: 4,
      diseases: ['Gray Leaf Spot', 'Common Rust', 'Northern Leaf Blight', 'Healthy'],
      icon: '🌽'
    },
    {
      name: 'Bell Pepper',
      image: 'https://snaped.fns.usda.gov/sites/default/files/styles/crop_ratio_7_5/public/seasonal-produce/2018-05/bell%20peppers.jpg',
      diseaseCount: 2,
      diseases: ['Bacterial Spot', 'Healthy'],
      icon: '🫑'
    },
  ];

  const stats = [
    { value: '14+', label: 'Plant Types' },
    { value: '38+', label: 'Diseases Detected' },
    { value: '95%', label: 'Accuracy Rate' },
    { value: '24/7', label: 'Available' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-green-900 leading-tight">
              🌱 AI-Powered Plant Disease Detection
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed">
              Protect your crops with our advanced AI system that detects diseases across{' '}
              <span className="font-bold text-green-700">14 different plants</span> with{' '}
              <span className="font-bold text-green-700">95%+ accuracy</span>.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium">
                <Zap className="h-5 w-5" /> Instant Detection
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                <Leaf className="h-5 w-5" /> 14+ Crops Supported
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                <Bot className="h-5 w-5" /> AI-Powered Analysis
              </span>
            </div>
            <button
              onClick={() => onNavigate('analyzer')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              Start Detection Now <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1589923186741-b7d59d6b2c4b?w=800&q=80"
              alt="Plant Disease Detection"
              className="rounded-3xl shadow-2xl"
            />
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center text-green-900 mb-4">
            Supported Plants & Crops
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-green-600 to-yellow-400 mx-auto rounded-full mb-12" />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {crops.map((crop) => (
              <div
                key={crop.name}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={crop.image}
                    alt={crop.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {crop.diseaseCount} Diseases
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-sm font-medium">{crop.diseases.join(', ')}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-green-900 mb-2">
                    {crop.icon} {crop.name}
                  </h3>
                  <p className="text-gray-600">{crop.diseaseCount} disease types detected</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-12 mb-20">
          <h2 className="text-4xl font-bold text-center text-green-900 mb-4">How It Works</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-green-600 to-yellow-400 mx-auto rounded-full mb-12" />

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📸', title: 'Upload Image', desc: 'Take a clear photo of the plant leaf and upload it to our system' },
              { icon: '🧠', title: 'AI Analysis', desc: 'Our deep learning model analyzes the image for accurate identification' },
              { icon: '📊', title: 'Get Results', desc: 'Receive detailed diagnosis and treatment recommendations' },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-2">{step.title}</h3>
                <p className="text-gray-700">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-5xl font-bold text-green-700 mb-2">{stat.value}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
