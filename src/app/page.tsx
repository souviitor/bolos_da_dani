// src/app/page.tsx
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ProductCard from '@/components/products/ProductCard';
import { Product, CATEGORY_LABELS } from '@/types';
import { Cake, Star, Truck, Clock } from 'lucide-react';
import Link from 'next/link';

async function getProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { available: true },
      orderBy: { createdAt: 'asc' },
    });
    return products as Product[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  const categories = Array.from(
    new Set(products.map((p) => p.category))
  );

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="relative bg-espresso overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #C9566B 0%, transparent 50%), radial-gradient(circle at 80% 20%, #D4A843 0%, transparent 50%)' }}
          />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-32 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="font-body text-rose-light text-sm font-medium tracking-widest uppercase mb-4">
                Feito com amor, toda semana
              </p>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-cream leading-tight mb-6">
                Bolos que contam<br />
                <span className="text-rose-light italic">histórias</span>
              </h1>
              <p className="font-body text-cream/70 text-lg leading-relaxed mb-8">
                Da nossa cozinha para a sua mesa. Bolos artesanais, salgados caseiros e pães fresquinhos — feitos à mão com ingredientes selecionados para adoçar cada momento.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#produtos" className="btn-primary text-center">
                  Ver Cardápio
                </Link>
                <Link href="/cart" className="btn-secondary text-center bg-transparent border-cream/40 text-cream hover:bg-cream hover:text-espresso">
                  Meu Carrinho
                </Link>
              </div>
            </div>

            {/* Floating badges */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-80 h-80">
                {[
                  { label: 'Artesanal', sub: '100%', top: '0', left: '50%', translate: '-translate-x(-50%)', color: 'bg-rose' },
                  { label: 'Entrega', sub: 'Rápida', top: '50%', left: '0', translate: '-translate-y(-50%)', color: 'bg-gold' },
                  { label: 'Encomendas', sub: 'Sob medida', top: '50%', right: '0', translate: '-translate-y(-50%)', color: 'bg-sage' },
                  { label: 'Ingredientes', sub: 'Frescos', bottom: '0', left: '50%', translate: '-translate-x(-50)', color: 'bg-espresso-medium' },
                ].map(({ label, sub, color, ...pos }) => (
                  <div key={label} className={`absolute ${color} rounded-2xl px-4 py-3 text-center shadow-lg`}
                    style={{ top: pos.top, left: pos.left, right: (pos as {right?: string}).right, bottom: pos.bottom, transform: pos.translate }}>
                    <p className="font-display text-xl font-bold text-white">{sub}</p>
                    <p className="font-body text-white/80 text-xs">{label}</p>
                  </div>
                ))}
                <div className="absolute inset-12 rounded-full border-2 border-dashed border-cream/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cake className="w-16 h-16 text-cream/30" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features strip ── */}
        <section className="bg-cream-warm border-y border-cream-deep">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Star,  title: 'Qualidade Premium',  sub: 'Ingredientes selecionados' },
                { icon: Cake,  title: '100% Artesanal',     sub: 'Feito à mão com cuidado' },
                { icon: Truck, title: 'Entrega em casa',    sub: 'Região metropolitana SP' },
                { icon: Clock, title: 'Encomendas',         sub: 'Personalizações disponíveis' },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-rose" />
                  </div>
                  <div>
                    <p className="font-body font-bold text-espresso text-sm">{title}</p>
                    <p className="font-body text-espresso/50 text-xs">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Products ── */}
        <section id="produtos" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <p className="font-body text-rose text-sm font-medium tracking-widest uppercase mb-2">Nosso Cardápio</p>
            <h2 className="section-title">Escolha seu favorito</h2>
            <p className="font-body text-espresso/60 mt-3 max-w-lg mx-auto">
              Todos os produtos são feitos por encomenda, com ingredientes frescos e muito carinho.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 text-espresso/40">
              <Cake className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-body">Nenhum produto disponível no momento.</p>
            </div>
          ) : (
            <>
              {categories.map(cat => (
                <div key={cat} className="mb-12">
                  <h3 className="font-display text-xl font-bold text-espresso mb-6 flex items-center gap-3">
                    <span className="w-8 h-0.5 bg-rose inline-block" />
                    {CATEGORY_LABELS[cat] ?? cat}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products
                      .filter(p => p.category === cat)
                      .map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                </div>
              ))}
            </>
          )}
        </section>

        {/* ── CTA ── */}
        <section className="bg-rose text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Pronto para adoçar seu dia?
            </h2>
            <p className="font-body text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Adicione ao carrinho e finalize seu pedido. Pagamento via PIX, rápido e seguro.
            </p>
            <Link href="#produtos" className="inline-block bg-white text-rose font-body font-bold px-8 py-4 rounded-xl hover:bg-cream transition-colors shadow-lg">
              Fazer Pedido Agora
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
