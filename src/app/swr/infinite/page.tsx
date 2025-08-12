'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { useInfiniteProductsFromJSON } from '@/hooks/useInfiniteProducts';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { Product, CartItem } from '@/types/api';
import ShadcnCartModal from '../ShadcnCartModal';

export default function SWRInfinitePage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    products,
    total,
    hasMore,
    isEmpty,
    isLoading,
    error,
    loadMore,
    mutate,
    size
  } = useInfiniteProductsFromJSON({ limit: 6 });

  const { sentinelId } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore,
    rootMargin: '0px 0px 100px 0px',
    threshold: 0.1,
  });

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) =>
      prev.filter((item) => item.product.id !== productId),
    );
  };

  const cartItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              SWR Infinite Scroll
            </h1>
            <div className="flex gap-2">
              <Link
                href="/swr"
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors inline-flex items-center"
              >
                SWRデモに戻る
              </Link>
              <button
                type="button"
                onClick={() => mutate()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                データを再取得
              </button>
            </div>
          </div>

          {/* 状態表示 */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">読み込み状況</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className={`p-2 rounded ${isLoading ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                <span className="font-medium">Loading: </span>
                <span className={isLoading ? 'text-yellow-600' : 'text-gray-600'}>
                  {isLoading ? 'true' : 'false'}
                </span>
              </div>
              <div className="p-2 rounded bg-green-100">
                <span className="font-medium">表示中: </span>
                <span className="text-green-600">
                  {products.length} / {total}件
                </span>
              </div>
              <div className="p-2 rounded bg-blue-100">
                <span className="font-medium">ページ: </span>
                <span className="text-blue-600">{size}</span>
              </div>
              <div className={`p-2 rounded ${hasMore ? 'bg-purple-100' : 'bg-gray-100'}`}>
                <span className="font-medium">続きあり: </span>
                <span className={hasMore ? 'text-purple-600' : 'text-gray-600'}>
                  {hasMore ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="fixed top-4 right-4 z-40">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="relative bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                role="img"
                aria-label="cart"
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 6H3m4 7v4a2 2 0 002 2h8a2 2 0 002-2v-4m-5-4v4m-4-4v4"
                />
              </svg>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </button>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-red-800 mb-2">エラー</h3>
              <p className="text-red-700">{error.message}</p>
            </div>
          )}

          {/* 空状態 */}
          {isEmpty && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">商品が見つかりませんでした。</p>
            </div>
          )}

          {/* 商品一覧 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow animate-fade-in"
              >
                <div className="relative w-full h-48 bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`;
                    }}
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                      ¥{product.price.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                      <svg
                        role="image"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      カートに追加
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ローディング表示 */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">読み込み中...</span>
            </div>
          )}

          {/* 終了メッセージ */}
          {!hasMore && products.length > 0 && (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="text-2xl mb-2">🎉</div>
                <p className="text-gray-600 font-medium">
                  すべての商品を表示しました
                </p>
                <p className="text-sm text-gray-500">合計 {products.length} 件</p>
              </div>
            </div>
          )}

          {/* スクロール監視用の要素 */}
          {hasMore && products.length > 0 && (
            <div id={sentinelId} className="h-1 mt-8" />
          )}
        </div>
      </div>

      {isModalOpen && (
        <ShadcnCartModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cartItems={cartItems}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
        />
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}