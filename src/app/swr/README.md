# SWR実装手順

## 概要
このドキュメントは、Next.jsアプリケーションにSWR（Stale-While-Revalidate）を導入する手順と学習内容をまとめたものです。

## SWRとは
- データフェッチング用のReactフック
- キャッシュ、再検証、フォーカス追跡、定期的な更新などの機能を提供
- 「stale-while-revalidate」戦略でパフォーマンスとUXを向上

## 実装手順

### Step 1: 基本的なSWRデータフェッチングの実装

#### 変更内容
1. **SWRライブラリの導入**
   ```javascript
   import useSWR from 'swr';
   ```

2. **fetcher関数の作成**
   ```javascript
   const fetcher = async (url: string): Promise<MSWProduct[]> => {
     const response = await fetch(url);
     const data: APIResponse<ProductListResponse> = await response.json();
     
     if (data.status === 'success') {
       return data.data.products;
     }
     throw new Error(data.message);
   };
   ```

3. **従来のfetch処理をSWRに置き換え**
   ```javascript
   // Before: useState + useEffect + fetch
   const [products, setProducts] = useState<MSWProduct[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   // After: useSWR
   const { data: products, error, isLoading } = useSWR('/api/v2/products', fetcher);
   ```

#### 学習ポイント
- **コードの簡潔性**: useState + useEffect + fetch の組み合わせが1行のuseSWRに置き換えられた
- **型安全性**: fetcherの戻り値の型を明示的に指定することで、TypeScriptの恩恵を受けられる
- **命名**: SWRでは`isLoading`が使われる（`loading`ではなく）

#### 詰まった点
- エラーハンドリングがfetcherの中で必要
- データの存在チェックを条件付きレンダリングで行う必要がある

---

### Step 2: SWR設定オプションの追加

#### 変更内容
1. **SWR設定オプションの追加**
   ```javascript
   const { data: products, error, isLoading, mutate } = useSWR('/api/v2/products', fetcher, {
     refreshInterval: 60000, // 1分ごとに自動更新
     revalidateOnFocus: true, // フォーカス時に再検証
     revalidateOnReconnect: true, // 再接続時に再検証
     dedupingInterval: 10000, // 10秒間は重複リクエストを防ぐ
   });
   ```

2. **手動再検証ボタンの追加**
   ```javascript
   <button onClick={() => mutate()}>データを再取得</button>
   ```

3. **SWR状態の可視化UI**
   - Loading状態の表示
   - Error状態の表示
   - Data状態の表示
   - 自動更新間隔の表示

#### 学習ポイント
- **refreshInterval**: 定期的な自動更新設定
- **revalidateOnFocus**: ウィンドウにフォーカスが戻った時の再検証
- **revalidateOnReconnect**: ネットワーク再接続時の再検証
- **dedupingInterval**: 重複リクエストの抑制
- **mutate関数**: 手動でのデータ再取得・更新

#### 詰まった点
- mutate関数を取得するために、useSWRの戻り値を分割代入で取得する必要がある
- 設定オプションの種類が多く、どれを使うべきか迷う

---

---

## まとめ

### SWR導入で得られたメリット
1. **開発体験の向上**
   - useState + useEffect + fetch のボイラープレートコードが大幅に削減
   - 1行のuseSWRでデータフェッチング、ローディング、エラーハンドリングを実現

2. **ユーザー体験の向上**
   - 自動的なバックグラウンド更新
   - フォーカス時の自動再検証
   - 重複リクエストの自動防止
   - キャッシュによる高速表示

3. **設定の柔軟性**
   - refreshInterval、revalidateOnFocus等の細かい設定が可能
   - プロジェクトの要件に応じた最適化が容易

### 学んだこと
- **fetcher関数の重要性**: エラーハンドリングを含む適切なfetcher関数の設計が重要
- **TypeScript対応**: fetcherの戻り値型を明示することで型安全性を確保
- **オプション設定**: refreshInterval等の設定で、アプリケーションの性質に応じた最適化が可能
- **mutate関数**: 手動でのデータ更新やキャッシュ操作が簡単に実現

