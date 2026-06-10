// src/components/ui/Footer.tsx
import { Cake, Instagram, Phone } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="contato" className="bg-espresso text-cream py-12 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-rose flex items-center justify-center">
                <Cake className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-cream">Bolos da Dani</span>
            </div>
            <p className="font-body text-cream/60 text-sm leading-relaxed">
              Cada bolo é uma história de afeto. Feitos à mão com ingredientes selecionados para tornar seus momentos especiais ainda mais doces.
            </p>
          </div>

          {/* Links */}
          <div id="sobre">
            <h3 className="font-display text-lg font-bold text-cream mb-4">Navegação</h3>
            <ul className="space-y-2">
              {[['/#produtos', 'Cardápio'], ['/cart', 'Carrinho'], ['/checkout', 'Finalizar Pedido']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="font-body text-cream/60 hover:text-rose-light transition-colors text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-bold text-cream mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-rose-light shrink-0" />
                <span className="font-body text-cream/60 text-sm">(11) 99999-9999</span>
              </li>
              <li className="flex items-center gap-3">
                <Instagram className="w-4 h-4 text-rose-light shrink-0" />
                <span className="font-body text-cream/60 text-sm">@bolosdadani</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-cream/10 text-center">
          <p className="font-body text-cream/40 text-xs">
            © {new Date().getFullYear()} Bolos da Dani. Feito com 🍰 e muito amor.
          </p>
        </div>
      </div>
    </footer>
  );
}
