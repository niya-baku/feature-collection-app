import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Minus, Plus, X } from 'lucide-react';
import type { CartItem } from '@/types/cart';
import Image from 'next/image';

interface ShadcnCartModalProps {
	isOpen: boolean;
	onClose: () => void;
	cartItems: CartItem[];
	updateQuantity: (productId: number, quantity: number) => void;
	removeFromCart: (productId: number) => void;
}

export default function ShadcnCartModal({
	isOpen,
	onClose,
	cartItems,
	updateQuantity,
	removeFromCart,
}: ShadcnCartModalProps) {
	const totalPrice = cartItems.reduce(
		(sum, item) => sum + item.product.price * item.quantity,
		0,
	);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						🛒 カート ({cartItems.length}件)
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{cartItems.length === 0 ? (
						<p className="text-center text-gray-500 py-8">カートが空です</p>
					) : (
						<>
							{cartItems.map((item) => (
								<div
									key={item.product.id}
									className="flex items-center gap-4 p-4 border rounded-lg"
								>
									<Image
										width={64}
										height={64}
										src={item.product.image}
										alt={item.product.name}
										className="w-16 h-16 object-cover rounded"
									/>
									<div className="flex-1">
										<h3 className="font-semibold">{item.product.name}</h3>
										<p className="text-gray-600">
											¥{item.product.price.toLocaleString()}
										</p>
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												updateQuantity(item.product.id, item.quantity - 1)
											}
											disabled={item.quantity <= 1}
										>
											<Minus className="w-4 h-4" />
										</Button>
										<Badge variant="secondary" className="px-3">
											{item.quantity}
										</Badge>
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												updateQuantity(item.product.id, item.quantity + 1)
											}
										>
											<Plus className="w-4 h-4" />
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => removeFromCart(item.product.id)}
										>
											<X className="w-4 h-4" />
										</Button>
									</div>
								</div>
							))}

							<div className="border-t pt-4">
								<div className="flex justify-between items-center text-lg font-semibold">
									<span>合計:</span>
									<span>¥{totalPrice.toLocaleString()}</span>
								</div>
								<Button className="w-full mt-4" size="lg">
									レジに進む
								</Button>
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
