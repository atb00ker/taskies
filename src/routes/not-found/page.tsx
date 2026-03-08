import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import notFoundIllustration from '@/assets/images/404.svg';
import Button from '@/components/Button/Button';
import { CenteredPage } from '@/components/Layout/CenteredPage';
import path from '@/routes/path';

const NotFoundPage: FC = () => {
  useEffect(() => {
    document.title = 'Page not found';
  }, []);

  const navigate = useNavigate();

  return (
    <CenteredPage>
      <img
        src={notFoundIllustration}
        alt="Illustration of a page not found error"
        className="mx-auto mb-6 h-96 w-auto"
      />
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-slate-600 sm:text-base">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="mt-6 flex justify-center">
        <Button onClick={() => navigate(path.home)} variant="blue">
          Back to tasks
        </Button>
      </div>
    </CenteredPage>
  );
};

export default NotFoundPage;
