# 無限スクロール機能の実装解説

## 概要

無限スクロール（Infinite Scroll）は、ユーザーがページの下部までスクロールした際に、自動的に次のコンテンツを読み込んで表示する機能です。SNSやECサイトなどで広く使用されており、ページネーションよりもスムーズなUXを提供できます。

## 実装の全体像

### 技術スタック
- **React 18** + **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Intersection Observer API**

### 主要な構成要素

```typescript
// 状態管理
const [items, setItems] = useState<Item[]>([]);       // 表示するアイテム一覧
const [loading, setLoading] = useState(false);        // ローディング状態
const [hasMore, setHasMore] = useState(true);         // 追加データの有無
const [page, setPage] = useState(0);                  // 現在のページ番号
const observerRef = useRef<IntersectionObserver | null>(null); // Observer参照
```

## 実装の詳細解説

### 1. データ構造の定義

```typescript
// types/infinite-scroll.ts
export interface Item {
  id: number;
  name: string;
  image: string;
}
```

シンプルな構造で、IDと名前、画像URLのみを持つアイテムを定義しています。

### 2. データ読み込み関数（loadItems）

```typescript
const loadItems = useCallback(async (pageNumber: number) => {
  setLoading(true);

  // APIコールをシミュレート（実際のプロジェクトではfetchを使用）
  await new Promise((resolve) => setTimeout(resolve, 800));

  const startIndex = pageNumber * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const newItems = allItemsData.slice(startIndex, endIndex);

  if (newItems.length === 0) {
    setHasMore(false); // データがない場合は終了フラグを立てる
  } else {
    setItems((prev) => {
      // 重複チェック：既存のアイテムのIDを取得
      const existingIds = new Set(prev.map((item) => item.id));
      const filteredNewItems = newItems.filter(
        (item) => !existingIds.has(item.id),
      );

      if (pageNumber === 0) {
        return filteredNewItems; // 初回読み込み
      } else {
        return [...prev, ...filteredNewItems]; // 追加読み込み
      }
    });
  }
  setLoading(false);
}, []);
```

**ポイント:**
- **ページネーション**: `startIndex`と`endIndex`で取得範囲を決定
- **重複防止**: `Set`を使用して既存IDをチェック
- **初回 vs 追加**: `pageNumber === 0`で処理を分岐
- **終了判定**: データがない場合に`hasMore`をfalseに設定

### 3. 初期データの読み込み

```typescript
useEffect(() => {
  loadItems(0);
}, [loadItems]);
```

コンポーネントのマウント時に最初のページ（page 0）を読み込みます。

### 4. Intersection Observer APIを使ったスクロール検知（詳細解説）

#### Intersection Observer のプロパティ詳細解説

##### **root（監視の基準）**

```typescript
new IntersectionObserver(callback, {
  root: null,  // ← ブラウザのビューポートが基準
  // ...
});
```

**今回のケースでの`root`：**
- `root: null`を指定しているため、**ブラウザのビューポート（画面に表示される領域）**が基準
- InfiniteScrollPageコンポーネントや特定のdiv要素ではない

**視覚的な説明：**
```
┌─────────────────────────────────────┐ ← ブラウザウィンドウ
│ ┌─────────────────────────────────┐ │ ← ビューポート（root: null の場合）
│ │  Header                         │ │
│ │  ┌─────────────────────────────┐ │ │ ← InfiniteScrollPageコンポーネント
│ │  │ アイテム1                   │ │ │
│ │  │ アイテム2                   │ │ │
│ │  │ アイテム3                   │ │ │
│ │  │ ...                         │ │ │
│ │  │ <div id="scroll-sentinel">  │ │ │ ← 監視対象要素
│ │  └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

##### **rootMargin（監視領域の拡張）**

```typescript
rootMargin: '100px'  // ビューポートを上下左右100px拡張
```

**実際の動作：**
```
        実際のビューポート
        ┌─────────────────┐
100px ↑ │                 │ ← 実際の画面上端
拡張    │   ░░░░░░░░░░░░░  │
        └─────────────────┘
