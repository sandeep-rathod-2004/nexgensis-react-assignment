import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryDisabled?: boolean;
}

export default function ErrorState({
  message = 'Unable to load data. Please try again.',
  onRetry,
  retryDisabled,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/80 px-4 py-16 text-center shadow-soft">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 shadow-inner">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-red-900">Something went wrong</h3>
      <p className="mt-2 max-w-sm text-sm text-red-700">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          className="mt-6 rounded-xl border-red-300 text-red-700 hover:bg-red-100"
          onClick={onRetry}
          disabled={retryDisabled}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${retryDisabled ? 'animate-spin' : ''}`} />
          Retry
        </Button>
      )}
    </div>
  );
}
