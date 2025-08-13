'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface TanStackProviderProps {
  children: React.ReactNode;
}

export default function TanStackProvider({ children }: TanStackProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5分間はstale扱いしない
            gcTime: 10 * 60 * 1000, // 10分間キャッシュを保持
            retry: 3, // エラー時に3回まで再試行
            refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動再取得を無効
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 開発環境でのみDevToolsを表示 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}