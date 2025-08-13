'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import type { Product, CartItem } from '@/types/api';
import { useProductsFromJSON } from './hooks/fetch';
import ShadcnCartModal from '@/components/ShadcnCartModal';

export default function TanStackQueryDemoPage() {
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { data: products, error, isLoading, refetch } = useProductsFromJSON();

	// カートに商品を追加
	const addToCart = (product: Product) => {
		setCartItems((prev) => {
			const existingItem = prev.find((item) => item.product.id === product.id);
			if (existingItem) {
				return prev.map((item) =>
					item.product.id === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item,
				);
			}
			return [...prev, { product, quantity: 1 }];
		});
	};

	// 数量を更新
	const updateQuantity = (productId: number, quantity: number) => {
		if (quantity < 0) {
			removeFromCart(productId);
			return;
		}
		setCartItems((prev) =>
			prev.map((item) =>
				item.product.id === productId ? { ...item, quantity } : item,
			),
		);
	};

	// カートから商品を削除
	const removeFromCart = (productId: number) => {
		setCartItems((prev) =>
			prev.filter((item) => item.product.id !== productId),
		);
	};

	const cartItemsCount = cartItems.reduce(
		(sum, item) => sum + item.quantity,
		0,
	);

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-3xl font-bold text-gray-800">TanStack Queryデモ</h1>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => refetch()}
								className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
							>
								データを再取得
							</button>
						</div>
					</div>

					{/* TanStack Queryの状態表示 */}
					<div className="bg-white rounded-lg shadow-md p-4 mb-6">
						<h2 className="text-lg font-semibold mb-2">TanStack Queryの状態</h2>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
							<div
								className={`p-2 rounded ${isLoading ? 'bg-yellow-100' : 'bg-gray-100'}`}
							>
								<span className="font-medium">Loading: </span>
								<span
									className={isLoading ? 'text-yellow-600' : 'text-gray-600'}
								>
									{isLoading ? 'true' : 'false'}
								</span>
							</div>
							<div
								className={`p-2 rounded ${error ? 'bg-red-100' : 'bg-gray-100'}`}
							>
								<span className="font-medium">Error: </span>
								<span className={error ? 'text-red-600' : 'text-gray-600'}>
									{error ? 'あり' : 'なし'}
								</span>
							</div>
							<div
								className={`p-2 rounded ${products ? 'bg-green-100' : 'bg-gray-100'}`}
							>
								<span className="font-medium">Data: </span>
								<span className={products ? 'text-green-600' : 'text-gray-600'}>
									{products ? `${products.length}件` : 'なし'}
								</span>
							</div>
							<div className="p-2 rounded bg-blue-100">
								<span className="font-medium">Cache Time: </span>
								<span className="text-blue-600">10分</span>
							</div>
						</div>
					</div>

					<div className="fixed top-4 right-4 z-40">
						<button
							type="button"
							onClick={() => setIsModalOpen(true)}
							className="relative bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
						>
							<svg
								role="img"
								aria-label="cart"
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 6H3m4 7v4a2 2 0 002 2h8a2 2 0 002-2v-4m-5-4v4m-4-4v4"
								/>
							</svg>
							{cartItemsCount > 0 && (
								<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
									{cartItemsCount > 99 ? '99+' : cartItemsCount}
								</span>
							)}
						</button>
					</div>

					{/* エラー表示 */}
					{error && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
							<h3 className="font-medium text-red-800 mb-2">エラー</h3>
							<p className="text-red-700">{error.message}</p>
						</div>
					)}

					{/* ローディング表示 */}
					{isLoading && (
						<div className="flex justify-center items-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
							<span className="ml-3 text-gray-600">読み込み中...</span>
						</div>
					)}

					{/* 商品一覧 */}
					{products && (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{products.map((product) => (
								<div
									key={product.id}
									className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
								>
									<div className="relative w-full h-48 bg-gray-100">
										<Image
											src={product.image}
											alt={product.name}
											fill
											className="object-cover"
											onError={(e) => {
												// 画像が見つからない場合のプレースホルダー
												e.currentTarget.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`;
											}}
										/>
									</div>
									<div className="p-4 flex flex-col flex-1">
										<h3 className="text-lg font-semibold mb-2">
											{product.name}
										</h3>
										<p className="text-gray-600 text-sm mb-3">
											{product.description}
										</p>
										<div className="flex items-center justify-between">
											<span className="text-xl font-bold text-blue-600">
												¥{product.price.toLocaleString()}
											</span>
											<button
												type="button"
												onClick={() => addToCart(product)}
												className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
											>
												<svg
													role="image"
													className="w-4 h-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M12 6v6m0 0v6m0-6h6m-6 0H6"
													/>
												</svg>
												カートに追加
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{isModalOpen && (
				<ShadcnCartModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					cartItems={cartItems}
					updateQuantity={updateQuantity}
					removeFromCart={removeFromCart}
				/>
			)}
		</div>
	);
}
