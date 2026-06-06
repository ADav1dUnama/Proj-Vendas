import { useMemo } from 'react';
import { TrendingUp, Smartphone, CreditCard, Banknote, ShoppingBag } from 'lucide-react';
import { Food, Sale, FoodSalesStats } from '../types';

interface ReportsTabProps {
  foods: Food[];
  sales: Sale[];
}

export function ReportsTab({ foods, sales }: ReportsTabProps) {
  const stats = useMemo<FoodSalesStats[]>(() => {
    return foods.map((food) => {
      const foodSales = sales.filter((s) => s.food_id === food.id);
      const pix = foodSales.filter((s) => s.payment_method === 'pix').length;
      const cartao = foodSales.filter((s) => s.payment_method === 'cartao').length;
      const dinheiro = foodSales.filter((s) => s.payment_method === 'dinheiro').length;
      return {
        food,
        total: foodSales.length,
        pix,
        cartao,
        dinheiro,
        amount: foodSales.length * food.price,
      };
    });
  }, [foods, sales]);

  const totalAmount = stats.reduce((acc, s) => acc + s.amount, 0);
  const totalSales = sales.length;
  const totalPix = sales.filter((s) => s.payment_method === 'pix').length;
  const totalCartao = sales.filter((s) => s.payment_method === 'cartao').length;
  const totalDinheiro = sales.filter((s) => s.payment_method === 'dinheiro').length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Total Arrecadado"
          value={`R$ ${totalAmount.toFixed(2).replace('.', ',')}`}
          sub={`${totalSales} vendas`}
          icon={<TrendingUp size={20} />}
          accent="moss"
        />
        <SummaryCard
          label="PIX"
          value={String(totalPix)}
          sub={`R$ ${stats.reduce((a, s) => a + s.pix * s.food.price, 0).toFixed(2).replace('.', ',')}`}
          icon={<Smartphone size={20} />}
          accent="blue"
        />
        <SummaryCard
          label="Cartão"
          value={String(totalCartao)}
          sub={`R$ ${stats.reduce((a, s) => a + s.cartao * s.food.price, 0).toFixed(2).replace('.', ',')}`}
          icon={<CreditCard size={20} />}
          accent="amber"
        />
        <SummaryCard
          label="Dinheiro"
          value={String(totalDinheiro)}
          sub={`R$ ${stats.reduce((a, s) => a + s.dinheiro * s.food.price, 0).toFixed(2).replace('.', ',')}`}
          icon={<Banknote size={20} />}
          accent="green"
        />
      </div>

      {/* Per-food breakdown */}
      <div className="bg-white rounded-2xl shadow-md border border-stone-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h3 className="font-bold text-stone-800 flex items-center gap-2">
            <ShoppingBag size={18} className="text-moss-600" />
            Detalhamento por produto
          </h3>
        </div>
        <div className="divide-y divide-stone-50">
          {stats.map((s) => (
            <div key={s.food.id} className="px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-stone-800">{s.food.name}</span>
                <div className="text-right">
                  <span className="font-bold text-moss-700">
                    R$ {s.amount.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-stone-500 text-sm ml-2">({s.total} un.)</span>
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1 text-blue-600">
                  <Smartphone size={12} /> PIX: <strong>{s.pix}</strong>
                </span>
                <span className="flex items-center gap-1 text-amber-600">
                  <CreditCard size={12} /> Cartão: <strong>{s.cartao}</strong>
                </span>
                <span className="flex items-center gap-1 text-green-600">
                  <Banknote size={12} /> Dinheiro: <strong>{s.dinheiro}</strong>
                </span>
              </div>
              {s.total > 0 && (
                <div className="mt-2 h-1.5 bg-stone-100 rounded-full overflow-hidden flex">
                  {s.pix > 0 && (
                    <div className="bg-blue-400 h-full" style={{ width: `${(s.pix / s.total) * 100}%` }} />
                  )}
                  {s.cartao > 0 && (
                    <div className="bg-amber-400 h-full" style={{ width: `${(s.cartao / s.total) * 100}%` }} />
                  )}
                  {s.dinheiro > 0 && (
                    <div className="bg-green-400 h-full" style={{ width: `${(s.dinheiro / s.total) * 100}%` }} />
                  )}
                </div>
              )}
            </div>
          ))}
          {stats.every((s) => s.total === 0) && (
            <div className="px-5 py-10 text-center text-stone-400 text-sm">
              Nenhuma venda registrada ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: 'moss' | 'blue' | 'amber' | 'green';
}) {
  const styles = {
    moss: 'bg-moss-50 text-moss-700 border-moss-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    green: 'bg-green-50 text-green-700 border-green-200',
  };
  return (
    <div className={`rounded-2xl border p-4 ${styles[accent]}`}>
      <div className="flex items-center gap-1.5 mb-2 opacity-70">{icon}<span className="text-xs font-semibold">{label}</span></div>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="text-xs mt-1 opacity-70">{sub}</p>
    </div>
  );
}
