import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import genericErrorIllustration from '@/assets/images/generic_error.svg';
import Button from '@/components/Button/Button';
import { CenteredPage } from '@/components/Layout/CenteredPage';
import path from '@/routes/path';

type ErrorViewProps = {
  title?: string;
  description?: string;
  details?: ReactNode;
  onRetry?: () => void;
};

export const ErrorView: FC<ErrorViewProps> = ({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  details,
  onRetry,
}) => {
  const navigate = useNavigate();

  return (
    <CenteredPage>
      <img
        src={genericErrorIllustration}
        alt="Illustration of an unexpected error"
        className="mx-auto mb-6 h-96 w-auto"
      />
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
        Error
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-slate-600 sm:text-base">{description}</p>
      {details ? (
        <div
          className="mt-3 text-xs text-slate-500"
          data-testid="error-details"
        >
          {details}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {onRetry ? (
          <Button onClick={onRetry} variant="blue">
            Try again
          </Button>
        ) : null}
        <Button onClick={() => navigate(path.home)} variant="white">
          Go home
        </Button>
      </div>
    </CenteredPage>
  );
};
