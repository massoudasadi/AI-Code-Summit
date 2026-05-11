import { ImageCaptioning } from '../components/ImageCaptioning.tsx';

export const ImageCaptioningPage = ({ navigate }: { navigate: (path: string) => void }) => {
  return (
    <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate('/')}
        class="mb-6 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </button>
      <ImageCaptioning />
    </div>
  );
};
