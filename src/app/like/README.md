# いいね機能
## 実装概要

### 基本機能
- いいねボタンのクリックでいいね状態を切り替え
- いいね数のリアルタイム更新
- 視覚的フィードバック（ハートアイコンの色変化）

### 実装例

```typescript
	const [posts, setPosts] = useState<Post[]>(mockPosts);

	const handleLike = (postId: number) => {
		setPosts((prevPosts) =>
			prevPosts.map((post) =>
				post.id === postId
					? {
							...post,
							isLiked: !post.isLiked,
							likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
						}
					: post,
			),
		);
	};

```

### 連打防止機能
デバウンス処理により、短時間での連続クリックを防止します。

```typescript
const [isProcessing, setIsProcessing] = useState(false);

const handleClick = useCallback(async () => {
  if (isProcessing) return; // 処理中は早期リターン

  setIsProcessing(true);
  onLike();

  setTimeout(() => {
    setIsProcessing(false);
  }, 300); // 300ms後に再クリック可能
}, [isProcessing, onLike]);
```

## コンポーネント構成

```
src/app/like/
├── page.tsx              # メインページ
├── components/
│   ├── LikeButton.tsx    # いいねボタン（連打防止機能付き）
│   └── PostCard.tsx      # 投稿カード
├── mock.ts               # モックデータ
└── README.md            # このファイル
```

## 技術ポイント

- **連打防止**: `isProcessing`状態でボタンを無効化
- **視覚的フィードバック**: 処理中はスピナー表示
- **パフォーマンス**: `useCallback`でハンドラーをメモ化
- **ユーザビリティ**: グレーアウト表示で処理中であることを明示