'use client';

import Header from '@/components/layout/Header';
import type { Item } from '@/types/infinite-scroll';
import { useCallback, useEffect, useRef, useState } from 'react';
import allItemsData from '@/app/infinite-scroll/mock/items.json';
import Image from 'next/image';

export default function InfiniteScrollPage() {
	const [items, setItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [page, setPage] = useState(0);
	const observerRef = useRef<IntersectionObserver | null>(null);

	const ITEMS_PER_PAGE = 6;

	const loadItems = useCallback(async (pageNumber: number) => {
		setLoading(true);

		// APIコールをシミュレート（実際のプロジェクトではfetchを使用）
		await new Promise((resolve) => setTimeout(resolve, 800));

		const startIndex = pageNumber * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		const newItems = allItemsData.slice(startIndex, endIndex);

		if (newItems.length === 0) {
			setHasMore(false);
		} else {
			setItems((prev) => {
				// 重複チェック：既存のアイテムのIDを取得
				const existingIds = new Set(prev.map((item) => item.id));
				const filteredNewItems = newItems.filter(
					(item) => !existingIds.has(item.id),
				);

				if (pageNumber === 0) {
					return filteredNewItems;
				} else {
					return [...prev, ...filteredNewItems];
				}
			});
		}
		setLoading(false);
	}, []);

	// 初期データの読み込み
	useEffect(() => {
		loadItems(0);
	}, [loadItems]);

	// 次のページを読み込む関数
	const loadNextPage = useCallback(() => {
		if (!loading && hasMore) {
			const nextPage = page + 1;
			setPage(nextPage);
			loadItems(nextPage);
		}
	}, [page, loading, hasMore, loadItems]);

	// Intersection Observer を使った無限スクロール
	useEffect(() => {
		// 既存のObserverを切断
		if (observerRef.current) {
			observerRef.current.disconnect();
		}

		observerRef.current = new IntersectionObserver(
			(entries) => {
				const target = entries[0];
				if (target.isIntersecting && !loading && hasMore) {
					loadNextPage();
				}
			},
			{
				rootMargin: '100px', // 100px手前で発火
				threshold: 0.1,
			},
		);

		const sentinel = document.getElementById('scroll-sentinel');
		if (sentinel && observerRef.current) {
			observerRef.current.observe(sentinel);
		}

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [loadNextPage, loading, hasMore]);

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-4">
						無限スクロール
					</h1>
					<p className="text-gray-600">
						スクロールすると自動的に新しいアイテムが読み込まれます。 現在{' '}
						{items.length} / {allItemsData.length} 件表示中
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{items.map((item) => (
						<div
							key={item.id}
							className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow animate-fade-in"
						>
							{/* 画像表示エリア */}
							<div className="relative w-full h-48 bg-gray-100">
								<Image
									src={item.image}
									alt={item.name}
									fill
									loading="lazy"
									className="object-cover"
									sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
								/>
							</div>

							{/* アイテム情報エリア */}
							<div className="p-4">
								<h3 className="text-lg font-semibold text-gray-800 text-center">
									{item.name}
								</h3>
							</div>
						</div>
					))}
				</div>

				{/* ローディング表示 */}
				{loading && (
					<div className="flex justify-center items-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<span className="ml-3 text-gray-600">読み込み中...</span>
					</div>
				)}

				{/* 終了メッセージ */}
				{!hasMore && items.length > 0 && (
					<div className="flex justify-center items-center py-8">
						<div className="text-center">
							<div className="text-2xl mb-2">🎉</div>
							<p className="text-gray-600 font-medium">
								すべてのアイテムを表示しました
							</p>
							<p className="text-sm text-gray-500">合計 {items.length} 件</p>
						</div>
					</div>
				)}

				{/* スクロール監視用の要素（見えない） */}
				{hasMore && <div id="scroll-sentinel" className="h-1" />}
			</div>
			<style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
		</div>
	);
}
