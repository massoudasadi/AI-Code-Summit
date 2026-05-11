import { useState, useRef } from 'hono/jsx/dom';
import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.localModelPath = '/models/';
env.useBrowserCache = true;

export const TextToSpeech = () => {
  const [text, setText] = useState('Hello world, this is a test of the text to speech model running entirely in the browser!');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready to load model.');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const synthesizerRef = useRef<any>(null);

  const generateSpeech = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setAudioUrl(null);
    try {
      if (!synthesizerRef.current) {
        setStatus('Loading English TTS model...');
        synthesizerRef.current = await pipeline('text-to-speech', 'Xenova/mms-tts-eng', { 
          device: 'webgpu'
        });
      }
      
      setStatus('Generating audio...');
      const output = await synthesizerRef.current(text);
      
      // Output is an object containing audio (Float32Array) and sampling_rate
      // We convert it to a WAV blob so the browser can play it natively
      const wavBuffer = encodeWAV(output.audio, output.sampling_rate);
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      setAudioUrl(url);
      setStatus('Audio generation complete.');
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to encode Float32Array to WAV
  const encodeWAV = (samples: Float32Array, sampleRate: number) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    
    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    
    // FMT sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat
    view.setUint16(22, 1, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * 2, true); // ByteRate
    view.setUint16(32, 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    
    // Data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    
    // Write PCM samples
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    
    return buffer;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  return (
    <div class="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div class="p-6 md:p-8">
        <h3 class="text-2xl font-bold text-slate-900 mb-2">Text to Speech</h3>
        <p class="text-slate-500 mb-6">Type some text below to generate audio using the MMS-TTS model natively in your browser.</p>
        
        <div class="space-y-4">
          <textarea
            value={text}
            onInput={(e: any) => setText(e.target.value)}
            placeholder="Enter text to synthesize..."
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none h-32 text-slate-800"
          />
          
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span class="text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full w-full sm:w-auto text-center truncate max-w-full">
              {status}
            </span>
            <button
              onClick={generateSpeech}
              disabled={loading || !text.trim()}
              class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Synthesizing...' : 'Generate Audio'}
            </button>
          </div>
        </div>

        {audioUrl && (
          <div class="mt-8 transition-all duration-500 p-6 rounded-xl border bg-green-50 border-green-200 flex flex-col items-center">
            <h4 class="font-bold text-green-900 mb-4">Generated Audio</h4>
            <audio controls src={audioUrl} class="w-full max-w-md rounded-full shadow-sm"></audio>
          </div>
        )}
      </div>
    </div>
  );
};
