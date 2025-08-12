## 概要

Mock Service Worker (MSW) を使用したAPI通信のモック化デモです。MSW 1系と2系の違いを比較できます。

## セットアップ手順

### 1. MSW 2系のインストール

```bash
npm install msw@latest
```

### 2. Service Workerファイルの生成

```bash
npx msw init public/ --save
```

このコマンドで `public/mockServiceWorker.js` が作成されます。

### 3. 環境変数の設定（オプション）

`.env.local` ファイルを作成：

```env
# MSWを有効にするかどうか
NEXT_PUBLIC_MSW_ENABLED=true
```

### 4. アプリケーションでMSWProviderを使用

`app/layout.tsx` に MSWProvider を追加：

```tsx
import MSWProvider from '@/components/MSWProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <MSWProvider>
          {children}
        </MSWProvider>
      </body>
    </html>
  );
}
```

- なぜProviderを使用するのか

この[URL](https://creators.bengo4.com/entry/2024/10/10/083000)に記載されているがapp routerを使用していた時に下記のエラーが出るため、Providerを使用した

> Next.js では use client を使って client component として扱う場合も SSR されるため、ブラウザで起動する msw/browser モジュールをトップレベルでインポートすると以下のようなエラーが出てしまいます。

```typescript
// 問題のあるコード例
'use client';

import { worker } from '@/mocks/browser'; // ← SSR時にエラー

export default function Page() {
  useEffect(() => {
    worker.start(); // ← SSR時に実行されてエラー
  }, []);
}
```
`use client`でもSSRされる
重要なポイント：

- 'use client'は「クライアントでのみ動作する」という意味ではない
- 'use client'でもSSR（初回レンダリング）はサーバーで実行される
- その後、ブラウザでハイドレーション（再レンダリング）される

### MSWProviderの解決策
```typescript
// MSWProvider内
useEffect(() => {
  // useEffectはブラウザでのみ実行される
  if (typeof window !== 'undefined') {
    // 安全にworker.start()を実行
  }
}, []);
```
### なぜuseEffectが解決策になるのか
#### useEffectの特徴

- SSR時: 実行されない
- ブラウザ: ハイドレーション後に実行される

#### MSWProviderの利点

1. 一箇所で管理: 全てのページで共通の初期化処理
2. エラー回避: SSR時のwindowやsetupWorkerエラーを防止
3. DX向上: 各ページでMSW初期化コードを書く必要がない

## MSWにおけるserverとworkerの役割について

- worker: ブラウザ上で動作するService Workerを利用して、ブラウザから送信されるHTTPリクエストを傍受し、モックデータを返します。これにより、フロントエンドアプリケーションは、あたかも本物のAPIサーバーと通信しているかのように動作します。

- server: Node.js環境で動作し、**ユニットテストやサーバーサイドレンダリング（SSR）**などのバックエンド処理で発生するHTTPリクエストをモックします。ブラウザの実行環境とは関係ありません。

つまり、サーバーサイドでのデータ取得（SSR）には server が必要でクライアントサイドでのデータ取得には worker が必要となります。

Next.jsで実装する際、SSRでデータを取得する場合であれば`server`のみの実装でよいが、`use client`のようなCSRのコンポーネント内で

fetchなどのAPIコールを呼ぶ場合はサーバーではなく、ユーザーのブラウザから発信されるため、`worker`が必要になります。


## MSW 1系 vs 2系 の主な違い

### インポート

```typescript
// MSW 1系
import { rest } from 'msw';
import { setupWorker } from 'msw';

// MSW 2系  
import { http, HttpResponse, delay } from 'msw';
import { setupWorker } from 'msw/browser';
```

### ハンドラーの書き方

```typescript
// MSW 1系
export const getProducts = rest.get('/api/products', (req, res, ctx) => {
  const page = req.url.searchParams.get('page');
  
  return res(
    ctx.delay(500),
    ctx.status(200), 
    ctx.json({ data: products })
  );
});

// MSW 2系
export const getProducts = http.get('/api/products', async ({ request }) => {
  const url = new URL(request.url);
  const page = url.searchParams.get('page');
  
  await delay(500);
  
  return HttpResponse.json(
    { data: products },
    { status: 200 }
  );
});
```

### レスポンス作成

```typescript
// MSW 1系
return res(
  ctx.delay(500),
  ctx.status(200),
  ctx.json(responseData)
);

// MSW 2系
await delay(500);
return HttpResponse.json(responseData, { status: 200 });
```

## ファイル構成

```
mocks/
├── handlers-v1.ts      # MSW 1系の書き方（参考用）
├── handlers-v2.ts      # MSW 2系の実装
└── browser.ts          # ブラウザ用設定

data/
└── msw-products.json   # モック用商品データ

types/
└── msw.ts             # MSW関連の型定義

components/
└── MSWProvider.tsx    # MSW初期化コンポーネント
```

## 使用方法

### 1. MSWの開始

`npm run dev:msw`コマンドを実行することでMSWが起動します。

### 2. APIテスト

- **商品データ取得**: GET `/api/v2/products`
- **商品詳細取得**: GET `/api/v2/products/:id`  
- **カートに追加**: POST `/api/v2/cart`
- **エラーシミュレート**: GET `/api/v2/products-error`

### 3. レスポンス確認

APIレスポンスがJSON形式で画面に表示されます

## MSW 2系の改善点

### 1. より直感的なAPI

```typescript
// 1系: 複雑な構文
res(ctx.delay(500), ctx.status(200), ctx.json(data))

// 2系: シンプルな構文  
await delay(500);
return HttpResponse.json(data, { status: 200 });
```

### 2. 強化された型安全性

```typescript
// 2系では型推論が向上
export const handler = http.post('/api/users', async ({ request }) => {
  const user = await request.json() as User; // 型安全
  return HttpResponse.json(user);
});
```

### 3. エラーハンドリングの改善

```typescript
// 2系: より明確なエラー処理
if (!product) {
  return HttpResponse.json(
    { message: 'Product not found' },
    { status: 404 }
  );
}
```

### 4. 非同期処理の簡素化

```typescript
// 2系: async/awaitが自然に使える
export const handler = http.get('/api/data', async ({ request }) => {
  await delay(1000);
  const data = await fetchSomeData();
  return HttpResponse.json(data);
});
```

## 注意事項

- MSWは**開発環境のみ**で使用してください
- 本番環境ではMSWを無効にしてください
- `public/mockServiceWorker.js`をGitにコミットしてください
- MSW 1系のコードは参考用で、実際には動作しません

## トラブルシューティング

### Service Worker関連エラー

```
Failed to register Service Worker
```

**解決方法:**
```bash
npx msw init public/ --save
```

### TypeScriptエラー

```
Module '"msw"' has no exported member 'rest'
```

**解決方法:**  
MSW 2系では `rest` は `http` に変更されました。

### CORS エラー

MSWはブラウザレベルでリクエストをインターセプトするため、CORSエラーは発生しません。

## 参考リンク

- [MSW公式ドキュメント](https://mswjs.io/)
- [MSW v2 マイグレーションガイド](https://mswjs.io/docs/migrations/1.x-to-2.x)
- [Next.js with MSW](https://mswjs.io/docs/integrations/next-js)