100px ↓                     ← 実際の画面下端
拡張
```

**rootMarginによる拡張領域：**
```
┌─────────────────┐ ← 100px上に拡張された監視領域
│                 │
├─────────────────┤ ← 実際のビューポート上端
│                 │
│     実際の      │
│   ビューポート   │
│                 │
├─────────────────┤ ← 実際のビューポート下端  
│                 │
└─────────────────┘ ← 100px下に拡張された監視領域
```

**様々なrootMargin指定方法：**
```typescript
rootMargin: '50px'           // 全方向50px拡張
rootMargin: '50px 20px'      // 上下50px、左右20px
rootMargin: '10px 20px 30px 40px'  // 上・右・下・左別々
rootMargin: '-50px'          // 判定エリアを50px縮小
rootMargin: '100px 0px'      // 上下のみ100px拡張
```

##### **threshold（発火条件の割合）**

```typescript
threshold: 0.1  // 対象要素の10%が監視領域と重なったら発火
```

**重要：**「対象要素の何%がrootと重なったら発火するか」を指定

**各threshold値の動作：**
```typescript
threshold: 0     // 1pxでも重なったら発火
threshold: 0.1   // 10%重なったら発火
threshold: 0.5   // 50%重なったら発火  
threshold: 1.0   // 100%重なったら発火

// 複数段階での監視
threshold: [0, 0.25, 0.5, 0.75, 1.0]  // 各段階で発火
```

**視覚的な説明（threshold: 0.1の場合）：**
```
拡張されたビューポート
┌─────────────────┐
│                 │
│                 │
│ ┌─────────────┐ │ ← scroll-sentinel要素の10%が
│ │░░░░░░░░░░░░░│ │    拡張されたビューポートに入る
│ └─────────────┘ │    ↑ この時点で発火
│                 │
└─────────────────┘
```

##### **今回の設定の実際の動作**

```typescript
{
  root: null,           // ビューポートが基準
  rootMargin: '100px',  // ビューポートを上下左右100px拡張
  threshold: 0.1        // sentinel要素の10%が拡張領域に入ったら発火
}
```

**実際の発火タイミング：**
1. ユーザーがスクロール
2. `scroll-sentinel`要素が画面下端より**100px上の位置**に到達
3. sentinel要素の**10%以上**が拡張された監視領域に入る
4. Intersection Observer発火
5. `loadNextPage()`実行

##### **12件表示問題との関連**

この設定により、以下の問題が発生する可能性：

1. **初回6件読み込み後、sentinel要素が既に拡張された監視領域内にある**
2. **Observer再作成時に即座に条件を満たす**
3. **スクロールしていないのに`loadNextPage()`が実行される**

**検証方法：**
```typescript
const sentinel = document.getElementById('scroll-sentinel');
if (sentinel) {
  const rect = sentinel.getBoundingClientRect();
  const threshold = window.innerHeight + 100; // rootMargin考慮
  
  console.log('Sentinel position check:', {
    sentinelTop: rect.top,
    windowHeight: window.innerHeight,
    thresholdLine: threshold,
    isInTriggerZone: rect.top < threshold
  });
}
```

#### 処理の詳細フロー

```typescript
const loadNextPage = useCallback(() => {
  if (!loading && hasMore) {
    const nextPage = page + 1;
    setPage(nextPage);
    loadItems(nextPage);
  }
}, [page, loading, hasMore, loadItems]);

