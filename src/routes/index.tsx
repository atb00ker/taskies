import type { ComponentType } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '@/routes/home/page';
import NotFoundPage from '@/routes/not-found/page';
import '@/assets/styles/main.css';
import path from '@/routes/path';

type RouteConfig = {
  path: string;
  element: ComponentType;
};

export const routes: RouteConfig[] = [
  {
    path: path.home,
    element: Home,
  },
  {
    path: path.notFound,
    element: NotFoundPage,
  },
];

export function AppRouter() {
  return (
    <Routes>
      {routes.map(({ path: routePath, element: Element }) => (
        <Route key={routePath} path={routePath} element={<Element />} />
      ))}
    </Routes>
  );
}
