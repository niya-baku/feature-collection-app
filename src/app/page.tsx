import Link from 'next/link';

const features = [
	{
		title: '無限スクロール',
		description: 'スクロールに応じてコンテンツを動的に読み込みます',
		href: '/infinite-scroll',
		color: 'bg-blue-500 hover:bg-blue-600',
	},
	{
		title: 'ECサイトカート',
		description: '商品をカートに追加・削除する機能',
		href: '/cart',
		color: 'bg-green-500 hover:bg-green-600',
	},
	{
		title: 'TODO管理',
		description: 'タスクの追加・編集・削除・完了機能',
		href: '/todo',
		color: 'bg-yellow-500 hover:bg-yellow-600',
	},
	{
		title: 'いいね機能',
		description: '投稿にいいねをつける機能',
		href: '/like',
		color: 'bg-red-500 hover:bg-red-600',
	},
	{
		title: 'MSWデモ',
		description: 'モックサーバーを使用したAPI通信デモ',
		href: '/msw',
		color: 'bg-purple-500 hover:bg-purple-600',
	},
	{
		title: 'SWRデモ',
		description: 'SWRを使用したデータフェッチングデモ',
		href: '/swr',
		color: 'bg-indigo-500 hover:bg-indigo-600',
	},
	{
		title: 'TanStack Queryデモ',
		description: 'TanStack Queryを使用したデータフェッチングデモ',
		href: '/tanstack',
		color: 'bg-indigo-800 hover:bg-indigo-900',
	},
];

export default function Home() {
	return (
		<div className="min-h-screen bg-gray-100">
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
					よくある機能集
				</h1>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
					{features.map((feature) => (
						<Link
							key={feature.href}
							href={feature.href}
							className={`${feature.color} text-white rounded-lg p-6 shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl`}
						>
							<h2 className="text-xl font-semibold mb-3">{feature.title}</h2>
							<p className="text-gray-100">{feature.description}</p>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
