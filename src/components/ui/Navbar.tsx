'use client';
// src/components/ui/Navbar.tsx
import Link from 'next/link';
import { ShoppingCart, Menu, X, Cake } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';

export default function Navbar() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-cream-deep shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-rose flex items-center justify-center shadow-sm group-hover:bg-rose-dark transition-colors">
              <Cake className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none">
              <span className="font-display text-xl font-bold text-espresso block">Bolos da Dani</span>
              <span className="font-body text-xs text-espresso/60 tracking-wide">feito com amor</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#produtos" className="font-body text-espresso/70 hover:text-rose transition-colors text-sm font-medium">
              Cardápio
            </Link>
            <Link href="/#sobre" className="font-body text-espresso/70 hover:text-rose transition-colors text-sm font-medium">
              Sobre
            </Link>
            <Link href="/#contato" className="font-body text-espresso/70 hover:text-rose transition-colors text-sm font-medium">
              Contato
            </Link>
          </div>

          {/* Cart + Mobile */}
          <div className="flex items-center gap-3">
            <Link href="/cart" className="relative p-2 rounded-xl hover:bg-cream-warm transition-colors">
              <ShoppingCart className="w-6 h-6 text-espresso" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose text-white text-xs font-bold rounded-full flex items-center justify-center animate-fade-in">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
            <button
              className="md:hidden p-2 rounded-xl hover:bg-cream-warm transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-cream-deep animate-fade-in">
            <div className="flex flex-col gap-3">
              {['/#produtos|Cardápio', '/#sobre|Sobre', '/#contato|Contato'].map(item => {
                const [href, label] = item.split('|');
                return (
                  <Link
                    key={href}
                    href={href}
                    className="font-body text-espresso/70 hover:text-rose py-2 px-2 rounded-lg hover:bg-cream-warm transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
