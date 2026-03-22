import type { FC, ReactNode } from 'react';

type CenteredPageProps = {
  children: ReactNode;
  innerClassName?: string;
};

export const CenteredPage: FC<CenteredPageProps> = ({
  children,
  innerClassName,
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className={`w-full max-w-md text-center ${innerClassName ?? ''}`}>
        {children}
      </div>
    </div>
  );
};
