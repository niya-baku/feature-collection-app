import type { Post } from '../mock';
import LikeButton from './LikeButton';

interface PostCardProps {
	post: Post;
	onLike: () => void;
}

export default function PostCard({ post, onLike }: PostCardProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ja-JP', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	return (
		<article className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
			<header className="mb-4">
				<h2 className="text-xl font-semibold text-gray-800 mb-2">
					{post.title}
				</h2>
				<div className="flex items-center text-sm text-gray-500">
					<span className="font-medium">{post.author}</span>
					<span className="mx-2">•</span>
					<time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
				</div>
			</header>

			<div className="mb-4">
				<p className="text-gray-700 leading-relaxed">{post.content}</p>
			</div>

			<footer className="flex items-center justify-between pt-4 border-t border-gray-100">
				<LikeButton
					isLiked={post.isLiked}
					likeCount={post.likeCount}
					onLike={onLike}
				/>

				<div className="flex items-center gap-4 text-sm text-gray-500">
					<button
						type="button"
						className="flex items-center gap-1 hover:text-gray-700 transition-colors"
					>
						<svg
							role="img"
							aria-label="title"
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
							/>
						</svg>
						コメント
					</button>

					<button
						type="button"
						className="flex items-center gap-1 hover:text-gray-700 transition-colors"
					>
						<svg
							role="img"
							aria-label="title"
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
							/>
						</svg>
						共有
					</button>
				</div>
			</footer>
		</article>
	);
}
