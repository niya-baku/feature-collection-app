# TanStack Query実装手順

## 概要
このドキュメントは、Next.jsアプリケーションにTanStack Query（旧React Query）を導入する手順と学習内容をまとめたものです。

## 参考記事
https://zenn.dev/taisei_13046/books/133e9995b6aadf/viewer/573083

## TanStack Queryとは
- React用の強力なデータ同期ライブラリ
- サーバーステートの管理に特化
- キャッシュ、バックグラウンド更新、重複削除、楽観的更新などの機能を提供
- SWRの後継として注目されるライブラリ

## SWRとの主な違い

### 基本的な使い方の違い
```typescript
// SWR
import useSWR from 'swr';
const { data, error, isLoading, mutate } = useSWR(key, fetcher);

// TanStack Query
import { useQuery } from '@tanstack/react-query';
const { data, error, isLoading, refetch } = useQuery({ queryKey, queryFn });
```

### 設定オプションの違い
| 項目 | SWR | TanStack Query |
|------|-----|----------------|
| キャッシュ時間 | `dedupingInterval` | `gcTime` (旧cacheTime) |
| 新鮮さ判定 | `refreshInterval` | `staleTime` |
| 再取得 | `mutate()` | `refetch()` |
| エラー | `error` | `error.message` |

## 実装手順

### Step 1: TanStack Queryの導入

#### 1. パッケージのインストール
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

#### 2. QueryClientProviderの設定

**[注意]**

企業で採用する場合、app/layout.tsxに`QueryClientProvider`をインポートして使用するのが推奨されますが、今回は学習が目的である点とSWRも別ページで実装されているため、各ページで動作するような構成にした

そのため、tanstack/直下に`layout.tsx`を新しく作成してtanstackページのみで発火するような形にした

