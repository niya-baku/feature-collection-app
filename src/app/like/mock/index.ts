export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
}

export const mockPosts: Post[] = [
  {
    id: 1,
    title: 'Next.js 14の新機能について',
    content: 'Next.js 14がリリースされました！App Routerの安定化や新しい機能について紹介します。',
    author: '田中太郎',
    createdAt: '2024-01-15',
    likeCount: 24,
    isLiked: false,
  },
  {
    id: 2,
    title: 'TypeScriptのベストプラクティス',
    content: 'TypeScriptを使った開発でのベストプラクティスをまとめました。型安全性を保ちながら効率的に開発する方法をご紹介。',
    author: '山田花子',
    createdAt: '2024-01-14',
    likeCount: 18,
    isLiked: true,
  },
  {
    id: 3,
    title: 'React Hooksの活用術',
    content: 'useStateやuseEffectの基本から、カスタムフックの作成まで、React Hooksを効果的に使う方法を解説します。',
    author: '佐藤一郎',
    createdAt: '2024-01-13',
    likeCount: 31,
    isLiked: false,
  },
  {
    id: 4,
    title: 'TailwindCSSでモダンなUIを作る',
    content: 'TailwindCSSを使ってレスポンシブでモダンなUIを効率的に作成する方法をステップバイステップで説明します。',
    author: '鈴木美咲',
    createdAt: '2024-01-12',
    likeCount: 15,
    isLiked: false,
  },
];