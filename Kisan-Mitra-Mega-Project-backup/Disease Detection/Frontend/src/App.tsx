import { useState } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import Analyzer from './components/Analyzer';
import Results from './components/Results';
import Marketplace from './components/Marketplace';

type Page = 'home' | 'analyzer' | 'marketplace';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [analysisImage, setAnalysisImage] = useState<string | null>(null);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setAnalysisImage(null);
    window.scrollTo(0, 0);
  };

  const handleAnalysisComplete = (imageUrl: string) => {
    setAnalysisImage(imageUrl);
  };

  const handleBackToAnalyzer = () => {
    setAnalysisImage(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'analyzer' && !analysisImage && (
          <Analyzer onAnalysisComplete={handleAnalysisComplete} />
        )}
        {currentPage === 'analyzer' && analysisImage && (
          <Results imageUrl={analysisImage} onBack={handleBackToAnalyzer} />
        )}
        {currentPage === 'marketplace' && <Marketplace />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
