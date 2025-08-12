import Link from "next/link";


export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600">
            機能集
          </Link>
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            トップに戻る
          </Link>
        </nav>
      </div>
    </header>
  )
}