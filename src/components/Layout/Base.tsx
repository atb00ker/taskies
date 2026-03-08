import type { FC, ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

export const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen justify-center px-4 py-8">
      <main className="w-full max-w-5xl transition-all duration-300">
        {children}
      </main>
    </div>
  );
};
