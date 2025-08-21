export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
}

export const mockTodos: Todo[] = [
  {
    id: 1,
    text: 'Next.jsのドキュメントを読む',
    completed: false,
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    text: 'TypeScriptの型定義を学習する',
    completed: true,
    createdAt: '2024-01-14',
  },
  {
    id: 3,
    text: 'Tailwind CSSでスタイリングを練習する',
    completed: false,
    createdAt: '2024-01-13',
  },
];