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
- [ ] Infinite Loadingの実装
- [ ] Mutationの活用（POST/PUT/DELETE）

---

## 実装状況
- ✅ Step 1: 基本的なSWRデータフェッチングの実装完了
- ✅ Step 2: SWR設定オプションの追加完了
- ✅ Navigation: トップページからのルーティング追加完了
- ✅ Documentation: 実装手順と学習内容のドキュメント化完了