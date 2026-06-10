'use client';
// src/app/admin/dashboard/page.tsx
import { useEffect, useState } from 'react';
import { ShoppingBag, Package, TrendingUp, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Order, ORDER_STATUS_LABELS } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); })
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total:   orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    revenue: orders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + o.totalAmount, 0),
    today:   orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length,
  };

  const recent = orders.slice(0, 5);

  return (
    <div>
      <h1 className="section-title mb-2">Dashboard</h1>
      <p className="font-body text-espresso/50 mb-8">Visão geral dos pedidos e vendas</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total de Pedidos',   value: stats.total,   icon: ShoppingBag, color: 'text-rose',   bg: 'bg-rose/10' },
          { label: 'Aguardando',         value: stats.pending, icon: Clock,       color: 'text-gold',   bg: 'bg-gold/10' },
          { label: 'Receita Total',      value: formatPrice(stats.revenue), icon: TrendingUp, color: 'text-sage', bg: 'bg-sage/10' },
          { label: 'Pedidos Hoje',       value: stats.today,   icon: Package,     color: 'text-rose',   bg: 'bg-rose/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-body text-xs text-espresso/50 uppercase tracking-wide mb-1">{label}</p>
                <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="p-5 border-b border-cream-deep flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-espresso">Pedidos Recentes</h2>
          <Link href="/admin/orders" className="text-rose text-sm font-body hover:text-rose-dark transition-colors">
            Ver todos →
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-espresso/30 font-body">Carregando...</div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center text-espresso/30 font-body">Nenhum pedido ainda.</div>
        ) : (
          <div className="divide-y divide-cream-deep">
            {recent.map(order => (
              <div key={order.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-body font-bold text-espresso text-sm">{order.customerName}</p>
                  <p className="font-body text-xs text-espresso/50 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-body font-bold text-espresso text-sm">{formatPrice(order.totalAmount)}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    order.status === 'PENDING'   ? 'bg-gold/20 text-gold' :
                    order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-600' :
                    order.status === 'DELIVERED' ? 'bg-sage/20 text-sage' :
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-500' :
                    'bg-cream-deep text-espresso'
                  }`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