### 実装時のポイント
- エラーハンドリングはfetcher関数内で行う
- データの存在チェックは条件付きレンダリングで対応
- 設定オプションは必要に応じて段階的に追加
- SWRの状態を可視化することで開発・デバッグが容易

### 次のステップ案
- [ ] SWRConfigを使ったグローバル設定
- [ ] Optimistic Updatesの実装
- ✅ Infinite Loadingの実装（useSWRInfinite）
- [ ] Mutationの活用（POST/PUT/DELETE）

---

## Step 3: axios導入とAPI設定の一元化

### 問題と課題
- hooksで毎回fetch処理を記述するのは非効率
- API設定（ベースURL、タイムアウト、エラーハンドリング）の統一が必要
- 現職の開発環境ではaxiosが採用されているため、キャッチアップも兼ねて導入

### 実装内容

#### 1. `src/lib/api.ts`の作成
```typescript
import axios from 'axios';
import type { APIResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: '/api/v2',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエスト/レスポンスインターセプター
apiClient.interceptors.request.use(/* 認証トークン付与など */);
apiClient.interceptors.response.use(/* エラーハンドリング統一 */);

export const createFetcher = <T>(url: string) => {
  return async (): Promise<T> => {
    const response = await apiClient.get<APIResponse<T>>(url);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error(response.data.message);
  };
};
```

#### 2. hooksの簡素化
**変更前（20行）:**
```typescript
const fetcher = async (): Promise<Product[]> => {
  const response = await fetch(path)
  const data: APIResponse<ProductListResponse> = await response.json();
  
  if (data.status === 'success') {
    return data.data.products;
  }
  throw new Error(data.message);
};
```

**変更後（1行）:**
```typescript
const fetcher = createFetcher<ProductListResponse>(path);
```

### 学習ポイント
- **DRY原則**: 重複するfetcherロジックを排除
- **型安全性**: ジェネリクスによる型推論の活用
- **設定の一元化**: タイムアウト、ベースURLなどを1箇所で管理
- **将来の拡張性**: 認証、ログ出力などの追加が容易

### axiosのメリット
1. **インターセプター**: リクエスト/レスポンスの前処理・後処理が可能
2. **ベースURL設定**: 環境ごとのAPI URLの管理
3. **自動JSONパース**: レスポンスの自動パース
4. **タイムアウト設定**: より細かい制御が可能
5. **エラーハンドリング**: 統一されたエラー処理

---

## Step 4: useSWRInfiniteによる無限スクロール実装

### 設計方針
**責務の分離**: UIロジックとデータフェッチロジックを分離
```
src/hooks/
├── useInfiniteScroll.ts     # Intersection Observer制御（汎用）
└── useInfiniteProducts.ts   # useSWRInfinite + 商品データ
```

### 実装の詳細

#### 1. `useInfiniteScroll.ts`（汎用UI制御）
```typescript
export const useInfiniteScroll = ({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = '0px 0px 50px 0px',
  threshold = 0,
}: UseInfiniteScrollOptions) => {
  // Intersection Observerのロジック
  // 任意のデータ型で再利用可能
};
```

#### 2. `useInfiniteProducts.ts`（データ特化）
```typescript
export const useInfiniteProductsFromJSON = ({
  limit = 6,
  category
}: UseInfiniteProductsOptions = {}) => {
  const getKey = (pageIndex: number, previousPageData: Product[] | null) => {
    if (previousPageData && previousPageData.length === 0) {
      return null; // 最後のページに到達
    }
    return `products-infinite-${pageIndex}-${limit}-${category || 'all'}`;
  };

  const fetcher = async (key: string): Promise<Product[]> => {
    // keyからページ情報を解析
    // JSONファイルからページネーションデータを取得
  };

  const { data, error, isLoading, size, setSize } = useSWRInfinite(getKey, fetcher);
  
  // 無限スクロール用の状態管理
};
```

