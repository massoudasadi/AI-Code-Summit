import { useState, useRef } from 'hono/jsx/dom';
import { AutoModelForCausalLM, AutoTokenizer, env, TextStreamer } from '@huggingface/transformers';

// Configure transformers.js to load models from remote and use browser cache
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.localModelPath = '/models/';
env.useBrowserCache = true;

export const GemmaChat = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Gemma 3 is ready to chat!');

  const modelRef = useRef<any>(null);
  const tokenizerRef = useRef<any>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setStatus('Gemma 3 is thinking...');

    try {
      const model_id = 'onnx-community/gemma-3-270m-it-ONNX';

      if (!tokenizerRef.current) {
        setStatus('Loading Gemma 3 Tokenizer...');
        tokenizerRef.current = await AutoTokenizer.from_pretrained(model_id);
      }

      if (!modelRef.current) {
        setStatus('Loading Gemma 3 Model (270M)...');
        modelRef.current = await AutoModelForCausalLM.from_pretrained(model_id, {
          dtype: 'q4',
          device: 'webgpu'
        });
      }

      const inputs = await tokenizerRef.current.apply_chat_template(newMessages, {
        tokenize: true,
        add_generation_prompt: true,
        return_dict: true,
      });

      let fullResponse = '';
      const streamer = new TextStreamer(tokenizerRef.current, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: (text: string) => {
          fullResponse += text;
          setMessages(prev => {
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.content = fullResponse;
              return [...newMsgs];
            } else {
              return [...newMsgs, { role: 'assistant', content: fullResponse }];
            }
          });
        }
      });

      await modelRef.current.generate({
        ...inputs,
        max_new_tokens: 512,
        temperature: 0.7,
        do_sample: true,
        top_p: 0.9,
        streamer: streamer,
      });

      setStatus('Gemma 3 is ready.');
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-[600px] transition-colors duration-300">
      <div class="p-6 md:p-8 flex-shrink-0 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Gemma 3 Chat</h3>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Powered by Google's latest lightweight model.</p>
          </div>
          <div class="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
            270M IT
          </div>
        </div>
        <span class="text-xs font-medium text-slate-400 dark:text-slate-500 mt-2 block italic">
          {status}
        </span>
      </div>

      <div class="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
        {messages.length === 0 && (
          <div class="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div class="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h4 class="text-lg font-bold text-slate-800 dark:text-white">Start a conversation</h4>
              <p class="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">Ask Gemma 3 anything! It runs entirely in your browser using WebGPU/WASM.</p>
            </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <div class={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div class={`max-w-[85%] rounded-2xl px-5 py-3 ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm rounded-tl-sm'
              }`}>
              <p class="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div class="flex justify-start">
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-2">
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        )}
      </div>

      <div class="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div class="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onInput={(e: any) => setInput(e.target.value)}
            onKeyDown={(e: any) => e.key === 'Enter' && handleSend()}
            disabled={loading}
            placeholder="Ask me anything..."
            class="flex-grow px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all disabled:opacity-50 text-slate-800 dark:text-slate-200"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            class="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50 shadow-lg shadow-slate-200 dark:shadow-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
