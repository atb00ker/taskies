import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/components/Error/ErrorBoundary';
import { Layout } from '@/components/Layout/Base';
import { DefaultLoading } from '@/components/Suspense/DefaultLoading';
import { ConfigurationProvider } from '@/contexts/configuration';
import { AppRouter } from '@/routes';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<DefaultLoading />}>
            <ConfigurationProvider>
              <Layout>
                <AppRouter />
              </Layout>
            </ConfigurationProvider>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </React.StrictMode>,
  );
}