#### 3. シンプルなページコンポーネント
```typescript
export default function SWRInfinitePage() {
  const { products, hasMore, isLoading, loadMore } = useInfiniteProductsFromJSON({ limit: 6 });
  const { sentinelId } = useInfiniteScroll({ hasMore, isLoading, onLoadMore: loadMore });
  
  return (
    <div>
      {products.map(product => <ProductCard key={product.id} product={product} />)}
      {hasMore && <div id={sentinelId} />}
    </div>
  );
}
```

### 課題と解決策

#### 問題1: 初期データの重複取得
**原因**: `rootMargin: '100px'`により、初期表示時にsentinelが即座に検知される

**解決策**: `rootMargin: '0px 0px 50px 0px'`と適切な遅延設定

#### 問題2: APIサーバーがない環境での404エラー
**原因**: useSWRInfiniteがAPI呼び出しを試行
**解決策**: JSONファイル読み込み専用の`useInfiniteProductsFromJSON`を作成

#### 問題3: MSWの制御
**課題**: 開発時のMSW有効/無効の切り替えが必要

**何が発生したのか**: 立ち上げた時にMSW起動コマンドを実行していないのにも関わらず、msw/mock/にあるデータをswrのページでも取得していた

**原因**: MSWProvider.tsxの記述内容に誤りがあった

**解説**
`layout.tsx`では`children`を`MSWProvider`コンポーネントで囲っていた。

MSWProviderでは修正前は以下のようなコードになっていた

process.env.NEXT_PUBLIC_MSW_ENABLEDにboolean判定が記述されていないため、true・falseどちらでもserverとworkerが起動してしまうのが原因のため、修正を実施した

```typescript
// Before
	useEffect(() => {
		const initMSW = async () => {
			if (
				process.env.NODE_ENV === 'development' &&
				process.env.NEXT_PUBLIC_MSW_ENABLED
			) {
				if (typeof window === 'undefined') {
					const { server } = await import('@/mocks/server');
					await server.listen();
				} else {
					const { worker } = await import('@/mocks/browser');
					await worker.start({
						onUnhandledRequest: 'warn',
						serviceWorker: { url: '/mockServiceWorker.js' },
					});
				}
				setMswReady(true);
			}
		};

		initMSW();
	}, []);
```

### 無限スクロールの実装パターン

#### API版（将来用）
```typescript
export const useInfiniteProducts = () => {
  const getKey = (pageIndex, previousPageData) => {
    return `/products?page=${pageIndex + 1}&limit=6`;
  };
  
  const fetcher = async (url: string): Promise<ProductListResponse> => {
    const response = await apiClient.get<APIResponse<ProductListResponse>>(url);
    return response.data.data;
  };
  
  // APIレスポンス構造に対応
};
```

#### JSON版（現在の実装）
```typescript
export const useInfiniteProductsFromJSON = () => {
  const getKey = (pageIndex, previousPageData) => {
    return `products-infinite-${pageIndex}-${limit}-${category || 'all'}`;
  };
  
  const fetcher = async (key: string): Promise<Product[]> => {
    // keyからページ情報を取得してJSONからスライス
    const paginatedProducts = allProducts.slice(startIndex, endIndex);
    return paginatedProducts;
  };
  
  // フラットな配列構造
};
```

### useSWRInfiniteの詳細解説

#### 基本概念
useSWRInfiniteは、ページネーションやカーソルベースのデータ取得に特化したSWRのフック。通常のuseSWRとは異なり、複数のページデータを管理する。

#### コア関数の解説

**1. getKey関数**
```typescript
const getKey = (pageIndex: number, previousPageData: Product[] | null) => {
  // 最後のページに到達した場合はnullを返して終了
  if (previousPageData && previousPageData.length === 0) {
    return null;
  }
  
  // ページごとのユニークなキーを生成
  return `products-infinite-${pageIndex}-${limit}-${category || 'all'}`;
};
```
- **pageIndex**: 0から始まるページインデックス
- **previousPageData**: 前ページのデータ（最初のページの場合はnull）
- **返り値**: データ取得のキー（nullで終了）

