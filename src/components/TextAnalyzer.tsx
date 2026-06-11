import {  useState, useRef , useEffect } from 'hono/jsx/dom';
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to load models from our local public directory
env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = '/models/';
env.useBrowserCache = true;
// Prevent WebAssembly OOM and Memory Bloat
if (!(env as any).backends) (env as any).backends = {};
if (!(env as any).backends.onnx) (env as any).backends.onnx = {};
if (!(env as any).backends.onnx.wasm) (env as any).backends.onnx.wasm = {};
(env as any).backends.onnx.wasm.numThreads = 1;

export const TextAnalyzer = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready to load model.');
  const classifierRef = useRef<any>(null);

  const analyzeText = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      if (!classifierRef.current) {
        setStatus('Loading sentiment model...');
        // Load the sentiment analysis pipeline
        classifierRef.current = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
          dtype: 'q8'
        });
      }

      setStatus('Analyzing text...');
      const output = await classifierRef.current(text);
      setResult(output[0]);
      setStatus('Analysis complete.');
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  // Clean up WebGPU / WASM memory when navigating away
  useEffect(() => {
    return () => {
      if (classifierRef.current && typeof classifierRef.current.dispose === 'function') { try { classifierRef.current.dispose(); } catch (e) {} }
    };
  }, []);

  return (
    <div class="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div class="p-6 md:p-8">
        <h3 class="text-2xl font-bold text-slate-900 mb-2">Sentiment Analyzer</h3>
        <p class="text-slate-500 mb-6">Type a sentence below to analyze its emotional tone.</p>

        <div class="space-y-4">
          <textarea
            value={text}
            onInput={(e: any) => setText(e.target.value)}
            placeholder="I love using Vite and Hono!"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none h-32 text-slate-800"
          />

          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span class="text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full w-full sm:w-auto text-center">
              {status}
            </span>
            <button
              onClick={analyzeText}
              disabled={loading || !text.trim()}
              class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                'Analyze Sentiment'
              )}
            </button>
          </div>
        </div>

        {result && (
          <div class="mt-8 transition-all duration-500">
            <div class={`p-6 rounded-xl border ${result.label === 'POSITIVE' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div class="flex items-center space-x-3 mb-2">
                <div class={`p-2 rounded-full ${result.label === 'POSITIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {result.label === 'POSITIVE' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <h4 class={`text-lg font-bold ${result.label === 'POSITIVE' ? 'text-green-800' : 'text-red-800'}`}>
                  {result.label}
                </h4>
              </div>
              <div class="flex items-center justify-between mt-4">
                <span class="text-sm font-medium text-slate-600">Confidence Score</span>
                <span class="text-sm font-bold text-slate-900">
                  {(result.score * 100).toFixed(2)}%
                </span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div
                  class={`h-2 rounded-full ${result.label === 'POSITIVE' ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${(result.score * 100).toFixed(0)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

