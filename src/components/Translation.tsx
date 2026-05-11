import { useState, useRef } from 'hono/jsx/dom';
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to load models from remote and use browser cache
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.localModelPath = '/models/';
env.useBrowserCache = true;

const LANGUAGES = [
  { label: 'English', code: 'en' },
  { label: 'French', code: 'fr' },
  { label: 'Spanish', code: 'es' },
  { label: 'German', code: 'de' },
  { label: 'Italian', code: 'it' },
  { label: 'Chinese', code: 'zh' },
  { label: 'Japanese', code: 'ja' },
  { label: 'Russian', code: 'ru' },
  { label: 'Arabic', code: 'ar' },
];

export const Translation = () => {
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready to translate.');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('fr');

  const translatorRef = useRef<any>(null);

  const translate = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setTranslatedText('');
    try {
      if (!translatorRef.current) {
        setStatus('Loading M2M-100 model (optimising for GPU)...');
        // Use webgpu to avoid WASM heap limits (std::bad_alloc)
        translatorRef.current = await pipeline('translation', 'Xenova/m2m100_418M', { 
          dtype: 'q4',
          device: 'webgpu'
        });
      }

      setStatus(`Translating from ${LANGUAGES.find(l => l.code === sourceLang)?.label} to ${LANGUAGES.find(l => l.code === targetLang)?.label}...`);
      const output = await translatorRef.current(text, {
        src_lang: sourceLang,
        tgt_lang: targetLang,
      });

      setTranslatedText(output[0].translation_text);
      setStatus('Translation complete.');
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  return (
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      <div class="p-6 md:p-8">
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Multi-Language Translator</h3>
        <p class="text-slate-500 dark:text-slate-400 mb-6">Translate text between 100+ languages using the memory-efficient M2M-100 model entirely in your browser.</p>

        <div class="space-y-6">
          <div class="flex flex-col md:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div class="w-full">
              <label class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">From</label>
              <select
                value={sourceLang}
                onInput={(e: any) => setSourceLang(e.target.value)}
                class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {LANGUAGES.map(lang => (
                  <option value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={swapLanguages}
              class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors"
              title="Swap Languages"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>

            <div class="w-full">
              <label class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">To</label>
              <select
                value={targetLang}
                onInput={(e: any) => setTargetLang(e.target.value)}
                class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {LANGUAGES.map(lang => (
                  <option value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Source Text</label>
              <textarea
                value={text}
                onInput={(e: any) => setText(e.target.value)}
                placeholder="Enter text to translate..."
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all resize-none h-48 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Translation</label>
              <div class="w-full px-4 py-3 bg-blue-50/30 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl h-48 text-slate-800 dark:text-slate-200 overflow-y-auto whitespace-pre-wrap">
                {translatedText || (loading ? <span class="text-slate-400 italic">Translating...</span> : <span class="text-slate-400 italic">Translation will appear here</span>)}
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span class="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full w-full sm:w-auto text-center truncate">
              {status}
            </span>
            <button
              onClick={translate}
              disabled={loading || !text.trim()}
              class="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 dark:shadow-none"
            >
              {loading ? (
                <>
                  <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Translate'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
