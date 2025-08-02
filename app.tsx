import React, { useState, useCallback } from 'react';
import { AppState } from './types';
import type { BeautyRating } from './types';
import { analyzeImage } from './services/geminiService';
import CameraCapture from './components/CameraCapture';
import { SparklesIcon, ArrowPathIcon, LoadingSpinner } from './components/Icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [ratingResult, setRatingResult] = useState<BeautyRating | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    setError(null);
    setAppState(AppState.CAPTURING);
  };

  const handleCapture = useCallback(async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setAppState(AppState.ANALYZING);
    try {
      const result = await analyzeImage(imageDataUrl);
      setRatingResult(result);
      setAppState(AppState.RESULT);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Si è verificato un errore sconosciuto.");
      }
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setRatingResult(null);
    setCapturedImage(null);
    setError(null);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.IDLE:
        return <WelcomeScreen onStart={handleStart} />;
      case AppState.CAPTURING:
        return <CameraCapture onCapture={handleCapture} onCancel={handleReset} />;
      case AppState.ANALYZING:
        return <AnalyzingScreen image={capturedImage} />;
      case AppState.RESULT:
        return <ResultScreen image={capturedImage} rating={ratingResult} onReset={handleReset} />;
      case AppState.ERROR:
        return <ErrorScreen message={error} onReset={handleReset} />;
      default:
        return <WelcomeScreen onStart={handleStart} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <main className="w-full max-w-4xl mx-auto">
        {renderContent()}
      </main>
       <footer className="absolute bottom-4 text-center text-xs text-gray-400">
        <p>Disclaimer: Questa valutazione è generata da un'IA per puro intrattenimento. La vera bellezza è soggettiva e non può essere misurata.</p>
      </footer>
    </div>
  );
};

const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="text-center p-8 bg-black/30 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10">
    <SparklesIcon className="w-20 h-20 mx-auto text-indigo-400 mb-6" />
    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Valutatore di Bellezza AI</h1>
    <p className="text-lg text-gray-300 max-w-xl mx-auto mb-8">
      Curioso di sapere cosa pensa un'intelligenza artificiale del tuo look? Usa la tua fotocamera per scattare una foto e ricevere una valutazione da 1 a 10.
    </p>
    <button
      onClick={onStart}
      className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg rounded-full shadow-lg transition-transform transform hover:scale-105"
    >
      <SparklesIcon className="w-6 h-6" />
      <span>Inizia la Valutazione</span>
    </button>
  </div>
);

const AnalyzingScreen: React.FC<{ image: string | null }> = ({ image }) => (
  <div className="flex flex-col items-center gap-8">
    <h2 className="text-3xl font-bold animate-pulse">Analizzando i tuoi lineamenti...</h2>
    <div className="relative w-full max-w-sm">
      {image && <img src={image} alt="Viso catturato" className="rounded-2xl shadow-2xl opacity-50" />}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
         <LoadingSpinner className="w-24 h-24 text-indigo-400" />
      </div>
    </div>
  </div>
);

const ResultScreen: React.FC<{ image: string | null; rating: BeautyRating | null; onReset: () => void }> = ({ image, rating, onReset }) => {
    if (!rating) return null;

    const ratingColor = rating.rating >= 8 ? 'text-green-400' : rating.rating >= 5 ? 'text-yellow-400' : 'text-red-400';

    return(
        <div className="p-6 bg-black/30 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 flex flex-col md:flex-row items-center gap-8">
            {image && <img src={image} alt="Viso valutato" className="w-full md:w-1/3 max-w-xs h-auto object-cover rounded-2xl shadow-lg" />}
            <div className="text-center md:text-left flex-1">
                <p className="text-indigo-400 font-semibold mb-2">{rating.title}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                    <p className={`text-7xl font-black ${ratingColor}`}>{rating.rating.toFixed(1)}</p>
                    <p className="text-2xl text-gray-300">/ 10</p>
                </div>
                <p className="text-lg text-gray-200 mb-8">{rating.analysis}</p>
                 <button
                    onClick={onReset}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105"
                >
                    <ArrowPathIcon className="w-5 h-5" />
                    <span>Riprova</span>
                </button>
            </div>
        </div>
    )
};

const ErrorScreen: React.FC<{ message: string | null; onReset: () => void }> = ({ message, onReset }) => (
  <div className="text-center p-8 bg-red-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-500/50">
    <h2 className="text-3xl font-bold mb-4 text-red-300">Oops! Qualcosa è andato storto.</h2>
    <p className="text-lg text-red-200 mb-8">{message || "Si è verificato un errore imprevisto."}</p>
    <button
      onClick={onReset}
      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105"
    >
      <ArrowPathIcon className="w-5 h-5" />
      <span>Riprova</span>
    </button>
  </div>
);


export default App;