**2. fetcher関数**
```typescript
const fetcher = async (key: string): Promise<Product[]> => {
  // keyからページ情報を解析
  const [, , pageStr, limitStr, categoryFilter] = key.split('-');
  const pageIndex = parseInt(pageStr);
  const pageLimit = parseInt(limitStr);
  
  // データ取得ロジック（API呼び出しやJSONファイル読み込み）
  return paginatedData;
};
```
- **引数**: getKey関数が生成したキー
- **返り値**: そのページのデータ配列

#### 利用可能なオプション

```typescript
const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite(
  getKey,
  fetcher,
  {
    // 基本オプション
    revalidateFirstPage: false,        // 新しいページ取得時に最初のページを再検証するか
    revalidateAll: false,             // 新しいページ取得時に全ページを再検証するか
    persistSize: true,                // ページサイズを保持するか
    parallel: false,                  // 全ページを並列取得するか
    
    // 通常のSWRオプションも使用可能
    revalidateOnFocus: true,          // フォーカス時の再検証
    revalidateOnReconnect: true,      // 再接続時の再検証
    refreshInterval: 0,               // 定期的な更新間隔
    dedupingInterval: 2000,           // 重複排除の間隔
    errorRetryCount: 3,               // エラー時の再試行回数
    errorRetryInterval: 5000,         // エラー時の再試行間隔
  }
);
```

#### 返り値の詳細解説

```typescript
const {
  data,           // Product[][] - ページごとの配列の配列
  error,          // エラーオブジェクト
  isLoading,      // 初回ロード中か（size === 0 && data === undefined）
  isValidating,   // バリデーション中か（データ取得中）
  size,           // 現在のページ数
  setSize,        // ページ数を設定する関数
  mutate          // 手動で再検証する関数
} = useSWRInfinite(getKey, fetcher, options);
```

**データ構造の理解**
```typescript
// data の構造例
data = [
  [product1, product2, product3],  // 1ページ目
  [product4, product5, product6],  // 2ページ目
  [product7, product8]             // 3ページ目
];

// フラット化して使用
const allProducts = data ? data.flat() : [];  // [product1, product2, ..., product8]
```

### 学習ポイント

#### useSWRInfiniteの理解
- **getKey関数**: ページごとのユニークキーを生成、nullで終了を制御
- **fetcher関数**: キーからページ情報を解析してデータを取得
- **data構造**: ページごとの配列の配列 `Product[][]`
- **flat()の使用**: 複数ページのデータを1つの配列に統合
- **size管理**: setSize(size + 1)で次ページ読み込み

#### hooksの設計
- **汎用性**: `useInfiniteScroll`は他のデータ型でも使用可能
- **特化性**: `useInfiniteProducts`は商品データに特化
- **再利用性**: TanStack Query移行時もIntersection Observerロジックを活用可能

#### パフォーマンス最適化
- **適切なrootMargin**: 50px手前で次ページ読み込み開始
- **SWRキャッシュ**: 既読ページのキャッシュ活用
- **重複防止**: isLoadingによる多重リクエスト防止

---

### よくある質問と回答

**Q: なぜhooksディレクトリをプロジェクト直下に置いたのか？**
A: `useInfiniteScroll`は汎用的で、SWR以外（TanStack Query等）でも使用可能なため

**Q: APIがない環境での開発はどうするべきか？**
A: 
1. 既存コードを保持してAPI用とJSON用の両方を用意
2. 将来的にAPIに切り替える際は関数名を変更するだけで対応
3. MSWの有効/無効を環境変数で制御

**Q: 無限スクロールで初期データが重複する問題は？**
A: Intersection Observerの`rootMargin`設定と初期化タイミングの調整で解決