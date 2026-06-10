'use client';
// src/app/admin/orders/page.tsx
import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { Order, OrderStatus, ORDER_STATUS_LABELS } from '@/types';
import { ExternalLink, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERED', 'CANCELLED'];

export default function OrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<string>('ALL');

  async function loadOrders() {
    setLoading(true);
    const url = filter === 'ALL' ? '/api/orders' : `/api/orders?status=${filter}`;
    const res  = await fetch(url);
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadOrders(); }, [filter]);

  async function updateStatus(id: string, status: OrderStatus) {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success('Status atualizado!');
      loadOrders();
    } else {
      toast.error('Erro ao atualizar status');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title mb-1">Pedidos</h1>
          <p className="font-body text-espresso/50">Gerencie todos os pedidos</p>
        </div>
        <button onClick={loadOrders} className="flex items-center gap-2 text-sm font-body text-espresso/60 hover:text-espresso transition-colors">
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {['ALL', ...STATUS_OPTIONS].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
              filter === s ? 'bg-rose text-white' : 'bg-cream-warm text-espresso/60 hover:text-espresso'
            }`}
          >
            {s === 'ALL' ? 'Todos' : ORDER_STATUS_LABELS[s as OrderStatus]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-espresso/30 font-body">Carregando pedidos...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-espresso/30 font-body">Nenhum pedido encontrado.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-display font-bold text-espresso">{order.customerName}</p>
                  <p className="font-body text-sm text-espresso/60">{order.customerPhone}</p>
                  <p className="font-body text-xs text-espresso/40 mt-1">{order.deliveryAddress}</p>
                  <p className="font-body text-xs text-espresso/30 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold text-rose">{formatPrice(order.totalAmount)}</p>
                  <p className="font-body text-xs text-espresso/40 mt-1">#{order.id.slice(-8).toUpperCase()}</p>
                </div>
              </div>

              {/* Items */}
              <div className="bg-cream-warm rounded-xl p-3 mb-4">
                {(order.items ?? []).map((item: { id: string; product: { name: string }; quantity: number; price: number }) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="font-body text-espresso/70">{item.product?.name} ×{item.quantity}</span>
                    <span className="font-body font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Receipt + Status */}
              <div className="flex flex-wrap items-center gap-3">
                {order.receiptUrl && !order.receiptUrl.startsWith('data:') && (
                  <a
                    href={order.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-rose font-bold hover:text-rose-dark transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Ver Comprovante
                  </a>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <span className="font-body text-xs text-espresso/50">Status:</span>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                    className="text-xs font-bold rounded-lg px-2 py-1.5 border border-cream-deep bg-white text-espresso focus:outline-none focus:border-rose"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
