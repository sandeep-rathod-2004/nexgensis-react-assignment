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
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-red-900">Something went wrong</h3>
      <p className="mt-1 text-sm text-red-700 max-w-sm">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          className="mt-6 border-red-300 text-red-700 hover:bg-red-100"
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
