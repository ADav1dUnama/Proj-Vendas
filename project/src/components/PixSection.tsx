import { useState, useEffect, ChangeEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Save, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generatePixPayload } from '../lib/pixGenerator';
import { PixConfig } from '../types';

export function PixSection() {
  const [pixKey, setPixKey] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [saved, setSaved] = useState(false);
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedQrUrl, setUploadedQrUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('pix_config')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const cfg = data as PixConfig;
          setPixKey(cfg.pix_key);
          setMerchantName(cfg.merchant_name);
          setConfigId(cfg.id);
        }
      });
  }, []);

  const pixPayload = pixKey.trim() ? generatePixPayload(pixKey.trim(), merchantName) : '';

  function handleQrUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Selecione uma imagem de QR code válida.');
      setUploadedQrUrl(null);
      return;
    }

    setUploadError(null);
    const url = URL.createObjectURL(file);
    setUploadedQrUrl(url);
  }

  useEffect(() => {
    return () => {
      if (uploadedQrUrl) URL.revokeObjectURL(uploadedQrUrl);
    };
  }, [uploadedQrUrl]);

  async function handleSave() {
    if (!pixKey.trim()) return;
    setLoading(true);
    if (configId) {
      await supabase
        .from('pix_config')
        .update({ pix_key: pixKey.trim(), merchant_name: merchantName, updated_at: new Date().toISOString() })
        .eq('id', configId);
    } else {
      const { data } = await supabase
        .from('pix_config')
        .insert({ pix_key: pixKey.trim(), merchant_name: merchantName })
        .select()
        .maybeSingle();
      if (data) setConfigId((data as PixConfig).id);
    }
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-md border border-stone-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="bg-moss-100 rounded-full p-2">
            <Smartphone size={20} className="text-moss-700" />
          </div>
          <h2 className="text-lg font-bold text-stone-800">Configurar PIX</h2>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">
              Chave PIX (telefone, CPF, e-mail ou aleatória)
            </label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => { setPixKey(e.target.value); setSaved(false); }}
              placeholder="Seu pix aqui"
              className="w-full border-2 border-stone-200 rounded-xl px-3 py-2.5 text-stone-800 focus:outline-none focus:border-moss-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">
              Nome do beneficiário
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => { setMerchantName(e.target.value); setSaved(false); }}
              placeholder="Nome do vendedor ou empresa"
              className="w-full border-2 border-stone-200 rounded-xl px-3 py-2.5 text-stone-800 focus:outline-none focus:border-moss-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">
              Upload do QR Code
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleQrUpload}
              className="w-full text-sm text-stone-700 file:border-2 file:border-stone-200 file:rounded-xl file:px-3 file:py-2.5 file:bg-white file:text-stone-700 file:cursor-pointer"
            />
            {uploadError && (
              <p className="text-red-500 text-xs mt-1">{uploadError}</p>
            )}
            {uploadedQrUrl && (
              <div className="mt-3 rounded-2xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs text-stone-500 mb-2">Prévia do QR Code enviado:</p>
                <img
                  src={uploadedQrUrl}
                  alt="QR Code enviado"
                  className="w-full max-h-56 object-contain rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setUploadedQrUrl(null)}
                  className="mt-2 text-sm text-moss-700 font-semibold underline"
                >
                  Remover imagem
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!pixKey.trim() || loading}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-moss-600 text-white font-semibold disabled:opacity-40 hover:bg-moss-700 transition-colors active:scale-95"
          >
            {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {saved ? 'Salvo!' : loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        {uploadedQrUrl ? (
          <div className="mt-6 flex flex-col items-center gap-4 pt-6 border-t border-stone-100">
            <p className="text-sm font-semibold text-stone-700">QR Code enviado</p>
            <div className="bg-white border-4 border-moss-600 rounded-2xl p-3 shadow-md">
              <img
                src={uploadedQrUrl}
                alt="QR Code enviado"
                className="w-48 h-48 object-contain"
              />
            </div>
            <div className="w-full bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1 font-medium">Chave PIX:</p>
              <p className="text-sm text-stone-800 font-mono break-all">{pixKey}</p>
            </div>
          </div>
        ) : pixPayload ? (
          <div className="mt-6 flex flex-col items-center gap-4 pt-6 border-t border-stone-100">
            <p className="text-sm font-semibold text-stone-700">QR Code PIX</p>
            <div className="bg-white border-4 border-moss-600 rounded-2xl p-3 shadow-md">
              <QRCodeSVG
                value={pixPayload}
                size={200}
                bgColor="#ffffff"
                fgColor="#2d4f39"
                level="M"
              />
            </div>
            <div className="w-full bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1 font-medium">Chave PIX:</p>
              <p className="text-sm text-stone-800 font-mono break-all">{pixKey}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
