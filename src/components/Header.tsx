import { Briefcase } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-moss-700 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
        <div className="bg-moss-600 rounded-full p-2">
          <Briefcase size={24} className="text-moss-100" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight">
            Mais controle para seu negocio!
          </h1>
          <p className="text-moss-200 text-sm font-medium">Registre cada venda e acompanhe seus resultados</p>
        </div>
      </div>
    </header>
  );
}
