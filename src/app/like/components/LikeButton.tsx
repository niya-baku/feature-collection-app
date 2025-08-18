import { useState, useCallback } from 'react';

interface LikeButtonProps {
	isLiked: boolean;
	likeCount: number;
	onLike: () => void;
}

export default function LikeButton({
	isLiked,
	likeCount,
	onLike,
}: LikeButtonProps) {
	const [isProcessing, setIsProcessing] = useState(false);

	const handleClick = useCallback(async () => {
		if (isProcessing) return;

		setIsProcessing(true);
		onLike();

		setTimeout(() => {
			setIsProcessing(false);
		}, 300);
	}, [isProcessing, onLike]);

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={isProcessing}
			className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
				isProcessing
					? 'bg-gray-100 text-gray-400 cursor-not-allowed'
					: isLiked
						? 'bg-red-50 text-red-600 hover:bg-red-100'
						: 'bg-gray-50 text-gray-600 hover:bg-gray-100'
			}`}
		>
			{isProcessing ? (
				<div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
			) : (
				<svg
					role="img"
					aria-label="title"
					className={`w-5 h-5 transition-all duration-200 ${
						isLiked ? 'fill-red-500 text-red-500' : 'fill-none text-gray-400'
					}`}
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
					/>
				</svg>
			)}
			<span className="font-medium">{likeCount}</span>
		</button>
	);
}
