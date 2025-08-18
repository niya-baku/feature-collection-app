'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import PostCard from './components/PostCard';
import { mockPosts, type Post } from './mock';

export default function LikePage() {
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

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-4">
						いいね機能デモ
					</h1>
					<p className="text-gray-600">
						投稿にいいねを付けたり外したりできます。
					</p>
				</div>

				<div className="space-y-6">
					{posts.map((post) => (
						<PostCard
							key={post.id}
							post={post}
							onLike={() => handleLike(post.id)}
						/>
					))}
				</div>

				<div className="mt-8 bg-white rounded-lg shadow-md p-6">
					<h2 className="text-lg font-semibold mb-4">いいね機能の説明</h2>
					<div className="space-y-2 text-sm text-gray-600">
						<p>
							• ハートボタンをクリックすることでいいねの追加・削除ができます
						</p>
						<p>• いいね状態は赤いハートで表示されます</p>
						<p>• 各投稿のいいね数がリアルタイムで更新されます</p>
						<p>• 連打防止機能により、300ms間は再クリックできません</p>
						<p>• 処理中はスピナーアイコンが表示されます</p>
						<p>
							•
							実際のアプリケーションでは、サーバーサイドでいいね状態を管理します
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
