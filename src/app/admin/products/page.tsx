'use client';
// src/app/admin/products/page.tsx
import { useEffect, useState } from 'react';
import { Product, CATEGORY_LABELS } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

type ProductForm = Omit<Product, 'id'>;
const EMPTY_FORM: ProductForm = {
  name: '', description: '', price: 0, imageUrl: '', category: 'CAKE', available: true,
};

export default function ProductsPage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [modal,    setModal]      = useState(false);
  const [editing,  setEditing]    = useState<Product | null>(null);
  const [form,     setForm]       = useState<ProductForm>(EMPTY_FORM);
  const [saving,   setSaving]     = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function loadProducts() {
    setLoading(true);
    const res  = await fetch('/api/products');
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadProducts(); }, []);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setImageFile(null); setModal(true); }
  function openEdit(p: Product) { setEditing(p); setForm({ name: p.name, description: p.description, price: p.price, imageUrl: p.imageUrl, category: p.category, available: p.available }); setImageFile(null); setModal(true); }

  async function handleSave() {
    if (!form.name || !form.description || !form.price) {
    toast.error('Preencha todos os campos obrigatórios');
    return;
  }

  setSaving(true);

  try {
    let imageUrl = form.imageUrl;

    if (imageFile) {
      const uploadForm = new FormData();

      uploadForm.append('file', imageFile);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm,
      });

      if (!uploadRes.ok) {
        throw new Error('Erro ao enviar imagem');
      }

      const uploadData = await uploadRes.json();

      imageUrl = uploadData.url;
    }

    if (!imageUrl && !imageFile) {
      toast.error('Selecione uma imagem');
      return;
    }

    const url = editing
      ? `/api/products/${editing.id}`
      : '/api/products';

    const method = editing ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...form,
        imageUrl,
        price: Number(form.price),
      }),
    });

    if (!res.ok) {
      throw new Error();
    }

    toast.success(
      editing
        ? 'Produto atualizado!'
        : 'Produto criado!'
    );

    setModal(false);

    loadProducts();
  } catch (error) {
    console.error(error);
    toast.error('Erro ao salvar produto');
  } finally {
    setSaving(false);
  }
    //if (!form.name || !form.description || !form.price) {
    //  toast.error('Preencha todos os campos obrigatórios');
    //  return;
    //}
    //setSaving(true);
    //try {
    //  const url    = editing ? `/api/products/${editing.id}` : '/api/products';
    //  const method = editing ? 'PATCH' : 'POST';
    //  const res    = await fetch(url, {
    //    method,
    //    headers: { 'Content-Type': 'application/json' },
    //    body:    JSON.stringify({ ...form, price: Number(form.price) }),
    //  });
    //  if (!res.ok) throw new Error();
    //  toast.success(editing ? 'Produto atualizado!' : 'Produto criado!');
    //  setModal(false);
    //  loadProducts();
    //} catch {
    //  toast.error('Erro ao salvar produto');
    //} finally {
    //  setSaving(false);
    //}
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Produto excluído!'); loadProducts(); }
    else toast.error('Erro ao excluir produto');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title mb-1">Produtos</h1>
          <p className="font-body text-espresso/50">Gerencie o cardápio</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-espresso/30 font-body">Carregando...</div>
      ) : (
        <div className="grid gap-4">
          {products.map(p => (
            <div key={p.id} className="card p-4 flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-bold text-espresso">{p.name}</p>
                  <span className="text-xs bg-cream-warm px-2 py-0.5 rounded-full text-espresso/60">
                    {CATEGORY_LABELS[p.category]}
                  </span>
                  {!p.available && <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full">Indisponível</span>}
                </div>
                <p className="font-body text-sm text-espresso/50 truncate mt-0.5">{p.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-display font-bold text-rose">{formatPrice(p.price)}</span>
                <button onClick={() => openEdit(p)} className="text-espresso/40 hover:text-espresso transition-colors p-1">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="text-espresso/40 hover:text-red-500 transition-colors p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-espresso/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-cream-deep flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">{editing ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setModal(false)} className="text-espresso/40 hover:text-espresso"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'Nome',        key: 'name',        type: 'text',   ph: 'Ex: Bolo de Chocolate' },
                //{ label: 'URL da Imagem', key: 'imageUrl',  type: 'url',    ph: 'https://...' },
                { label: 'Preço (R$)',  key: 'price',       type: 'number', ph: '0.00' },
              ].map(({ label, key, type, ph }) => (
                <div key={key}>
                  <label className="font-body text-sm font-bold text-espresso/70 mb-1 block">{label}</label>
                  <input
                    type={type}
                    step={type === 'number' ? '0.01' : undefined}
                    className="input-field"
                    placeholder={ph}
                    value={form[key as keyof ProductForm] as string | number}
                    onChange={e => setForm({ ...form, [key]: type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                  />
                </div>
                
              ))}
              <div>
                  <label className="font-body text-sm font-bold text-espresso/70 mb-1 block">
                    Foto do Produto
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    className="input-field"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) {
                        setImageFile(file);
                      }
                    }}
                  />
                    {imageFile && (
                      <p className="text-sm text-green-600 mt-2">
                        Arquivo selecionado: {imageFile.name}
                      </p>
                    )}
              </div>
              <div>
                <label className="font-body text-sm font-bold text-espresso/70 mb-1 block">Descrição</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Descreva o produto..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="font-body text-sm font-bold text-espresso/70 mb-1 block">Categoria</label>
                <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-rose"
                  checked={form.available}
                  onChange={e => setForm({ ...form, available: e.target.checked })}
                />
                <span className="font-body text-sm text-espresso/70">Produto disponível</span>
              </label>
            </div>
            <div className="p-5 border-t border-cream-deep flex gap-3">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