useEffect(() => {
  // 既存のObserverを切断（重要！）
  if (observerRef.current) {
    observerRef.current.disconnect();
  }

  // 新しいObserverを作成
  observerRef.current = new IntersectionObserver(
    (entries) => {
      const target = entries[0];
      console.log('🔍 Observer triggered:', {
        isIntersecting: target.isIntersecting,
        loading,
        hasMore,
        boundingClientRect: target.boundingClientRect
      });
      
      if (target.isIntersecting && !loading && hasMore) {
        console.log('✅ Conditions met, calling loadNextPage');
        loadNextPage();
      }
    },
    {
      rootMargin: '100px', // 100px手前で発火
      threshold: 0.1       // 要素の10%が表示されたら発火
    },
  );

  // sentinel要素を監視開始
  const sentinel = document.getElementById('scroll-sentinel');
  if (sentinel && observerRef.current) {
    console.log('👀 Started observing sentinel element');
    observerRef.current.observe(sentinel);
  }

  // クリーンアップ関数
  return () => {
    if (observerRef.current) {
      console.log('🛑 Disconnecting observer');
      observerRef.current.disconnect();
    }
  };
}, [loadNextPage, loading, hasMore]); // ← この依存配列が重要
```

#### Intersection Observerが意図せず発火する原因

##### 1. **useEffectの依存配列による再作成**

```typescript
// 問題のあるパターン
useEffect(() => {
  // Observer作成処理
}, [loadNextPage, loading, hasMore]);
//     ↑         ↑       ↑
//  これらが変わるたびにObserverが再作成される
```

**発生する問題：**
1. `loading`が`false → true → false`に変化
2. useEffectが再実行され、Observerが再作成される
3. 新しいObserverが`sentinel`要素を監視開始
4. `sentinel`要素が既に画面内にある場合、**即座に`isIntersecting: true`が発火**
5. `loadNextPage()`が実行される

##### 2. **loadNextPageの依存配列による連鎖反応**

```typescript
const loadNextPage = useCallback(() => {
  // ...
}, [page, loading, hasMore, loadItems]);
//     ↑     ↑       ↑       ↑
// これらが変わるとloadNextPageが再作成される
```

**連鎖反応の流れ：**
```
1. loadItems実行 → loading: true
2. loading変化 → loadNextPage再作成
3. loadNextPage変化 → useEffect再実行
4. Observer再作成 → sentinel要素を再監視
5. sentinel要素が画面内 → 即座に発火
6. loadNextPage実行 → 次のページ読み込み
```

##### 3. **sentinel要素の位置問題**

初回読み込み後の状態：
```html
<!-- 6件のアイテムが表示された後 -->
<div>アイテム1</div>
<div>アイテム2</div>
<div>アイテム3</div>
<div>アイテム4</div>
<div>アイテム5</div>
<div>アイテム6</div>
<div id="scroll-sentinel" class="h-1"></div> <!-- ← この要素が画面内に見えている可能性 -->
```

**問題：**
- 画面の高さが大きい場合、6件表示後でも`sentinel`要素が画面内に残る
- Observerが再作成されると、画面内にある`sentinel`要素に対して即座に`isIntersecting: true`が発火

#### デバッグ方法

##### 1. **Observer発火タイミングの記録**

```typescript
observerRef.current = new IntersectionObserver(
  (entries) => {
    const target = entries[0];
    console.log('🔍 Observer callback triggered:', {
      timestamp: new Date().toISOString(),
      isIntersecting: target.isIntersecting,
      loading,
      hasMore,
      page,
      itemsLength: items.length,
      boundingClientRect: target.boundingClientRect,
      intersectionRatio: target.intersectionRatio
    });
    
    if (target.isIntersecting && !loading && hasMore) {
      console.log('✅ All conditions met, calling loadNextPage');
      loadNextPage();
    } else {
      console.log('❌ Conditions not met:', {
        isIntersecting: target.isIntersecting,
        loading,
        hasMore
      });
    }
  },
  { rootMargin: '100px', threshold: 0.1 }
);
```

##### 2. **useEffect実行タイミングの記録**

```typescript
useEffect(() => {
  console.log('🔄 useEffect for Observer triggered:', {
    timestamp: new Date().toISOString(),
    loading,
    hasMore,
    page,
    itemsLength: items.length
  });
  
  // Observer作成処理...
}, [loadNextPage, loading, hasMore]);
```

##### 3. **sentinel要素の位置確認**

```typescript
const sentinel = document.getElementById('scroll-sentinel');
if (sentinel) {
  const rect = sentinel.getBoundingClientRect();
  console.log('📏 Sentinel position:', {
    top: rect.top,
    bottom: rect.bottom,
    windowHeight: window.innerHeight,
    isVisible: rect.top < window.innerHeight && rect.bottom > 0
  });
}
```

#### 解決策

##### 1. **依存配列の最適化**

```typescript
// loadNextPageの依存配列を減らす
const loadNextPage = useCallback(() => {
  if (!loading && hasMore) {
    setPage(prevPage => {
      const nextPage = prevPage + 1;
      loadItems(nextPage);
      return nextPage;
    });
  }
}, [loading, hasMore]); // pageとloadItemsを依存配列から除外
```

##### 2. **Refを使った状態管理**

```typescript
const loadingRef = useRef(false);
const hasMoreRef = useRef(true);

