import type { Todo } from '../mock';

interface TodoItemProps {
	todo: Todo;
	onDelete: (id: number) => void;
	onToggle: (id: number) => void;
}

export default function TodoItem({ todo, onDelete, onToggle }: TodoItemProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ja-JP', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	return (
		<div
			className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
				todo.completed
					? 'bg-gray-50 border-gray-200'
					: 'bg-white border-gray-300 hover:border-blue-300'
			}`}
		>
			<input
				type="checkbox"
				checked={todo.completed}
				onChange={() => onToggle(todo.id)}
				className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
			/>

			<div className="flex-1">
				<p
					className={`text-sm font-medium transition-colors ${
						todo.completed ? 'text-gray-500 line-through' : 'text-gray-900'
					}`}
				>
					{todo.text}
				</p>
				<p className="text-xs text-gray-400 mt-1">
					作成日: {formatDate(todo.createdAt)}
				</p>
			</div>

			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => {}}
					className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
					title="編集"
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
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
				</button>

				<button
					type="button"
					onClick={() => onDelete(todo.id)}
					className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
					title="削除"
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
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
}
