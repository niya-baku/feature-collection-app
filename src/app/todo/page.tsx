'use client';

import Header from '@/components/layout/Header';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import { mockTodos, type Todo } from './mock';
import { useEffect, useState } from 'react';

export default function TodoPage() {
	const [todos, setTodos] = useState<Todo[]>(mockTodos);

	useEffect(() => {
		const savedTodos = localStorage.getItem('todos');
		if (savedTodos) {
			setTodos(JSON.parse(savedTodos));
		}
	}, []);

	// 削除
	const handleDelete = (id: number) => {
		const updatedTodos = todos.filter((todo) => todo.id !== id);
		setTodos(updatedTodos);
		localStorage.setItem('todos', JSON.stringify(updatedTodos));
	};

	// 未完了・完了状態更新
	const handleToggle = (id: number) => {
		const updatedTodos = todos.map((todo) =>
			todo.id === id ? { ...todo, completed: !todo.completed } : todo,
		);
		setTodos(updatedTodos);
		localStorage.setItem('todos', JSON.stringify(updatedTodos));
	};

	const pendingTodos = todos.filter((todo) => !todo.completed);
	const completedTodos = todos.filter((todo) => todo.completed);

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-800 mb-4">TODO管理</h1>
						<p className="text-gray-600">タスクの追加・編集・削除・完了機能</p>
					</div>

					<div className="mb-8">
						<TodoForm todos={todos} setTodos={setTodos} />
					</div>

					<div className="space-y-6">
						<div className="bg-white rounded-lg shadow-md p-6">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-semibold text-gray-800">
									未完了のタスク
								</h2>
								<span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
									{pendingTodos.length}件
								</span>
							</div>

							{pendingTodos.length === 0 ? (
								<p className="text-gray-500 text-center py-8">
									未完了のタスクはありません
								</p>
							) : (
								<div className="space-y-3">
									{pendingTodos.map((todo) => (
										<TodoItem
											key={todo.id}
											todo={todo}
											onDelete={handleDelete}
											onToggle={handleToggle}
										/>
									))}
								</div>
							)}
						</div>

						<div className="bg-white rounded-lg shadow-md p-6">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-semibold text-gray-800">
									完了済みタスク
								</h2>
								<span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
									{completedTodos.length}件
								</span>
							</div>

							{completedTodos.length === 0 ? (
								<p className="text-gray-500 text-center py-8">
									完了済みのタスクはありません
								</p>
							) : (
								<div className="space-y-3">
									{completedTodos.map((todo) => (
										<TodoItem
											key={todo.id}
											todo={todo}
											onDelete={handleDelete}
											onToggle={handleToggle}
										/>
									))}
								</div>
							)}
						</div>
					</div>

					<div className="mt-8 bg-white rounded-lg shadow-md p-6">
						<h2 className="text-lg font-semibold mb-4">TODO機能の説明</h2>
						<div className="space-y-2 text-sm text-gray-600">
							<p>• 新しいタスクを追加できます</p>
							<p>• チェックボックスでタスクの完了状態を切り替えできます</p>
							<p>• 編集ボタンでタスクの内容を変更できます</p>
							<p>• 削除ボタンでタスクを削除できます</p>
							<p>• 完了済みと未完了でタスクが分けて表示されます</p>
							<p>※ 現在はUIのみの実装です</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
