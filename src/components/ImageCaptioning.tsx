import {  useState, useRef , useEffect } from 'hono/jsx/dom';
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = '/models/';
env.useBrowserCache = true;
// Prevent WebAssembly OOM and Memory Bloat
if (!(env as any).backends) (env as any).backends = {};
if (!(env as any).backends.onnx) (env as any).backends.onnx = {};
if (!(env as any).backends.onnx.wasm) (env as any).backends.onnx.wasm = {};
(env as any).backends.onnx.wasm.numThreads = 1;

export const ImageCaptioning = () => {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready to describe an image.');
  
  const captionerRef = useRef<any>(null);

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setCaption('');
        setStatus('Image loaded. Click "Generate Caption" to analyze.');
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCaption = async () => {
    if (!image) return;

    setLoading(true);
    setCaption('');
    try {
      if (!captionerRef.current) {
        setStatus('Loading ViT-GPT2 model...');
        captionerRef.current = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning', { 
          dtype: 'q8',
          device: 'webgpu' 
        });
      }
      
      setStatus('Analyzing image and generating caption...');
      const output = await captionerRef.current(image);
      setCaption(output[0].generated_text);
      setStatus('Caption generated successfully.');
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
      if (captionerRef.current && typeof captionerRef.current.dispose === 'function') { try { captionerRef.current.dispose(); } catch (e) {} }
    };
  }, []);

  return (
    <div class="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div class="p-6 md:p-8">
        <h3 class="text-2xl font-bold text-slate-900 mb-2">Image Captioning</h3>
        <p class="text-slate-500 mb-6">Upload an image and let AI describe it using the ViT-GPT2 vision-language model.</p>
        
        <div class="space-y-6">
          <div class="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50 hover:bg-slate-100 transition-colors group">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              id="image-upload"
              class="hidden"
            />
            <label 
              for="image-upload" 
              class="flex flex-col items-center cursor-pointer space-y-3"
            >
              <div class="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="text-sm font-semibold text-slate-600">Click to upload image</span>
              <span class="text-xs text-slate-400">PNG, JPG or WEBP (Max 5MB)</span>
            </label>
          </div>

          {image && (
            <div class="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div class="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm max-h-96 flex justify-center bg-black">
                <img src={image} alt="Preview" class="max-h-96 object-contain" />
              </div>
              
              <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <span class="text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full w-full sm:w-auto text-center truncate">
                  {status}
                </span>
                <button
                  onClick={generateCaption}
                  disabled={loading}
                  class="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
                >
                  {loading ? (
                    <>
                      <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    'Generate Caption'
                  )}
                </button>
              </div>

              {caption && (
                <div class="p-6 bg-blue-50 border border-blue-100 rounded-xl animate-in slide-in-from-top-2">
                  <h4 class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Generated Caption</h4>
                  <p class="text-lg text-slate-800 font-medium leading-relaxed italic">
                    "{caption}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

