import React from "react";
import { Ocorrencia } from "../types";
import { Droplet, CheckCircle, Clock, MapPin, Sparkles, TrendingUp, Info } from "lucide-react";

interface DashboardProps {
  stats: any;
  ocorrencias: Ocorrencia[];
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({ stats, ocorrencias, onNavigateToTab }: DashboardProps) {
  // Let's perform a live analysis of the current state of occurrences
  const total = ocorrencias.length;
  const resolvidas = ocorrencias.filter((o) => o.status === "Resolvida").length;
  const emAnalise = ocorrencias.filter((o) => o.status === "Em Análise").length;
  const abertas = ocorrencias.filter((o) => o.status === "Aberta").length;
  const aprovadas = ocorrencias.filter((o) => o.status === "Aprovada").length;

  const percResolucoes = total > 0 ? Math.round((resolvidas / total) * 100) : 0;

  // Let's summarize categories of occurrences
  const categoryCount = ocorrencias.reduce((acc, current) => {
    acc[current.tipo] = (acc[current.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value);

  // Translate estimated liters to tangible units for citizen feedback:
  // Standard shower = 135 Litres, default household consumption = 150 Litres/day, standard water capsule/tank = 1000L
  const totalLitrosEconomizados = stats.economiaEstimadaLitros || 0;
  const caixasAguaEquivalentes = Math.floor(totalLitrosEconomizados / 1000);
  const banhosEconomizados = Math.floor(totalLitrosEconomizados / 135);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Message */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-12 -translate-y-12">
          <Droplet className="h-64 w-64 fill-current" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="bg-blue-500 text-blue-100 text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase border border-blue-400/30">
            Parceria Cidadã &bull; ODS 6
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-3">
            Gestão Hídrica Colaborativa
          </h1>
          <p className="text-blue-100 mt-2 text-sm sm:text-base leading-relaxed">
            O AquaCity conecta moradores à administração pública para acelerar a resposta a vazamentos. 
            Cada vazamento reportado e consertado evita o desperdício de milhares de litros de água tratada!
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateToTab("registrar")}
              className="bg-white text-blue-900 hover:bg-blue-50 transition-colors px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 shadow-xs cursor-pointer"
            >
              <Droplet className="h-4 w-4" />
              <span>Reportar Vazamento</span>
            </button>
            <button
              onClick={() => onNavigateToTab("educacional")}
              className="bg-blue-600/50 hover:bg-blue-600 text-white transition-colors px-4 py-2 rounded-xl text-sm font-semibold border border-blue-400/40 cursor-pointer"
            >
              <span>Aprender sobre ODS 6</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of 4 Key Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Ocorrências */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 font-medium text-xs">Total Reportado</span>
            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-extrabold text-gray-900">{total}</span>
            <span className="text-gray-400 text-xs font-medium">casos</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-2 flex items-center space-x-1">
            <span className="text-amber-600 font-semibold">{abertas} abertas</span>
            <span>&bull;</span>
            <span className="text-indigo-600 font-semibold">{emAnalise} analisando</span>
          </div>
        </div>

        {/* Ocorrências Resolvidas */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 font-medium text-xs">Resolvidos</span>
            <div className="bg-green-50 text-green-600 p-2 rounded-xl">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-extrabold text-green-600">{resolvidas}</span>
            <span className="text-gray-400 text-xs font-medium">concluídos</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-2">
            <span className="text-green-700 font-bold">{percResolucoes}% de eficiência</span> de reparo
          </div>
        </div>

        {/* Tempo de Resposta */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 font-medium text-xs">Tempo de Resposta</span>
            <div className="bg-gray-50 text-gray-600 p-2 rounded-xl">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-extrabold text-gray-800">1.8</span>
            <span className="text-gray-400 text-xs font-medium">dias</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 leading-none">Meta municipal: &lt; 2 dias</p>
        </div>

        {/* Economia Estimada Hídrica */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm hover:shadow-md transition-shadow bg-linear-to-b from-white to-blue-50/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 font-medium text-xs">Água Preservada</span>
            <div className="bg-cyan-50 text-cyan-600 p-2 rounded-xl">
              <Droplet className="h-4 w-4 fill-current text-cyan-600" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-700">
              {totalLitrosEconomizados.toLocaleString("pt-BR")}
            </span>
            <span className="text-gray-400 text-xs font-medium">L</span>
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-2 flex items-center space-x-0.5">
            <Sparkles className="h-3 w-3" />
            <span>Prevenção de purga hídrica</span>
          </div>
        </div>
      </div>

      {/* Main Environmental Calculator Section & Charts Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Dynamic Tank Level Reservoir */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 lg:col-span-1 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center space-x-2 text-sm">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>Reserva HidroEcológica Virtual</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Volume total de água que deixou de vazar graças aos consertos registrados.
            </p>

            {/* Simulated Water Glass Cylinder representation */}
            <div className="my-6 relative flex justify-center">
              <div className="w-28 h-44 bg-gray-100 rounded-3xl border-4 border-gray-300 relative overflow-hidden flex items-end">
                {/* Water Level Fluid Animation */}
                <div
                  className="w-full bg-blue-500 transition-all duration-1000 relative"
                  style={{ height: `${Math.min(20 + percResolucoes * 0.8, 100)}%` }}
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-blue-400 opacity-60 animate-pulse" />
                  <span className="absolute inset-0 flex items-center justify-center text-white font-extrabold text-xs">
                    {Math.max(20, percResolucoes)}% Cheio
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 text-xs space-y-2">
            <div className="flex items-center justify-between text-gray-600">
              <span>Caixas d'água salvas (1.000 L):</span>
              <span className="font-bold text-blue-700">{caixasAguaEquivalentes} u.</span>
            </div>
            <div className="flex items-center justify-between text-gray-600 mr-px">
              <span>Banhos domésticos de 5min:</span>
              <span className="font-bold text-blue-700">{banhosEconomizados} banhos</span>
            </div>
          </div>
        </div>

        {/* Right Side: Most Affected Neighborhoods + Issues Types Breakdown */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-6">
          {/* Header */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              Análise Geográfica de Criticidade
            </h3>
            <p className="text-xs text-gray-400">
              Distribuição das ocorrências por tipagem e bairros de São Paulo mais sinalizados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Neighborhoods List Progress Bars */}
            <div>
              <span className="text-xs font-bold text-gray-500 block mb-3 uppercase tracking-wider">
                Bairros Mais Reportados
              </span>
              <div className="space-y-3.5">
                {stats.bairrosMaisAfetados && stats.bairrosMaisAfetados.length > 0 ? (
                  stats.bairrosMaisAfetados.map((item: any, i: number) => {
                    // Normalize width for bar
                    const maxQty = Math.max(...stats.bairrosMaisAfetados.map((b: any) => b.quantidade));
                    const widthPercent = maxQty > 0 ? (item.quantidade / maxQty) * 100 : 0;
                    return (
                      <div key={item.nome} className="text-xs">
                        <div className="flex justify-between font-medium text-gray-700 mb-1">
                          <span>{item.nome}</span>
                          <span className="font-semibold text-gray-900">{item.quantidade} ocorrências</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              i === 0 ? "bg-red-500" : i === 1 ? "bg-orange-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400">Nenhum dado de bairro registrado.</p>
                )}
              </div>
            </div>

            {/* Issue Category Distribution */}
            <div>
              <span className="text-xs font-bold text-gray-500 block mb-3 uppercase tracking-wider">
                Distribuição por Tipos
              </span>
              <div className="space-y-3">
                {categories.length > 0 ? (
                  categories.map((cat) => {
                    const totalCats = occurrencesAndCategoryTotalFactor(ocorrencias);
                    const percent = Math.round((cat.value / totalCats) * 100);
                    return (
                      <div key={cat.name} className="flex items-center space-x-2 text-xs">
                        <div className={`h-2.5 w-2.5 rounded-full ${getCategoryColorDot(cat.name)}`} />
                        <div className="flex-1 flex justify-between font-medium text-gray-700">
                          <span>{cat.name}</span>
                          <span className="text-gray-400">{cat.value} ({percent}%)</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400">Nenhum evento registrado no momento.</p>
                )}
              </div>

              {/* Informative advice */}
              <div className="mt-5 p-3 rounded-lg bg-gray-50 text-[11px] text-gray-500 border border-gray-150 flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <p>
                  <strong>Sabia que:</strong> Vazamento na calçada é o reparo de maior incidência em São Paulo. 
                  Companhias demoram para saber do problema devido à falta de registros diretos de testemunhas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers for counts
function occurrencesAndCategoryTotalFactor(list: Ocorrencia[]) {
  return list.length || 1;
}

function getCategoryColorDot(type: string) {
  switch (type) {
    case "Vazamento em rua": return "bg-red-500";
    case "Vazamento em calçada": return "bg-amber-600";
    case "Desperdício em espaço público": return "bg-yellow-500";
    case "Falta de abastecimento": return "bg-indigo-600";
    case "Água acumulada": return "bg-cyan-500";
    default: return "bg-blue-500";
  }
}
