import { useState, useEffect } from 'hono/jsx/dom';
import { Home } from './pages/Home.tsx';
import { SentimentPage } from './pages/SentimentPage.tsx';
import { EmbeddingPage } from './pages/EmbeddingPage.tsx';
import { TTSPage } from './pages/TTSPage.tsx';
import { STTPage } from './pages/STTPage.tsx';
import { FunctionCallingPage } from './pages/FunctionCallingPage.tsx';
import { TranslationPage } from './pages/TranslationPage.tsx';
import { GemmaChatPage } from './pages/GemmaChatPage.tsx';
import { ImageCaptioningPage } from './pages/ImageCaptioningPage.tsx';

export const App = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/sentiment':
        return <SentimentPage navigate={navigate} />;
      case '/embedding':
        return <EmbeddingPage navigate={navigate} />;
      case '/tts':
        return <TTSPage navigate={navigate} />;
      case '/stt':
        return <STTPage navigate={navigate} />;
      case '/function-calling':
        return <FunctionCallingPage navigate={navigate} setTheme={setTheme} />;
      case '/translation':
        return <TranslationPage navigate={navigate} />;
      case '/chat':
        return <GemmaChatPage navigate={navigate} />;
      case '/image-captioning':
        return <ImageCaptioningPage navigate={navigate} />;
      default:
        return <Home navigate={navigate} />;
    }
  };

  return (
    <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
          <header class="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" onClick={(e: any) => { e.preventDefault(); navigate('/'); }} class="flex items-center space-x-3 cursor-pointer group">
            <div class="bg-blue-600 p-2 rounded-xl shadow-inner text-white group-hover:bg-blue-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">AI Code Summit</h1>
          </a>
          <div class="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M14.5 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              )}
            </button>
            <nav class="hidden sm:block">
              <a href="#" class="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Documentation</a>
            </nav>
          </div>
        </div>
      </header>

      <main class="grow max-w-6xl w-full mx-auto px-4 py-16">
        {renderPage()}
      </main>

      <footer class="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors duration-300">
        <div class="max-w-6xl mx-auto px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
          &copy; 2026 AI Code Summit. Built with precision.
        </div>
      </footer>
    </div>
  );
};
