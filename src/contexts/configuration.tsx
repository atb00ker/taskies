import { createContext, type ReactNode, useContext } from 'react';
import useSWR from 'swr';
import type { Configuration } from '@/core/entities/configurations';
import { getConfiguration } from '@/core/services/configuration';

const ConfigurationContext = createContext<Configuration | null>(null);

type ConfigurationProviderProps = {
  children: ReactNode;
};

export function ConfigurationProvider({
  children,
}: ConfigurationProviderProps) {
  const { data, error } = useSWR('configuration', () => getConfiguration(), {
    suspense: true,
  });

  if (error) {
    throw error;
  }

  return (
    <ConfigurationContext.Provider value={data}>
      {children}
    </ConfigurationContext.Provider>
  );
}

export function useConfiguration(): Configuration {
  const context = useContext(ConfigurationContext);

  if (context === null) {
    throw new Error(
      'useConfiguration must be used within a ConfigurationProvider',
    );
  }

  return context;
}
