import {  useState, useRef , useEffect } from 'hono/jsx/dom';
import { AutoModelForCausalLM, AutoTokenizer, env } from '@huggingface/transformers';

env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = '/models/';
env.useBrowserCache = true;
// Prevent WebAssembly OOM and Memory Bloat
if (!(env as any).backends) (env as any).backends = {};
if (!(env as any).backends.onnx) (env as any).backends.onnx = {};
if (!(env as any).backends.onnx.wasm) (env as any).backends.onnx.wasm = {};
(env as any).backends.onnx.wasm.numThreads = 1;

export const FunctionCalling = ({ setTheme }: { setTheme: (theme: string) => void }) => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'system', content: 'You are a model that can toggle application themes. Respond ONLY with the function call tags.' },
    { role: 'user', content: 'Switch to dark mode' },
    { role: 'assistant', content: '<start_function_call>call:toggle_theme{theme:<escape>dark<escape>}<end_function_call><start_function_response>' },
    { role: 'user', content: 'Set the theme to light' },
    { role: 'assistant', content: '<start_function_call>call:toggle_theme{theme:<escape>light<escape>}<end_function_call><start_function_response>' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready. Try "Switch to dark mode".');

  const modelRef = useRef<any>(null);
  const tokenizerRef = useRef<any>(null);

  const tools = [
    {
      "type": "function",
      "function": {
        "name": "toggle_theme",
        "description": "Switch the application theme between light and dark mode",
        "parameters": {
          "type": "object",
          "properties": {
            "theme": { "type": "string", "enum": ["light", "dark"], "description": "The theme to switch to" }
          },
          "required": ["theme"]
        }
      }
    }
  ];

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };

    // Ensure alternating roles: if the last message was also from 'user', 
    // we should ideally merge or wait. But here we'll just ensure we don't break the pattern.
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      // This shouldn't happen with disabled button, but for safety:
      return;
    }

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const model_id = 'onnx-community/gemma-3-1b-it-ONNX';

      if (!tokenizerRef.current) {
        setStatus('Loading Tokenizer...');
        tokenizerRef.current = await AutoTokenizer.from_pretrained(model_id);
      }

      if (!modelRef.current) {
        setStatus('Loading Gemma 3 1B Model...');
        modelRef.current = await AutoModelForCausalLM.from_pretrained(model_id, {
          dtype: 'q4',
          device: 'webgpu'
        });
      }

      setStatus('Generating response...');

      const inputs = await tokenizerRef.current.apply_chat_template(newMessages, {
        tools: tools,
        tokenize: true,
        add_generation_prompt: true,
        return_dict: true,
      });

      const output = await modelRef.current.generate({
        ...inputs,
        max_new_tokens: 256,
        temperature: 0,
        do_sample: false
      });

      const inputLength = inputs.input_ids.dims ? inputs.input_ids.dims[1] : inputs.input_ids.length;
      const responseTensor = output.slice(0, [inputLength, null]);
      const tokenArray = Array.from(responseTensor.data).map(t => Number(t));

      const decoded = tokenizerRef.current.decode(tokenArray, {
        skip_special_tokens: false
      });

      // Robust Parsing Logic
      const startTag = "<start_function_call>";
      const endTag = "<end_function_call>";
      const startIndex = decoded.indexOf(startTag);
      const endIndex = decoded.indexOf(endTag);

      if (startIndex !== -1 && endIndex !== -1) {
        const callStr = decoded.substring(startIndex + startTag.length, endIndex);
        if (callStr.startsWith("call:toggle_theme")) {
          try {
            let argsStr = callStr.substring(callStr.indexOf("{"));
            argsStr = argsStr
              .replace(/<escape>(.*?)<escape>/g, '"$1"')
              .replace(/(\w+):/g, '"$1":')
              .replace(/,\s*}/g, '}');

            const args = JSON.parse(argsStr);
            if (args.theme) {
              const requestedTheme = args.theme.toLowerCase().trim() as 'light' | 'dark';
              setTheme(requestedTheme);
              setStatus(`Executing: toggle_theme(theme='${requestedTheme}')`);
            }
          } catch (e) {
            console.warn('Failed to parse function arguments:', e);
          }
        }
      }

      const assistantMessage = { role: 'assistant', content: decoded.trim() || 'Command acknowledged.' };
      setMessages(prev => [...prev, assistantMessage]);

      if (startIndex === -1) {
        setStatus('Response generated.');
      }
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
      if (modelRef.current && typeof modelRef.current.dispose === 'function') { try { modelRef.current.dispose(); } catch (e) {} }
      if (tokenizerRef.current && typeof tokenizerRef.current.dispose === 'function') { try { tokenizerRef.current.dispose(); } catch (e) {} }
    };
  }, []);

  return (
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-[600px] transition-colors duration-300">
      <div class="p-6 md:p-8 shrink-0 border-b border-slate-100 dark:border-slate-800">
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">AI Theme Controller</h3>
        <p class="text-slate-500 dark:text-slate-400">Ask the assistant to change the theme and watch it happen in real-time.</p>
        <span class="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full inline-block mt-2">
          {status}
        </span>
      </div>

      <div class="grow overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950/50">
        {messages.filter(m => m.role !== 'developer').map((msg) => (
          <div class={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div class={`max-w-[80%] rounded-2xl px-5 py-3 ${msg.role === 'user'
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
              <div class="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
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
            placeholder="Try: Turn on dark mode or Switch to light theme."
            class="grow px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all disabled:opacity-50 text-slate-800 dark:text-slate-200"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            class="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50 shadow-lg dark:shadow-none"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

