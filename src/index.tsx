import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/components/Error/ErrorBoundary';
import { Layout } from '@/components/Layout/Base';
import { DefaultLoading } from '@/components/Suspense/DefaultLoading';
import { AppRouter } from '@/routes';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <ErrorBoundary>
          <Layout>
            <Suspense fallback={<DefaultLoading />}>
              <AppRouter />
            </Suspense>
          </Layout>
        </ErrorBoundary>
      </BrowserRouter>
    </React.StrictMode>,
  );
}
