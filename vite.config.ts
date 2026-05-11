import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  esbuild: {
    // @ts-expect-error jsxImportSource is supported by esbuild but not typed in Vite's ESBuildOptions
    jsxImportSource: 'hono/jsx/dom',
  },
  optimizeDeps: {
    exclude: ['@huggingface/transformers'],
  },
});
