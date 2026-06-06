import { useState } from 'react';
import { X, Smartphone, CreditCard, Banknote } from 'lucide-react';
import { Food, PaymentMethod } from '../types';

interface AddSaleModalProps {
  food: Food;
  onConfirm: (paymentMethod: PaymentMethod) => void;
  onClose: () => void;
}

const methods: { value: PaymentMethod; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'pix', label: 'PIX', icon: <Smartphone size={20} />, color: 'border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { value: 'cartao', label: 'Cartão', icon: <CreditCard size={20} />, color: 'border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100' },
  { value: 'dinheiro', label: 'Dinheiro', icon: <Banknote size={20} />, color: 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100' },
];

export function AddSaleModal({ food, onConfirm, onClose }: AddSaleModalProps) {
  const [selected, setSelected] = useState<PaymentMethod | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div>
            <h2 className="font-bold text-stone-800 text-lg">Registrar Venda</h2>
            <p className="text-moss-700 font-semibold text-base">{food.name}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors p-1">
            <X size={22} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-stone-600 text-sm mb-4 font-medium">Forma de pagamento:</p>
          <div className="flex flex-col gap-3">
            {methods.map((m) => (
              <button
                key={m.value}
                onClick={() => setSelected(m.value)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 font-semibold text-sm transition-all duration-150 ${selected === m.value ? m.color + ' border-opacity-100 scale-[1.02]' : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300'}`}
              >
                {m.icon}
                {m.label}
                {selected === m.value && <span className="ml-auto text-xs">✓</span>}
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => selected && onConfirm(selected)}
              disabled={!selected}
              className="flex-1 py-2.5 rounded-xl bg-moss-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-moss-700 transition-colors active:scale-95"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
