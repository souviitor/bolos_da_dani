'use client';
// src/app/checkout/page.tsx
import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import { ArrowRight, ArrowLeft, Upload, CheckCircle, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

type Step = 'info' | 'payment' | 'confirm';

interface CustomerForm {
  name:    string;
  phone:   string;
  address: string;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<Step>('info');
  const [form, setForm] = useState<CustomerForm>({ name: '', phone: '', address: '' });
  const [errors, setErrors] = useState<Partial<CustomerForm>>({});
  const [pixData, setPixData] = useState<{ qrCode: string; pixKey: string; pixName: string } | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Load PIX data
  useEffect(() => {
    if (step === 'payment' && !pixData) {
      fetch('/api/pix?amount=' + totalPrice)
        .then(r => r.json())
        .then(setPixData)
        .catch(() => toast.error('Erro ao carregar dados PIX'));
    }
  }, [step, pixData, totalPrice]);

  // Redirect if empty cart
  useEffect(() => {
    if (items.length === 0 && step === 'info') router.push('/cart');
  }, [items, router, step]);

  function validateForm(): boolean {
    const errs: Partial<CustomerForm> = {};
    if (!form.name.trim())    errs.name    = 'Nome obrigatório';
    if (!form.phone.trim())   errs.phone   = 'Telefone obrigatório';
    if (!form.address.trim()) errs.address = 'Endereço obrigatório';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleInfo() {
    if (validateForm()) setStep('payment');
  }

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    setReceipt(file);
    const reader = new FileReader();
    reader.onload = () => setReceiptPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  async function handleSubmitOrder() {
    if (!receipt) { toast.error('Por favor, faça upload do comprovante.'); return; }
    setSubmitting(true);

    try {
      // 1. Upload receipt
      const formData = new FormData();
      formData.append('file', receipt);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Falha no upload');
      const { url: receiptUrl } = await uploadRes.json();

      // 2. Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName:    form.name,
          customerPhone:   form.phone,
          deliveryAddress: form.address,
          items: items.map(i => ({
            productId: i.product.id,
            quantity:  i.quantity,
            price:     i.product.price,
            name:      i.product.name,
          })),
          totalAmount: totalPrice,
          receiptUrl,
          pixKey: pixData?.pixKey,
        }),
      });
      if (!orderRes.ok) throw new Error('Falha ao criar pedido');
      const { id, whatsappUrl } = await orderRes.json();

      setOrderId(id);
      setStep('confirm');
      clearCart();

      // Open WhatsApp
      setTimeout(() => { window.open(whatsappUrl, '_blank'); }, 1000);
    } catch (err) {
      toast.error('Erro ao finalizar pedido. Tente novamente.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 min-h-[70vh]">

        {/* Stepper */}
        {step !== 'confirm' && (
          <div className="flex items-center gap-2 mb-10">
            {(['info', 'payment'] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step === s ? 'bg-rose text-white shadow-md' : 
                  (s === 'info' && step === 'payment') ? 'bg-sage text-white' : 'bg-cream-deep text-espresso/40'
                }`}>
                  {s === 'info' && step === 'payment' ? '✓' : i + 1}
                </div>
                <span className={`text-sm font-body font-medium ${step === s ? 'text-espresso' : 'text-espresso/40'}`}>
                  {s === 'info' ? 'Seus Dados' : 'Pagamento'}
                </span>
                {i === 0 && <div className="flex-1 h-0.5 bg-cream-deep mx-2" />}
              </div>
            ))}
          </div>
        )}

        {/* ── Step 1: Customer Info ── */}
        {step === 'info' && (
          <div className="animate-fade-in">
            <h1 className="section-title mb-6">Seus Dados</h1>

            {/* Order summary */}
            <div className="card p-5 mb-6 bg-cream-warm">
              <h3 className="font-body font-bold text-sm text-espresso/60 uppercase tracking-wide mb-3">Resumo do Pedido</h3>
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm py-1">
                  <span className="font-body text-espresso/70">{product.name} ×{quantity}</span>
                  <span className="font-body font-medium">{formatPrice(product.price * quantity)}</span>
                </div>
              ))}
              <div className="border-t border-cream-deep mt-3 pt-3 flex justify-between">
                <span className="font-body font-bold">Total</span>
                <span className="font-display font-bold text-rose text-lg">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="font-body text-sm font-bold text-espresso/70 mb-1 block">Nome completo</label>
                <input
                  className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                  placeholder="Ex: Maria Silva"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="font-body text-sm font-bold text-espresso/70 mb-1 block">WhatsApp / Telefone</label>
                <input
                  className={`input-field ${errors.phone ? 'border-red-400' : ''}`}
                  placeholder="(11) 99999-9999"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="font-body text-sm font-bold text-espresso/70 mb-1 block">Endereço de entrega</label>
                <textarea
                  className={`input-field resize-none ${errors.address ? 'border-red-400' : ''}`}
                  rows={3}
                  placeholder="Rua, número, bairro, cidade"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
            </div>

            <button onClick={handleInfo} className="btn-primary w-full mt-8 flex items-center justify-center gap-2">
              Ir para Pagamento
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 2: PIX Payment ── */}
        {step === 'payment' && (
          <div className="animate-fade-in">
            <button onClick={() => setStep('info')} className="flex items-center gap-1 text-espresso/50 hover:text-espresso text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <h1 className="section-title mb-6">Pagamento via PIX</h1>

            <div className="card p-6 text-center mb-6">
              {!pixData ? (
                <div className="py-8 flex items-center justify-center gap-3 text-espresso/40">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-body">Gerando QR Code...</span>
                </div>
              ) : (
                <>
                  <p className="font-body text-espresso/60 text-sm mb-4">Escaneie o QR Code com seu aplicativo bancário</p>
                  <div className="flex justify-center mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pixData.qrCode} alt="QR Code PIX" className="w-48 h-48 rounded-xl border-4 border-cream-deep shadow" />
                  </div>
                  <p className="font-display text-2xl font-bold text-rose mb-4">{formatPrice(totalPrice)}</p>
                  <p className="font-body text-sm text-espresso/60 mb-2">Beneficiário: <strong className="text-espresso">{pixData.pixName}</strong></p>

                  <div className="bg-cream-warm rounded-xl p-4 mt-4">
                    <p className="font-body text-xs text-espresso/60 mb-2 uppercase tracking-wide font-bold">PIX Copia e Cola</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-espresso font-mono bg-white rounded-lg px-3 py-2 border border-cream-deep truncate">
                        {pixData.pixKey}
                      </code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(pixData.pixKey); toast.success('Chave PIX copiada!'); }}
                        className="shrink-0 bg-rose text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-rose-dark transition-colors"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Upload receipt */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-espresso mb-2">Comprovante de Pagamento</h3>
              <p className="font-body text-sm text-espresso/60 mb-4">Após realizar o pagamento, faça upload do comprovante para finalizar seu pedido.</p>

              {!receiptPreview ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragActive ? 'border-rose bg-rose/5' : 'border-cream-deep hover:border-rose hover:bg-rose/5'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 text-espresso/30 mx-auto mb-3" />
                  <p className="font-body text-espresso/60 text-sm">
                    {isDragActive ? 'Solte o arquivo aqui' : 'Arraste ou clique para enviar'}
                  </p>
                  <p className="font-body text-espresso/40 text-xs mt-1">JPG, PNG ou PDF • até 5MB</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative h-40 rounded-xl overflow-hidden border border-cream-deep">
                    <Image src={receiptPreview} alt="Comprovante" fill className="object-contain bg-cream-warm" />
                  </div>
                  <button
                    onClick={() => { setReceipt(null); setReceiptPreview(null); }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="font-body text-xs text-sage mt-2 text-center">✓ {receipt?.name}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={!receipt || submitting}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando pedido...</> : 'Confirmar Pedido'}
            </button>
          </div>
        )}

        {/* ── Step 3: Confirmation ── */}
        {step === 'confirm' && (
          <div className="animate-fade-in text-center py-10">
            <div className="w-20 h-20 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-sage" />
            </div>
            <h1 className="font-display text-3xl font-bold text-espresso mb-3">Pedido Confirmado!</h1>
            <p className="font-body text-espresso/60 mb-2">
              Obrigada, <strong>{form.name}</strong>! Seu pedido foi recebido com sucesso.
            </p>
            {orderId && (
              <p className="font-body text-xs text-espresso/40 mb-6">Pedido #{orderId.slice(-8).toUpperCase()}</p>
            )}
            <div className="card p-5 text-left mb-8">
              <p className="font-body text-sm text-espresso/70 leading-relaxed">
                📱 Um resumo do pedido foi enviado para o WhatsApp da Dani. <br/>
                Você receberá a confirmação em breve pelo número <strong>{form.phone}</strong>.
              </p>
            </div>
            <a href="/" className="btn-primary inline-flex items-center gap-2">
              Voltar ao início
            </a>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
