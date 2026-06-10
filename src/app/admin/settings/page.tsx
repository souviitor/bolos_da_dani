'use client';
// src/app/admin/settings/page.tsx
import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface SettingsForm {
  pix_key:         string;
  pix_name:        string;
  whatsapp_number: string;
}

export default function SettingsPage() {
  const [form,    setForm]    = useState<SettingsForm>({ pix_key: '', pix_name: '', whatsapp_number: '' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => setForm({
        pix_key:         data.pix_key ?? '',
        pix_name:        data.pix_name ?? '',
        whatsapp_number: data.whatsapp_number ?? '',
      }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      if (res.ok) toast.success('Configurações salvas!');
      else        toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-espresso/30 font-body">Carregando...</div>;

  return (
    <div className="max-w-xl">
      <h1 className="section-title mb-2">Configurações</h1>
      <p className="font-body text-espresso/50 mb-8">Gerencie a chave PIX e contato</p>

      <div className="card p-6 space-y-6">
        {/* PIX */}
        <div>
          <h2 className="font-display font-bold text-espresso mb-4">Pagamento PIX</h2>
          <div className="space-y-4">
            <div>
              <label className="font-body text-sm font-bold text-espresso/70 mb-1 block">Chave PIX</label>
              <input
                className="input-field"
                placeholder="CPF, email, telefone ou chave aleatória"
                value={form.pix_key}
                onChange={e => setForm({ ...form, pix_key: e.target.value })}
              />
              <p className="text-xs text-espresso/40 mt-1">Esta chave aparece no QR Code e no Copia e Cola.</p>
            </div>
            <div>
              <label className="font-body text-sm font-bold text-espresso/70 mb-1 block">Nome do Beneficiário</label>
              <input
                className="input-field"
                placeholder="Ex: Danielle Oliveira"
                value={form.pix_name}
                onChange={e => setForm({ ...form, pix_name: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-cream-deep" />

        {/* WhatsApp */}
        <div>
          <h2 className="font-display font-bold text-espresso mb-4">WhatsApp</h2>
          <div>
            <label className="font-body text-sm font-bold text-espresso/70 mb-1 block">Número do WhatsApp</label>
            <input
              className="input-field"
              placeholder="5511999999999"
              value={form.whatsapp_number}
              onChange={e => setForm({ ...form, whatsapp_number: e.target.value })}
            />
            <p className="text-xs text-espresso/40 mt-1">
              Formato internacional: código do país + DDD + número (sem espaços ou símbolos).
              <br />Ex: 5511987654321
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Save className="w-4 h-4" /> Salvar Configurações</>}
        </button>
      </div>
    </div>
  );
}
