import { useState, useEffect, useCallback } from 'react';
import { Plus, ShoppingBag, BarChart3, QrCode, AlertTriangle, User } from 'lucide-react';
import { mockDb } from './lib/mockDb';
import { Food, Sale, PaymentMethod } from './types';
import { Header } from './components/Header';
import { FoodCard } from './components/FoodCard';
import { AddSaleModal } from './components/AddSaleModal';
import { AddEditFoodModal } from './components/AddEditFoodModal';
import { ReportsTab } from './components/ReportsTab';
import { PixSection } from './components/PixSection';
import { UserProfile } from './components/UserProfile';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { useAuth } from './contexts/AuthContext';

type Tab = 'cardapio' | 'relatorio' | 'pix' | 'perfil';

function AppContent() {
  const [tab, setTab] = useState<Tab>('cardapio');
  const [foods, setFoods] = useState<Food[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const [saleTarget, setSaleTarget] = useState<Food | null>(null);
  const [editTarget, setEditTarget] = useState<Food | null | undefined>(undefined);
  const [showAddFood, setShowAddFood] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Food | null>(null);

  const loadData = useCallback(async () => {
    const foodsRes = mockDb.getFoods();
    const salesRes = mockDb.getSales();
    setFoods(foodsRes);
    setSales(salesRes);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAddSale(paymentMethod: PaymentMethod) {
    if (!saleTarget) return;
    const data = mockDb.addSale(saleTarget.id, paymentMethod);
    setSales((prev) => [data, ...prev]);
    setSaleTarget(null);
  }

  async function handleAddFood(formData: { name: string; price: number; image_url: string }) {
    const maxOrder = foods.reduce((m, f) => Math.max(m, f.display_order), 0);
    const data = mockDb.saveFood({ ...formData, display_order: maxOrder + 1 });
    setFoods((prev) => [...prev, data]);
    setShowAddFood(false);
  }

  async function handleEditFood(formData: { name: string; price: number; image_url: string }) {
    if (!editTarget) return;
    const data = mockDb.updateFood(editTarget.id, formData);
    if (data) setFoods((prev) => prev.map((f) => (f.id === editTarget.id ? data : f)));
    setEditTarget(undefined);
  }

  async function handleDeleteFood(food: Food) {
    mockDb.deleteFood(food.id);
    setFoods((prev) => prev.filter((f) => f.id !== food.id));
    setSales((prev) => prev.filter((s) => s.food_id !== food.id));
    setDeleteConfirm(null);
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'cardapio', label: 'Loja', icon: <ShoppingBag size={18} /> },
    { id: 'relatorio', label: 'Relatório', icon: <BarChart3 size={18} /> },
    { id: 'pix', label: 'PIX', icon: <QrCode size={18} /> },
    { id: 'perfil', label: 'Perfil', icon: <User size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      <div className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors duration-150 ${
                tab === t.id
                  ? 'border-moss-600 text-moss-700'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-moss-300 border-t-moss-600 rounded-full animate-spin" />
          </div>
        )}

        {!loading && tab === 'cardapio' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-stone-700 text-sm font-semibold uppercase tracking-wide">
                {foods.length} {foods.length === 1 ? 'produto' : 'produtos'} confirmados
              </h2>
              <button
                onClick={() => setShowAddFood(true)}
                className="flex items-center gap-2 bg-moss-600 hover:bg-moss-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors active:scale-95 shadow-sm"
              >
                <Plus size={16} />
                Novo Produto
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {foods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  sales={sales.filter((s) => s.food_id === food.id)}
                  onAddSale={(f) => setSaleTarget(f)}
                  onDelete={(f) => setDeleteConfirm(f)}
                  onEdit={(f) => setEditTarget(f)}
                />
              ))}
              {foods.length === 0 && (
                <div className="col-span-3 text-center py-16 text-stone-400">
                  <ShoppingBag size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Nenhum produto cadastrado.</p>
                  <p className="text-sm mt-1">Clique em "Novo produto" para começar.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && tab === 'relatorio' && <ReportsTab foods={foods} sales={sales} />}
        {!loading && tab === 'pix' && <PixSection />}
        {!loading && tab === 'perfil' && <UserProfile />}
      </main>

      {saleTarget && (
        <AddSaleModal
          food={saleTarget}
          onConfirm={handleAddSale}
          onClose={() => setSaleTarget(null)}
        />
      )}

      {showAddFood && (
        <AddEditFoodModal
          onConfirm={handleAddFood}
          onClose={() => setShowAddFood(false)}
        />
      )}

      {editTarget && (
        <AddEditFoodModal
          food={editTarget}
          onConfirm={handleEditFood}
          onClose={() => setEditTarget(undefined)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-2">
                <AlertTriangle size={22} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-stone-800">Remover produto</h3>
                <p className="text-stone-500 text-sm">Todas as vendas serão apagadas.</p>
              </div>
            </div>
            <p className="text-stone-700 text-sm mb-5">
              Tem certeza que deseja remover <strong>{deleteConfirm.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border-2 border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteFood(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors active:scale-95"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <Login onSwitchToSignUp={() => setIsLogin(false)} />
  ) : (
    <SignUp onSwitchToLogin={() => setIsLogin(true)} />
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-moss-600 to-moss-800 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-moss-200 rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <AppContent /> : <AuthContainer />;
}