`src/components/TanStackProvider.tsx`を作成：

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function TanStackProvider({ children }: { children: React.ReactNode }) {
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
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

#### 3. tanstack/layout.tsxでプロバイダーを設定
```typescript
import TanStackProvider from '@/components/TanStackProvider';

export default function TanStackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TanStackProvider>
      {children}
    </TanStackProvider>
  );
}
```

### Step 2: データ取得hooksの実装

#### `src/app/tanstack/hooks/fetch.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/types/api';
import productsData from '../mock/products.json';

// JSONファイルからデータを取得するhook
export const useProductsFromJSON = () => {
  return useQuery({
    queryKey: ['products', 'json'],
    queryFn: async (): Promise<Product[]> => {
      // ローディング遅延をシミュレート
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return productsData as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5分間はstale扱いしない
    gcTime: 10 * 60 * 1000, // 10分間キャッシュを保持（旧cacheTime）
  });
};

// API経由でデータを取得するhook（将来用）
export const useProducts = () => {
  return useQuery({
    queryKey: ['products', 'api'],
    queryFn: async (): Promise<Product[]> => {
      const response = await fetch('/api/v2/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      
      if (data.status === 'success') {
        return data.data.products;
      }
      throw new Error(data.message);
    },
    staleTime: 5 * 60 * 1000, // 5分間はstale扱いしない
    gcTime: 10 * 60 * 1000, // 10分間キャッシュを保持
    retry: 3, // エラー時に3回まで再試行
  });
};
```

### Step 3: ページコンポーネントでの使用

#### SWRからTanStack Queryへの移行例
```typescript
// Before (SWR)
const { data: products, error, isLoading, mutate } = useSWR(key, fetcher);

// After (TanStack Query)
const { data: products, error, isLoading, refetch } = useProductsFromJSON();
```

#### エラーハンドリングの変更
```typescript
// SWR
{error && <p>{error}</p>}

// TanStack Query
{error && <p>{error.message}</p>}
```

## TanStack Queryの特徴と利点

### 1. より詳細なキャッシュ制御
- **staleTime**: データが新鮮とみなされる時間
- **gcTime**: キャッシュが削除されるまでの時間
- **refetchInterval**: 定期的な再取得間隔

### 2. 豊富なDevTools
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// 開発環境でクエリの状態を可視化
{process.env.NODE_ENV === 'development' && (
  <ReactQueryDevtools initialIsOpen={false} />
)}
```

### 3. 楽観的更新（Optimistic Updates）
```typescript
const mutation = useMutation({
  mutationFn: updateProduct,
  onMutate: async (newProduct) => {
    // 楽観的更新の実装
    await queryClient.cancelQueries(['products']);
    const previousProducts = queryClient.getQueryData(['products']);
    queryClient.setQueryData(['products'], old => [...old, newProduct]);
    return { previousProducts };
  },
  onError: (err, newProduct, context) => {
    // エラー時のロールバック
    queryClient.setQueryData(['products'], context.previousProducts);
  },
});
```

### 4. 自動的な重複削除
同じqueryKeyでの同時リクエストは自動的に重複削除され、1つのリクエストにまとめられます。

### 5. 詳細なローディング状態
```typescript
const {
  data,
  error,
  isLoading,    // 初回ローディング
  isFetching,   // バックグラウンド更新中
  isRefetching, // 手動再取得中
  isStale,      // データが古いか
} = useQuery(options);
```

## useQueryのオプション詳細

### 基本オプション
```typescript
useQuery({
  queryKey: ['products', 'list'],           // クエリを識別するキー
  queryFn: () => fetchProducts(),           // データ取得関数
  enabled: true,                           // クエリの有効/無効
  staleTime: 5 * 60 * 1000,               // 5分間は新鮮
  gcTime: 10 * 60 * 1000,                 // 10分間キャッシュ保持
  retry: 3,                               // 再試行回数
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  refetchOnMount: true,                   // マウント時の再取得
  refetchOnWindowFocus: false,            // フォーカス時の再取得
  refetchOnReconnect: true,               // 再接続時の再取得
})
```

### 条件付きクエリ
```typescript
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId, // userIdが存在する時のみ実行
});
```

### 依存クエリ
```typescript
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});

const { data: projects } = useQuery({
  queryKey: ['projects', user?.id],
  queryFn: () => fetchProjects(user.id),
  enabled: !!user?.id, // userが取得できた後に実行
});
```

## SWRからの移行ガイド

### 移行チェックリスト
- [ ] `useSWR` → `useQuery`に変更
- [ ] `mutate()` → `refetch()`に変更
- [ ] エラーハンドリング: `error` → `error.message`
- [ ] 設定オプションの見直し
- [ ] QueryClientProviderの設定
- [ ] DevToolsの追加

### 移行時の注意点
1. **queryKeyの設計**: 配列形式で階層的に設計
2. **staleTimeとgcTimeの理解**: 適切なキャッシュ戦略の設定
3. **エラーハンドリング**: errorオブジェクトの構造変更
4. **TypeScript対応**: より厳密な型チェック

## パフォーマンス最適化

### 1. 適切なqueryKeyの設計
```typescript
// 良い例：階層的で予測可能
['users', 'list', { status: 'active', page: 1 }]
['users', userId]
['users', userId, 'posts']

// 悪い例：フラットで管理が困難
['activeUsers']
['userPosts123']
```

### 2. 適切なstaleTimeの設定
```typescript
// 頻繁に変更されるデータ
staleTime: 0

// あまり変更されないデータ
staleTime: 10 * 60 * 1000 // 10分

// ほとんど変更されないデータ
staleTime: Infinity
```

### 3. 選択的な再取得
```typescript
// 特定の条件でのみ再取得
refetchOnWindowFocus: false,
refetchOnMount: false,
refetchOnReconnect: true,
```

## 次のステップ案
- [ ] useMutationによるデータ更新
- [ ] useInfiniteQueryによる無限スクロール
- [ ] 楽観的更新の実装
- [ ] Suspenseとの組み合わせ
- [ ] React Query Persistorによるオフライン対応

## よくある質問と回答

**Q: SWRとTanStack Queryのどちらを選ぶべきか？**
A: 
- **SWR**: シンプルで軽量、基本的なデータ取得に最適
- **TanStack Query**: 高機能で柔軟、複雑なステート管理が必要な場合に最適

**Q: staleTimeとgcTimeの違いは？**
A:
- **staleTime**: データが新鮮とみなされる時間（再取得をスキップ）
- **gcTime**: キャッシュからデータが削除されるまでの時間

**Q: queryKeyはどう設計すべきか？**
A: 階層的で予測可能な配列形式。依存関係を明確にし、無効化しやすい構造にする。

---