'use client';

import { useEffect, useState } from 'react';
import productsData from '@/app/cart/mock/products.json';
import type { UIMode, Product, CartItem } from '@/types/cart';
import Header from '@/components/layout/Header';
import Image from 'next/image';
import HtmlCartModal from './HtmlCartModel';
import ShadcnCartModal from './ShadcnCartModal';

export default function CartPage() {
	const [products] = useState<Product[]>(productsData);
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [uiMode, setUIMode] = useState<UIMode>('html-css');

	// ローカルストレージからカートデータを読み込み
	useEffect(() => {
		const savedCart = localStorage.getItem('cart');
		if (savedCart) {
			setCartItems(JSON.parse(savedCart));
		}
	}, []);

	useEffect(() => {
		localStorage.setItem('cart', JSON.stringify(cartItems));
	}, [cartItems]);

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
						<h1 className="text-3xl font-bold text-gray-800">
							ECサイト カート機能
						</h1>
						<div className="flex items-center gap-4">
							<label htmlFor="ui-mode" className="font-medium text-gray-700">
								UIモード:
							</label>
							<select
								id="ui-mode"
								value={uiMode}
								onChange={(e) => setUIMode(e.target.value as UIMode)}
								className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="html-css">HTML/CSS</option>
								<option value="shadcn">shadcn/ui</option>
							</select>
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
									<h3 className="text-lg font-semibold mb-2">{product.name}</h3>
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
				</div>
			</div>

			{uiMode === 'html-css' ? (
				<HtmlCartModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					cartItems={cartItems}
					updateQuantity={updateQuantity}
					removeFromCart={removeFromCart}
				/>
			) : (
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
