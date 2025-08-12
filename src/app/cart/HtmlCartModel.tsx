import Image from 'next/image';
import type { CartItem } from '@/types/cart';

interface HtmlCartModalProps {
	isOpen: boolean;
	onClose: () => void;
	cartItems: CartItem[];
	updateQuantity: (productId: number, quantity: number) => void;
	removeFromCart: (productId: number) => void;
}

export default function HtmlCartModal({
	isOpen,
	onClose,
	cartItems,
	updateQuantity,
	removeFromCart,
}: HtmlCartModalProps) {
	if (!isOpen) return null;

	const totalPrice = cartItems.reduce(
		(sum, item) => sum + item.product.price * item.quantity,
		0,
	);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* オーバーレイ - より強い透過設定 */}
			<div
				className="absolute inset-0 bg-black opacity-50"
				onClick={onClose}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						onClose();
					}
				}}
				role="button"
				tabIndex={0}
				aria-label="モーダルを閉じる"
			/>

			{/* モーダル本体 - より具体的なスタイル */}
			<div className="relative bg-white rounded-md border shadow-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
				{/* ヘッダー - テキストサイズとパディング調整 */}
				<div className="flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold leading-none tracking-tight">
							🛒 カート ({cartItems.length}件)
						</h2>
						<button
							type="button"
							onClick={onClose}
							className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 p-1"
						>
							<svg
								role="image"
								className="h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</div>

				{/* コンテンツ - パディング調整 */}
				<div className="p-6 pt-0 overflow-y-auto max-h-80">
					{cartItems.length === 0 ? (
						<p className="text-center text-slate-500 py-8">カートが空です</p>
					) : (
						<div className="space-y-4">
							{cartItems.map((item) => (
								<div
									key={item.product.id}
									className="flex items-center gap-4 p-4 rounded-lg border border-slate-200"
								>
									<Image
										src={item.product.image}
										alt={item.product.name}
										width={64}
										height={64}
										className="w-16 h-16 object-cover rounded"
									/>
									<div className="flex-1">
										<h3 className="font-semibold text-slate-900">
											{item.product.name}
										</h3>
										<p className="text-sm text-slate-500">
											¥{item.product.price.toLocaleString()}
										</p>
									</div>
									<div className="flex items-center gap-2">
										{/* マイナスボタン */}
										<button
											type="button"
											className="h-8 w-8 rounded-md border border-slate-200 bg-transparent hover:bg-slate-100 inline-flex items-center justify-center text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
											onClick={() =>
												updateQuantity(item.product.id, item.quantity - 1)
											}
											disabled={item.quantity <= 1}
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
													d="M20 12H4"
												/>
											</svg>
										</button>
										{/* 数量バッジ */}
										<div className="inline-flex items-center rounded-full border border-transparent bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-900 min-w-[2rem] justify-center">
											{item.quantity}
										</div>
										{/* プラスボタン */}
										<button
											type="button"
											className="h-8 w-8 rounded-md border border-slate-200 bg-transparent hover:bg-slate-100 inline-flex items-center justify-center text-sm font-medium"
											onClick={() =>
												updateQuantity(item.product.id, item.quantity + 1)
											}
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
										</button>
										{/* 削除ボタン */}
										<button
											type="button"
											className="h-8 w-8 rounded-md bg-red-500 text-white hover:bg-red-600 inline-flex items-center justify-center text-sm font-medium"
											onClick={() => removeFromCart(item.product.id)}
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
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* フッター */}
				{cartItems.length > 0 && (
					<div className="flex items-center p-6 pt-0">
						<div className="w-full">
							<div className="flex justify-between items-center text-lg font-semibold mb-4">
								<span>合計:</span>
								<span>¥{totalPrice.toLocaleString()}</span>
							</div>
							<button
								type="button"
								className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-slate-900 text-slate-50 hover:bg-slate-800 w-full"
							>
								レジに進む
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
