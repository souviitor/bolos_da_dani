'use client';
// src/components/products/ProductCard.tsx
import Image from 'next/image';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props { product: Product }

export default function ProductCard({ product }: Props) {
  const [qty, setQty] = useState(1);
  const { addItem, items, updateQty } = useCart();

  const cartItem = items.find(i => i.product.id === product.id);

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) addItem(product);
    toast.success(`${product.name} adicionado ao carrinho!`, {
      icon: '🛒',
    });
    setQty(1);
  }

  return (
    <div className="card group flex flex-col hover:shadow-md transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/20 to-transparent" />
        {cartItem && (
          <div className="absolute top-3 right-3 bg-rose text-white text-xs font-bold px-2 py-1 rounded-full">
            {cartItem.quantity} no carrinho
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-espresso leading-snug">{product.name}</h3>
          <p className="font-body text-sm text-espresso/60 mt-1 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="mt-auto pt-3 border-t border-cream-deep flex items-center justify-between">
          <span className="font-display text-xl font-bold text-rose">{formatPrice(product.price)}</span>
        </div>

        {/* Qty + Add */}
        <div className="flex items-center gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center bg-cream-warm rounded-xl overflow-hidden border border-cream-deep">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-9 h-9 flex items-center justify-center hover:bg-cream-deep transition-colors text-espresso/70 hover:text-espresso"
              aria-label="Diminuir"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-9 text-center font-body font-bold text-espresso text-sm select-none">
              {qty}
            </span>
            <button
              onClick={() => setQty(q => q + 1)}
              className="w-9 h-9 flex items-center justify-center hover:bg-cream-deep transition-colors text-espresso/70 hover:text-espresso"
              aria-label="Aumentar"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 bg-rose text-white font-body font-bold text-sm py-2.5 px-3 rounded-xl hover:bg-rose-dark transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Adicionar
          </button>
        </div>

        {/* Cart qty controls when already in cart */}
        {cartItem && (
          <div className="flex items-center justify-between text-xs bg-rose/10 rounded-lg px-3 py-2">
            <span className="text-rose font-medium">No carrinho: {cartItem.quantity} un.</span>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(product.id, cartItem.quantity - 1)} className="text-rose hover:text-rose-dark">
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-rose font-bold">{cartItem.quantity}</span>
              <button onClick={() => updateQty(product.id, cartItem.quantity + 1)} className="text-rose hover:text-rose-dark">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
