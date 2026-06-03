import { useState, useEffect, ChangeEvent } from 'react';
import { X, ImageIcon } from 'lucide-react';
import { Food } from '../types';

interface AddEditFoodModalProps {
  food?: Food | null;
  onConfirm: (data: { name: string; price: number; image_url: string }) => void;
  onClose: () => void;
}

export function AddEditFoodModal({ food, onConfirm, onClose }: AddEditFoodModalProps) {
  const [name, setName] = useState(food?.name ?? '');
  const [price, setPrice] = useState(food?.price?.toString() ?? '');
  const [imageUrl, setImageUrl] = useState(food?.image_url ?? '');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  const isEditing = !!food;
  const valid = name.trim() && parseFloat(price) > 0;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleConfirm() {
    if (!valid) return;
    onConfirm({
      name: name.trim(),
      price: parseFloat(price),
      image_url: imageUrl.trim(),
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h2 className="font-bold text-stone-800 text-lg">
            {isEditing ? 'Editar produto' : 'Novo produto'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1 transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {imageUrl && !imgError && (
            <div className="w-full h-36 rounded-xl overflow-hidden bg-stone-100">
              <img
                src={imageUrl}
                alt="Prévia"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">
              Nome do Produto *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mochila Grande"
              className="w-full border-2 border-stone-200 rounded-xl px-3 py-2.5 text-stone-800 focus:outline-none focus:border-moss-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">
              Preço (R$) *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.50"
              className="w-full border-2 border-stone-200 rounded-xl px-3 py-2.5 text-stone-800 focus:outline-none focus:border-moss-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <ImageIcon size={14} />
              Imagem do produto
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e)}
              className="w-full text-sm text-stone-700 file:border-2 file:border-stone-200 file:rounded-xl file:px-3 file:py-2.5 file:bg-white file:text-stone-700 file:cursor-pointer"
            />
            {imgError && imageUrl && (
              <p className="text-red-500 text-xs mt-1">Imagem inválida ou não carregou</p>
            )}
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!valid}
              className="flex-1 py-2.5 rounded-xl bg-moss-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-moss-700 transition-colors active:scale-95"
            >
              {isEditing ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
