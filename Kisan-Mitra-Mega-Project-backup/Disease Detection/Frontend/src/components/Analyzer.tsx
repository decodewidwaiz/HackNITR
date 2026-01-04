import { useState, useRef } from 'react';
import { Upload, Camera, X, Loader2, Shield, Info } from 'lucide-react';

interface AnalyzerProps {
  onAnalysisComplete: (imageUrl: string) => void;
}

export default function Analyzer({ onAnalysisComplete }: AnalyzerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (error) {
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      setSelectedImage(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    onAnalysisComplete(selectedImage);
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <Camera className="h-12 w-12 text-green-700" />
          </div>
          <h1 className="text-5xl font-bold text-green-900 mb-4">AI Plant Disease Detection</h1>
          <p className="text-xl text-gray-700">Upload a leaf image and let our AI engine analyze it for potential diseases</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Why It Matters</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Early detection of plant diseases is crucial for maintaining healthy crops and preventing significant agricultural losses.
            </p>
            <ul className="space-y-3">
              {[
                'Prevents crop yield loss',
                'Reduces pesticide usage',
                'Enables timely intervention',
                'Saves resources and costs'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            {!isCameraOpen && !selectedImage && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                    <Upload className="h-12 w-12 text-green-700" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Leaf Image</h3>
                  <p className="text-gray-600">Upload a clear image of a plant leaf for AI analysis</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                  >
                    <Upload className="inline h-5 w-5 mr-2" />
                    Upload Image
                  </button>
                  <button
                    onClick={startCamera}
                    className="w-full py-4 px-6 border-2 border-green-600 text-green-600 rounded-full font-semibold hover:bg-green-50 transition-all"
                  >
                    <Camera className="inline h-5 w-5 mr-2" />
                    Use Camera
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {isCameraOpen && (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg bg-black"
                />
                <div className="flex gap-3">
                  <button
                    onClick={captureImage}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {selectedImage && !isCameraOpen && (
              <div className="space-y-4">
                <div className="relative">
                  <img src={selectedImage} alt="Selected" className="w-full rounded-lg shadow-md" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="inline h-5 w-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze with AI'
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="h-6 w-6 text-yellow-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Prevention Tips</h3>
            </div>
            <div className="space-y-4">
              {[
                { icon: '🌿', title: 'Good Sanitation', desc: 'Keep plants and tools clean' },
                { icon: '💧', title: 'Proper Watering', desc: 'Avoid overwatering leaves' },
                { icon: '🌬️', title: 'Air Circulation', desc: 'Ensure adequate spacing' },
                { icon: '☀️', title: 'Sunlight', desc: 'Provide optimal exposure' }
              ].map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-2xl">{tip.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{tip.title}</h4>
                    <p className="text-sm text-gray-600">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
