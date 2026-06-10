'use client';
// src/app/cart/page.tsx
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, updateQty, removeItem, totalPrice } = useCart();

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 min-h-[60vh]">
        <h1 className="section-title mb-8">Meu Carrinho</h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-16 h-16 text-espresso/20 mx-auto mb-4" />
            <p className="font-body text-espresso/50 text-lg mb-6">Seu carrinho está vazio.</p>
            <Link href="/#produtos" className="btn-primary">
              Ver Cardápio
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Items */}
            <div className="md:col-span-2 space-y-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="card flex gap-4 p-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-espresso truncate">{product.name}</h3>
                    <p className="font-body text-sm text-rose font-bold mt-1">{formatPrice(product.price)}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center bg-cream-warm rounded-xl overflow-hidden border border-cream-deep">
                        <button
                          onClick={() => updateQty(product.id, quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-cream-deep transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                        <button
                          onClick={() => updateQty(product.id, quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-cream-deep transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-body font-bold text-espresso text-sm">
                          {formatPrice(product.price * quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-espresso/30 hover:text-rose transition-colors"
                          aria-label="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="card p-6 h-fit sticky top-20">
              <h2 className="font-display text-xl font-bold text-espresso mb-4">Resumo</h2>
              <div className="space-y-2 mb-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-sm">
                    <span className="font-body text-espresso/70 truncate mr-2">{product.name} ×{quantity}</span>
                    <span className="font-body text-espresso font-medium shrink-0">{formatPrice(product.price * quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-cream-deep pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-body font-bold text-espresso">Total</span>
                  <span className="font-display text-2xl font-bold text-rose">{formatPrice(totalPrice)}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
                Finalizar Pedido
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/#produtos" className="block text-center text-sm text-espresso/50 hover:text-rose mt-4 transition-colors">
                Continuar comprando
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
