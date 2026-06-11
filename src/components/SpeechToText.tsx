import {  useState, useRef , useEffect } from 'hono/jsx/dom';
import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = '/models/';
env.useBrowserCache = true;
// Prevent WebAssembly OOM and Memory Bloat
if (!(env as any).backends) (env as any).backends = {};
if (!(env as any).backends.onnx) (env as any).backends.onnx = {};
if (!(env as any).backends.onnx.wasm) (env as any).backends.onnx.wasm = {};
(env as any).backends.onnx.wasm.numThreads = 1;

export const SpeechToText = () => {
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Click start to record audio.');
  const [isRecording, setIsRecording] = useState(false);

  const transcriberRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = processAudio;
      mediaRecorder.start();
      setIsRecording(true);
      setStatus('Recording... Speak clearly into your microphone.');
      setTranscription('');
    } catch (error: any) {
      console.error(error);
      setStatus(`Microphone access error: ${error.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('Processing audio...');
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudio = async () => {
    setLoading(true);
    try {
      if (!transcriberRef.current) {
        setStatus('Loading Whisper-Tiny model...');
        transcriberRef.current = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
          dtype: 'q8',
          device: 'webgpu'
        });
      }

      setStatus('Transcribing audio...');
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

      // Convert Blob to Float32Array
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const audioData = audioBuffer.getChannelData(0); // Mono channel

      const output = await transcriberRef.current(audioData);
      setTranscription(output.text);
      setStatus('Transcription complete.');
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
      if (transcriberRef.current && typeof transcriberRef.current.dispose === 'function') { try { transcriberRef.current.dispose(); } catch (e) {} }
    };
  }, []);

  return (
    <div class="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div class="p-6 md:p-8">
        <h3 class="text-2xl font-bold text-slate-900 mb-2">Speech to Text</h3>
        <p class="text-slate-500 mb-6">Record your voice to generate text natively in your browser using Whisper-Tiny.</p>

        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span class="text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full w-full sm:w-auto text-center truncate max-w-full">
              {status}
            </span>
            <div class="flex gap-2 w-full sm:w-auto">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={loading}
                  class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 focus:ring-4 focus:ring-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
                  </svg>
                  Record
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all animate-pulse"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd" />
                  </svg>
                  Stop
                </button>
              )}
            </div>
          </div>

          <textarea
            value={transcription}
            readOnly
            placeholder="Transcription will appear here..."
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl transition-all resize-none h-32 text-slate-800"
          />
        </div>
      </div>
    </div>
  );
};