const loadNextPage = useCallback(() => {
  if (!loadingRef.current && hasMoreRef.current) {
    setPage(prevPage => {
      const nextPage = prevPage + 1;
      loadItems(nextPage);
      return nextPage;
    });
  }
}, []); // 依存配列を空にする
```

##### 3. **sentinel要素の動的配置**

```typescript
// アイテム数が少ない場合はsentinel要素を表示しない
{hasMore && items.length >= ITEMS_PER_PAGE && (
  <div id="scroll-sentinel" className="h-1" />
)}
```

#### まとめ

Intersection Observerが意図せず発火する主な原因は：

1. **useEffectの頻繁な再実行**による Observer の再作成
2. **sentinel要素が常に画面内に存在**することによる即座の発火
3. **依存配列の連鎖反応**による無限ループ

これらを理解して適切にデバッグすることで、12件表示問題の根本原因を特定できます。

### 5. センチネル要素（監視対象）

```html
{hasMore && <div id="scroll-sentinel" className="h-1" />}
```

この見えない要素がビューポートに入ると、次のページを読み込むトリガーとなります。

## 状態管理の流れ

```mermaid
graph TD
    A[初回レンダリング] --> B[loadItems(0)実行]
    B --> C[6件のデータ取得]
    C --> D[items配列に設定]
    D --> E[UIに表示]
    E --> F[ユーザーがスクロール]
    F --> G[sentinel要素が画面内に入る]
    G --> H[Intersection Observer発火]
    H --> I[loadNextPage実行]
    I --> J[page + 1]
    J --> K[loadItems実行]
    K --> L[次の6件取得]
    L --> M[既存データに追加]
    M --> N[UIに追加表示]
    N --> O{まだデータあり?}
    O -->|Yes| F
    O -->|No| P[hasMore = false, 終了]
```

## よくある問題と対策

### 1. 重複データの読み込み

**問題**: 同じデータが複数回読み込まれる

**原因**: 
- Intersection Observerが複数回発火
- 非同期処理のタイミング問題

**対策**:
```typescript
// loading状態をRefで管理
const loadingRef = useRef(false);

const loadItems = async (pageNumber: number) => {
  if (loadingRef.current) return; // 重複防止
  
  loadingRef.current = true;
  // ... 処理
  loadingRef.current = false;
};
```

### 2. useEffect無限ループ

**問題**: useEffectが無限に実行される

**原因**: 依存配列の設定ミス

```typescript
// ❌ 問題のあるパターン
const loadItems = useCallback(() => {
  setItems([...]);
}, [items]); // itemsが変わるとloadItemsが再作成される

useEffect(() => {
  loadItems();
}, [loadItems]); // loadItemsが変わるとuseEffectが再実行される
```

**対策**:
```typescript
// ✅ 正しいパターン
const loadItems = useCallback(() => {
  setItems(prev => [...prev, ...newItems]);
}, []); // 依存配列を最小限に
```

### 3. React Strict Modeの影響

**問題**: 開発環境でuseEffectが2回実行される

**原因**: React 18のStrict Modeが副作用を検出するため

**対策**: 本番環境での動作確認、またはidempotent（冪等）な処理の実装

## パフォーマンス最適化

### 1. 画像の遅延読み込み

```typescript
<Image
  src={item.image}
  alt={item.name}
  fill
  className="object-cover"
  loading="lazy" // 遅延読み込み
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 2. 仮想化（Virtualization）

データが大量になる場合は、`react-window`や`react-virtualized`の使用を検討

### 3. メモ化

```typescript
const MemoizedItem = React.memo(({ item }) => (
  <div key={item.id}>
    {/* アイテムの内容 */}
  </div>
));
```

## 実際のAPI連携

現在はローカルデータを使用していますが、実際のAPIとの連携例：

```typescript
const loadItems = useCallback(async (pageNumber: number) => {
  setLoading(true);
  
  try {
    const response = await fetch(
      `/api/items?page=${pageNumber}&limit=${ITEMS_PER_PAGE}`
    );
    const data = await response.json();
    
    if (data.items.length === 0) {
      setHasMore(false);
    } else {
      setItems(prev => 
        pageNumber === 0 
          ? data.items 
          : [...prev, ...data.items]
      );
    }
  } catch (error) {
    console.error('Failed to load items:', error);
  } finally {
    setLoading(false);
  }
}, []);
```

## まとめ

無限スクロールの実装には以下の要素が重要です：

1. **状態管理**: items, loading, hasMore, pageの適切な管理
2. **Intersection Observer**: 効率的なスクロール検知
3. **重複防止**: loading状態とID重複チェック
4. **エラーハンドリング**: API呼び出し失敗時の対処
5. **パフォーマンス**: 画像の遅延読み込みと仮想化

この実装により、スムーズで使いやすい無限スクロール機能を提供できます。