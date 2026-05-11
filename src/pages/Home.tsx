export const Home = ({ navigate }: { navigate: (path: string) => void }) => {
  return (
    <div class="space-y-12 animate-in fade-in duration-500">
      <div class="text-center">
        <h2 class="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-5xl mb-6">
          Client-Side AI with <span class="text-blue-600 dark:text-blue-400">Transformers.js</span>
        </h2>
        <p class="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Experience the power of machine learning entirely in your browser. Select a tool below to get started. No server required.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          onClick={(e: any) => { e.preventDefault(); navigate('/chat'); }}
          class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-100 dark:border-slate-800 p-8 cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div class="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Gemma 3 Chat</h3>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
            Chat with Google's latest state-of-the-art multimodal lightweight model (270M).
          </p>
        </div>

        <div
          onClick={(e: any) => { e.preventDefault(); navigate('/image-captioning'); }}
          class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-100 dark:border-slate-800 p-8 cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div class="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Image Captioning</h3>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
            Upload an image and get an AI-generated description using ViT-GPT2.
          </p>
        </div>

        <div
          onClick={(e: any) => { e.preventDefault(); navigate('/sentiment'); }}
          class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-100 dark:border-slate-800 p-8 cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div class="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Sentiment Analyzer</h3>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
            Analyze the emotional tone of your text instantly using the DistilBERT model.
          </p>
        </div>

        <div
          onClick={(e: any) => { e.preventDefault(); navigate('/embedding'); }}
          class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-100 dark:border-slate-800 p-8 cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div class="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Document RAG</h3>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
            Upload text documents and perform semantic search using EmbeddingGemma-300M.
          </p>
        </div>

        <div
          onClick={(e: any) => { e.preventDefault(); navigate('/function-calling'); }}
          class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-100 dark:border-slate-800 p-8 cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div class="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Function Calling</h3>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
            Chat with FunctionGemma-270M and see it interact with mocked real-world tools.
          </p>
        </div>

        <div
          onClick={(e: any) => { e.preventDefault(); navigate('/tts'); }}
          class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-100 dark:border-slate-800 p-8 cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div class="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5 10v4h4l5 5V5l-5 5H5z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Text to Speech</h3>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
            Generate high-quality audio from text instantly using the MMS-TTS model.
          </p>
        </div>

        <div
          onClick={(e: any) => { e.preventDefault(); navigate('/stt'); }}
          class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-100 dark:border-slate-800 p-8 cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div class="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Speech to Text</h3>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
            Record your voice and get accurate transcriptions using Whisper-Tiny.
          </p>
        </div>

        <div
          onClick={(e: any) => { e.preventDefault(); navigate('/translation'); }}
          class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-100 dark:border-slate-800 p-8 cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Translator</h3>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
            Translate between 100+ languages using the memory-efficient M2M-100 model.
          </p>
        </div>
      </div>
    </div>
  );
};
