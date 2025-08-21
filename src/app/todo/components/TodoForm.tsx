'use client';

import { type Dispatch, type SetStateAction, useState, type FC } from 'react';
import type { Todo } from '../mock';

interface TodoItemProps {
	todos: Todo[];
	setTodos: Dispatch<SetStateAction<Todo[]>>;
}

const TodoForm: FC<TodoItemProps> = ({ todos, setTodos }) => {
	const [inputValue, setInputValue] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const maxId = todos.reduce((max, todo) => Math.max(max, todo.id), 0);

		const newTodo = {
			id: maxId + 1, // 最大ID + 1
			text: inputValue.trim(),
			completed: false,
			createdAt: new Date().toISOString(),
		};

		const updatedTodos = [...todos, newTodo];
		setTodos(updatedTodos);
		localStorage.setItem('todos', JSON.stringify(updatedTodos));
		setInputValue('');
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<h2 className="text-xl font-semibold text-gray-800 mb-4">
				新しいタスクを追加
			</h2>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="todo-input"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						タスク内容
					</label>
					<div className="flex gap-3">
						<input
							id="todo-input"
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							placeholder="例: 買い物に行く"
							className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
						/>
						<button
							type="submit"
							disabled={!inputValue.trim()}
							className={`px-6 py-2 rounded-lg font-medium transition-colors ${
								inputValue.trim()
									? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
									: 'bg-gray-300 text-gray-500 cursor-not-allowed'
							}`}
						>
							追加
						</button>
					</div>
				</div>

				<div className="text-sm text-gray-500">
					<p>• 空白のタスクは追加できません</p>
					<p>• Enterキーで素早く追加できます</p>
				</div>
			</form>
		</div>
	);
};

export default TodoForm;
