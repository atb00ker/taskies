import type { FC } from 'react';
import loadingIllustration from '@/assets/images/loading.svg';
import { CenteredPage } from '@/components/Layout/CenteredPage';
import '@/components/Suspense/loading.css';

export const DefaultLoading: FC = () => {
  return (
    <CenteredPage innerClassName="flex flex-col items-center">
      <img
        src={loadingIllustration}
        alt="Illustration of the application loading"
        className="mx-auto mb-6 h-96 w-auto"
      />
      <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
        <span className="flex items-center gap-1">
          <span>Loading</span>
          <span
            className="block h-2 w-2 rounded-full bg-blue-500 animate-dotFlash"
            style={{ animationDelay: '0s' }}
          ></span>
          <span
            className="block h-2 w-2 rounded-full bg-blue-500 animate-dotFlash"
            style={{ animationDelay: '0.2s' }}
          ></span>
          <span
            className="block h-2 w-2 rounded-full bg-blue-500 animate-dotFlash"
            style={{ animationDelay: '0.4s' }}
          ></span>
        </span>
      </div>
    </CenteredPage>
  );
};
