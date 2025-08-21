# TODO機能

タスクの追加・編集・削除・完了状態切り替えができる機能です。

## 実装概要

### 基本機能
- 新しいタスクの追加
- タスクの削除
- 完了状態のトグル（未完了↔完了）
- 完了済みと未完了でのセクション分け
- localStorageでのデータ永続化

## 実装手順

### 1. ID生成の実装
新しいTODOを追加する際のID生成方法：

```typescript
// 最大ID + 1 を使う方法（推奨）
const maxId = todos.reduce((max, todo) => Math.max(max, todo.id), 0);
const newTodo = {
  id: maxId + 1,  // 最大ID + 1
  text: inputValue.trim(),
  completed: false,
  createdAt: new Date().toISOString(),
};
```

**他の方法**:
- `Date.now()` - ミリ秒のタイムスタンプ
- `crypto.randomUUID()` - UUID（文字列ID）

### 2. 削除機能の実装

```typescript
// page.tsx - 削除関数
const handleDelete = (id: number) => {
  const updatedTodos = todos.filter(todo => todo.id !== id);
  setTodos(updatedTodos);
  localStorage.setItem('todos', JSON.stringify(updatedTodos));
};

// TodoItem.tsx - props型定義
interface TodoItemProps {
  todo: Todo;
  onDelete: (id: number) => void;
}

// 削除ボタン
<button onClick={() => onDelete(todo.id)}>削除</button>
```

### 3. 完了状態トグル機能の実装

```typescript
// page.tsx - トグル関数
const handleToggle = (id: number) => {
  const updatedTodos = todos.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  setTodos(updatedTodos);
  localStorage.setItem('todos', JSON.stringify(updatedTodos));
};

// TodoItem.tsx - チェックボックス
<input
  type="checkbox"
  checked={todo.completed}
  onChange={() => onToggle(todo.id)}
/>
```

## コンポーネント構成

```
src/app/todo/
├── page.tsx              # メインページ（状態管理・関数定義）
├── components/
│   ├── TodoForm.tsx      # タスク追加フォーム
│   └── TodoItem.tsx      # タスク表示・操作
├── mock.ts               # モックデータ・型定義
└── README.md            # このファイル
```

## 技術ポイント

### localStorageとJSON処理

**なぜJSON.parse/JSON.stringifyが必要？**

localStorageは**文字列のみ**保存可能：

```typescript
// ❌ これはできない
localStorage.setItem('todos', todos); // "[object Object]"

// ✅ 正解 - オブジェクトを文字列化
localStorage.setItem('todos', JSON.stringify(todos));

// 読み込み時は文字列 → オブジェクトに戻す
const savedTodos = localStorage.getItem('todos'); // 文字列
const parsedTodos = JSON.parse(savedTodos); // オブジェクト
```

### Props型定義のベストプラクティス

**setTodos関数の正しい型定義**：

```typescript
import { type Dispatch, type SetStateAction } from 'react';

interface Props {
  todos: Todo[];
  setTodos: Dispatch<SetStateAction<Todo[]>>; // 正式な型
  // または
  setTodos: (todos: Todo[]) => void; // シンプルな関数型
}
```

### 状態管理パターン

**コーディングテスト向け**：
- `useState` + `localStorage`
- シンプルで高速実装

**本格実装の選択肢**：
- Context API + useReducer（中規模）
- Redux Toolkit（複雑）  
- Zustand（軽量）
- TanStack Query（サーバー状態）

## 実装のメリット

- **データ永続化**: ブラウザを閉じても保持
- **リアルタイム更新**: 操作が即座に反映
- **型安全**: TypeScriptで型チェック
- **コンポーネント分離**: 再利用可能な設計
- **ユーザビリティ**: 直感的なUI操作