import { useState } from 'react';
import { Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Food, Sale } from '../types';

interface FoodCardProps {
  food: Food;
  sales: Sale[];
  onAddSale: (food: Food) => void;
  onDelete: (food: Food) => void;
  onEdit: (food: Food) => void;
}

export function FoodCard({ food, sales, onAddSale, onDelete, onEdit }: FoodCardProps) {
  const [imgError, setImgError] = useState(false);

  const pix = sales.filter((s) => s.payment_method === 'pix').length;
  const cartao = sales.filter((s) => s.payment_method === 'cartao').length;
  const dinheiro = sales.filter((s) => s.payment_method === 'dinheiro').length;
  const total = sales.length;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-stone-100 flex flex-col group hover:shadow-lg transition-shadow duration-200">
      <div className="relative h-40 bg-stone-100 overflow-hidden cursor-pointer" onClick={() => onEdit(food)}>
        {food.image_url && !imgError ? (
          <img
            src={food.image_url}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-moss-50">
            <ShoppingBag size={48} className="text-moss-300" />
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(food); }}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
          title="Remover"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-stone-800 text-base leading-tight">{food.name}</h3>
          <span className="text-moss-700 font-bold text-base whitespace-nowrap ml-2">
            R$ {food.price.toFixed(2).replace('.', ',')}
          </span>
        </div>

        <div className="flex gap-2 mt-2 mb-3 text-xs">
          <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            PIX {pix}
          </span>
          <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Cartão {cartao}
          </span>
          <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Dinheiro {dinheiro}
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-stone-500 text-sm">
            <span className="font-bold text-stone-700 text-lg">{total}</span> vendidos
          </span>
          <button
            onClick={() => onAddSale(food)}
            className="flex items-center gap-1.5 bg-moss-600 hover:bg-moss-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors duration-150 active:scale-95"
          >
            <Plus size={16} />
            Vender
          </button>
        </div>
      </div>
    </div>
  );
}
