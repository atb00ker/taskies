import { type FC, useEffect } from 'react';
import { ErrorView } from '@/components/Error/ErrorView';

const ErrorPage: FC = () => {
  useEffect(() => {
    document.title = 'Something went wrong';
  }, []);

  return <ErrorView />;
};

export default ErrorPage;
