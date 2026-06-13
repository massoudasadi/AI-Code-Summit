import {  useState, useRef , useEffect } from 'hono/jsx/dom';
import { AutoModel, AutoTokenizer, env } from '@huggingface/transformers';

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

const cosineSimilarity = (a: number[], b: number[]) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const TextEmbedding = () => {
  // Document state
  const [docText, setDocText] = useState('Armenia is a landlocked country in the South Caucasus region of Eurasia.\n\nIt is bordered by Turkey to the west, Georgia to the north, Azerbaijan to the east, and Iran to the south.\n\nThe capital and largest city is Yerevan, which is one of the world\'s oldest continuously inhabited cities.\n\nArmenia has a rich cultural heritage and was the first nation to adopt Christianity as its state religion in 301 AD.');
  const [chunks, setChunks] = useState<{ text: string; embedding: number[] }[]>([]);
  const [docLoading, setDocLoading] = useState(false);
  const [docStatus, setDocStatus] = useState('');

  // Query state
  const [query, setQuery] = useState('What is the capital of Armenia?');
  const [searchResults, setSearchResults] = useState<{ text: string; score: number }[]>([]);
  const [queryLoading, setQueryLoading] = useState(false);

  const modelRef = useRef<any>(null);
  const tokenizerRef = useRef<any>(null);

  const initModel = async () => {
    if (!tokenizerRef.current) {
      setDocStatus('Loading Tokenizer...');
      tokenizerRef.current = await AutoTokenizer.from_pretrained('onnx-community/embeddinggemma-300m-ONNX');
    }
    if (!modelRef.current) {
      setDocStatus('Loading EmbeddingGemma-300M Model...');
      modelRef.current = await AutoModel.from_pretrained('onnx-community/embeddinggemma-300m-ONNX', {
        dtype: 'q4',
        device: 'webgpu'
      });
    }
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setDocText(e.target?.result as string);
      reader.readAsText(file);
    }
  };

  const processDocument = async () => {
    if (!docText.trim()) return;
    setDocLoading(true);
    setChunks([]);
    setSearchResults([]);

    try {
      await initModel();

      // Simple chunking by paragraph
      const textChunks = docText.split(/\n\n+/).map(c => c.trim()).filter(c => c.length > 20);

      const newChunks: { text: string; embedding: number[] }[] = [];

      for (let i = 0; i < textChunks.length; i++) {
        setDocStatus(`Embedding chunk ${i + 1} of ${textChunks.length}...`);
        const prompt = `title: none | text: ${textChunks[i]}`;
        const inputs = await tokenizerRef.current(prompt);
        const output = await modelRef.current(inputs);

        // Gemma 3 sentence embeddings are usually in sentence_embedding or last_hidden_state
        const embedding = output.sentence_embedding || output.last_hidden_state;
        newChunks.push({
          text: textChunks[i],
          embedding: Array.from(embedding.data) as number[]
        });
      }

      setChunks(newChunks);
      setDocStatus(`Successfully vectorized ${newChunks.length} chunks! Ready for search.`);
    } catch (error: any) {
      console.error(error);
      setDocStatus(`Error: ${error.message}`);
    } finally {
      setDocLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim() || chunks.length === 0) return;
    setQueryLoading(true);

    try {
      await initModel();
      const prompt = `task: search result | query: ${query}`;
      const inputs = await tokenizerRef.current(prompt);
      const output = await modelRef.current(inputs);
      const embedding = output.sentence_embedding || output.last_hidden_state;
      const queryEmbedding = Array.from(embedding.data) as number[];

      // Calculate similarities
      const results = chunks.map(chunk => ({
        text: chunk.text,
        score: cosineSimilarity(queryEmbedding, chunk.embedding)
      }));

      // Sort descending by score and pick top 3
      results.sort((a, b) => b.score - a.score);
      setSearchResults(results.slice(0, 3));

    } catch (error: any) {
      console.error(error);
    } finally {
      setQueryLoading(false);
    }
  };
  // Clean up WebGPU / WASM memory when navigating away
  useEffect(() => {
    return () => {
      if (modelRef.current && typeof modelRef.current.dispose === 'function') { try { modelRef.current.dispose(); } catch (e) {} }
      if (tokenizerRef.current && typeof tokenizerRef.current.dispose === 'function') { try { tokenizerRef.current.dispose(); } catch (e) {} }
    };
  }, []);

  return (
    <div class="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div class="p-6 md:p-8">
        <h3 class="text-2xl font-bold text-slate-900 mb-2">Semantic Search (RAG)</h3>
        <p class="text-slate-500 mb-6">Upload a document or paste text, vectorise it, and search through the context.</p>

        <div class="space-y-8">
          {/* Document Section */}
          <div class="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-bold text-slate-800">1. Source Document</h4>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                class="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <textarea
              value={docText}
              onInput={(e: any) => setDocText(e.target.value)}
              placeholder="Paste a long passage here or upload a .txt file..."
              class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all resize-y h-48 text-slate-800 mb-4"
            />

            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span class="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full w-full sm:w-auto text-center truncate max-w-full">
                {docStatus || 'Paste text and click Vectorise'}
              </span>
              <button
                onClick={processDocument}
                disabled={docLoading || !docText.trim()}
                class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {docLoading ? 'Processing...' : 'Vectorise Document'}
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div class={`p-6 rounded-xl border transition-all ${chunks.length > 0 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200 opacity-50 pointer-events-none'}`}>
            <h4 class="font-bold text-slate-800 mb-4">2. Semantic Search</h4>
            <div class="flex gap-4">
              <input
                type="text"
                value={query}
                onInput={(e: any) => setQuery(e.target.value)}
                placeholder="Ask a question or search for a topic..."
                class="grow px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
                onKeyDown={(e: any) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={queryLoading || !query.trim() || chunks.length === 0}
                class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {queryLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {searchResults.length > 0 && (
            <div class="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <h4 class="font-bold text-slate-800">Top Search Results</h4>
              {searchResults.map((result, idx) => (
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Result {idx + 1}</span>
                    <span class="text-xs font-mono bg-green-100 text-green-800 px-2 py-1 rounded">
                      Similarity: {(result.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p class="text-slate-700 text-sm leading-relaxed">{result.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

