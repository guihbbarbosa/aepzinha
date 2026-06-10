import React, { useState } from "react";
import { 
  Droplet, 
  Lightbulb, 
  BookOpen, 
  ChevronRight, 
  Award, 
  Info, 
  Calculator, 
  Compass, 
  Heart,
  TrendingDown,
  Sparkles,
  HelpCircle,
  CheckCircle2
} from "lucide-react";

export default function Educacional() {
  const [activeTab, setActiveTab] = useState<"quiz" | "simulador" | "ods6">("simulador");

  // Water footprint state
  const [banhoMinutos, setBanhoMinutos] = useState<number>(10);
  const [escovacaoAberta, setEscovacaoAberta] = useState<boolean>(true);
  const [torneiraPingando, setTorneiraPingando] = useState<boolean>(false);
  const [descargaDupla, setDescargaDupla] = useState<boolean>(false);
  const [lavarPratoMinutos, setLavarPratoMinutos] = useState<number>(15);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Simulator maths
  // Shower: 9L/min closed or 15L/min standard. Let's say we consume 12L per min
  const litrosBanho = banhoMinutos * 12;
  // Teeth brushing: open faucet wastes 12L, closed/glass wastes 0.5L
  const litrosEscova = escovacaoAberta ? 12 : 0.5;
  // Drip: 40L per day if active
  const litrosDrip = torneiraPingando ? 40 : 0;
  // Flush toilet: old single flush = 12L, dual flush = 4.5L (weighted avg)
  const litrosDescarga = descargaDupla ? 4.5 * 4 : 10 * 4; // Assuming 4 flushes per day
  // Washing dishes: 15 mins with running tap = 120L, smart washing = 20L
  const litrosPratos = lavarPratoMinutos * 8;

  const totalConsumoEstima = litrosBanho + litrosEscova + litrosDrip + litrosDescarga + litrosPratos;
  
  // Clean reference target (averages based on WHO/ONU recommendations: 110L per day per capita)
  const isSustentavel = totalConsumoEstima <= 110;

  // Quiz questions
  const quizQuestions = [
    {
      id: 1,
      q: "Qual o foco principal do Objetivo de Desenvolvimento Sustentável 6 (ODS 6) da ONU?",
      opts: [
        "Acelerar a transição energética global para fontes renováveis",
        "Assegurar a disponibilidade e gestão sustentável da água potável e saneamento para todos",
        "Reduzir as emissões de carbono industriais nas grandes metrópoles",
        "Fomentar a preservação de florestas tropicais úmidas e nascentes de rios"
      ],
      correct: 1,
      expl: "O ODS 6 visa garantir que todos tenham acesso a água limpa para consumo e saneamento adequado até o ano de 2030."
    },
    {
      id: 2,
      q: "Uma única torneira pingando lentamente na cozinha ou banheiro pode desperdiçar quanto por dia?",
      opts: [
        "Apenas 2 a 5 litros de água tratada",
        "Até 10 litros de água filtrada",
        "Aproximadamente 40 litros de água pura",
        "Mais de 500 litros em poucas horas"
      ],
      correct: 2,
      expl: "Uma torneira gotejando de segundo em segundo desperdiça cerca de 40 litros de água por dia. Conserte rápido!"
    },
    {
      id: 3,
      q: "Qual atitude doméstica tem o maior potencial de economia de água imediata no dia a dia?",
      opts: [
        "Usar copos descartáveis para diminuir a necessidade de lavar pratos",
        "Reduzir o tempo de banho de 15 minutos para 5 minutos",
        "Lavar calçadas externas usando copos d'água sob pressão manual",
        "Fazer compostagem orgânica com lixo úmido para reter umidade"
      ],
      correct: 1,
      expl: "Banhos longos representam o maior gasto hídrico residencial. Reduzir para 5 minutos economiza cerca de 90 a 130 litros por vez!"
    }
  ];

  const handleSelectQuiz = (qId: number, optIdx: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [qId]: optIdx
    });
  };

  const handleCalculateQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct) {
        score += 1;
      }
    });
    setQuizScore(score);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizScore(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Central Educacional Welcome Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10">
          <BookOpen className="h-64 w-64 fill-current text-blue-500" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <span className="bg-blue-600 font-mono text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
            SABER PARA AJUDAR
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
            Central de Ação & Educação Ambiental
          </h2>
          <p className="text-slate-350 text-xs sm:text-sm leading-relaxed mt-2">
            Entenda por que economizar água tratada é vital para conter efeitos de estresse hídrico. 
            Calcule sua pegada de uso diário ou participe do nosso Desafio ODS 6 para testar seu nível de conhecimento ecológico!
          </p>

          <div className="flex gap-2.5 mt-5">
            <button
              onClick={() => setActiveTab("simulador")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "simulador"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Calculadora Pegada Hídrica
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "quiz"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Desafio de Conhecimento
            </button>
            <button
              onClick={() => setActiveTab("ods6")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "ods6"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Metas da ODS 6
            </button>
          </div>
        </div>
      </div>

      {/* Main interactive segment depending on the activeTab */}
      {activeTab === "simulador" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form input widgets left slide */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-6">
            <div>
              <h3 className="font-extrabold text-sm text-gray-950 flex items-center space-x-1.5">
                <Calculator className="h-4.5 w-4.5 text-blue-600" />
                <span>Simulador Doméstico Automatizado</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Regule os toggles para medir o volume médio consumido pelo seu domicílio.
              </p>
            </div>

            <div className="space-y-5 pt-2">
              {/* Bath Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-gray-750">Duração média de cada banho diário:</span>
                  <span className="font-mono text-blue-600 font-bold">{banhoMinutos} minutos</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={banhoMinutos}
                  onChange={(e) => setBanhoMinutos(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer accent-blue-600"
                />
                <span className="text-[10px] text-gray-400 block font-normal text-right">Média brasileira: 12 minutos</span>
              </div>

              {/* Dish washing Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-gray-750">Lavar pratos e louças com torneira ligada:</span>
                  <span className="font-mono text-blue-600 font-bold">{lavarPratoMinutos} minutos/dia</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="45"
                  step="1"
                  value={lavarPratoMinutos}
                  onChange={(e) => setLavarPratoMinutos(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer accent-blue-600"
                />
              </div>

              {/* Switch toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                
                {/* Tooth faucet */}
                <div 
                  onClick={() => setEscovacaoAberta(!escovacaoAberta)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer select-none transition-colors text-left ${
                    escovacaoAberta 
                      ? "bg-red-50/40 border-red-200" 
                      : "bg-emerald-50/40 border-emerald-200 text-emerald-950"
                  }`}
                >
                  <span className="block font-bold mb-1">Escovação de dentes:</span>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span>{escovacaoAberta ? "Torneira Aberta" : "Usa Copo H2O"}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${escovacaoAberta ? "bg-red-500" : "bg-emerald-500"}`} />
                  </div>
                </div>

                {/* Leak Faucet toggle */}
                <div 
                  onClick={() => setTorneiraPingando(!torneiraPingando)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer select-none transition-colors text-left ${
                    torneiraPingando 
                      ? "bg-red-50/40 border-red-200" 
                      : "bg-emerald-50/40 border-emerald-200 text-emerald-950"
                  }`}
                >
                  <span className="block font-bold mb-1">Alguma goteira em casa?</span>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span>{torneiraPingando ? "Sim (Desperdiçando)" : "Consertada"}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${torneiraPingando ? "bg-red-500" : "bg-emerald-500"}`} />
                  </div>
                </div>

                {/* Flush system */}
                <div 
                  onClick={() => setDescargaDupla(!descargaDupla)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer select-none transition-colors text-[#1e293b] text-left ${
                    descargaDupla 
                      ? "bg-emerald-50/45 border-emerald-250 text-emerald-950" 
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <span className="block font-bold mb-1">Tipo de descarga acoplada:</span>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span>{descargaDupla ? "Dual Inteligente (3/6L)" : "Válvula Antiga (9L)"}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${descargaDupla ? "bg-emerald-500" : "bg-gray-400"}`} />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right dynamic feedback cylinder results indicator panel */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-150 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Resultado da Análise Hídrica</h3>
                <p className="text-xs text-gray-400">Pegada estimada diária por indivíduo.</p>
              </div>

              {/* Total Display */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 text-center relative overflow-hidden">
                <div className="absolute right-0 top-0 text-slate-100 transform translate-x-4 -translate-y-4">
                  <Droplet className="h-16 w-16 fill-current text-slate-200" />
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Consumo Diário Coletado</span>
                <span className="text-4xl font-extrabold block text-blue-700 my-1">{totalConsumoEstima}L</span>
                
                {isSustentavel ? (
                  <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Sustentável (Meta OMS atendida)
                  </span>
                ) : (
                  <span className="inline-block bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Excedente (Meta sustentável é 110L/dia)
                  </span>
                )}
              </div>

              {/* Comparison chart info */}
              <div className="space-y-2.5">
                <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider block">Metas Recomendadas:</span>
                
                <div className="text-xs space-y-1.5 text-gray-600">
                  <div className="flex justify-between items-center">
                    <span>Recomendação ODS 6 (Meta Diária):</span>
                    <span className="font-bold text-slate-800">110 Litros</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: "110%" }} />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span>Seu Consumo Estimado:</span>
                    <span className={`font-bold ${isSustentavel ? "text-emerald-700" : "text-red-600"}`}>
                      {totalConsumoEstima} Litros
                    </span>
                  </div>
                  {/* Visual scale comparing user consumption */}
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${isSustentavel ? "bg-emerald-500" : "bg-red-500"}`} 
                      style={{ width: `${Math.min((totalConsumoEstima / 200) * 100, 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100-50 text-xs">
              <span className="font-bold text-amber-700 block mb-1">💡 Dica de Mudança Rápida:</span>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                Feche a água enquanto lava a louça na pia. Apenas enxágue tudo no final com uma bacia de apoio. Isso corta seu tempo de consumo ativo de pratos para apenas 5L dia!
              </p>
            </div>
          </div>

        </div>
      )}

      {/* QUIZ SECTION */}
      {activeTab === "quiz" && (
        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs max-w-3xl mx-auto space-y-6">
          <div>
            <h3 className="font-extrabold text-sm text-gray-950 flex items-center space-x-1.5">
              <Award className="h-5 w-5 text-blue-600 animate-pulse" />
              <span>Desafio do Conhecimento: Água Potável Urbana</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Testes rápidos baseados nos índices do saneamento municipal brasileiro.</p>
          </div>

          <div className="space-y-6 pt-2">
            {quizQuestions.map((q, idx) => {
              const selectedIdx = selectedAnswers[q.id];
              const isLocked = quizScore !== null;

              return (
                <div key={q.id} className="space-y-2.5">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-800">
                    {idx + 1}. {q.q}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {q.opts.map((opt, oIdx) => {
                      const isSelected = selectedIdx === oIdx;
                      const isCorrect = q.correct === oIdx;

                      let btnStyle = "bg-slate-50 text-gray-700 border-slate-200 hover:bg-slate-100/70";
                      if (isSelected) {
                        btnStyle = "bg-blue-50 border-blue-400 text-blue-800 font-bold";
                      }
                      if (isLocked) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold";
                        } else if (isSelected) {
                          btnStyle = "bg-red-50 border-red-400 text-red-800 font-bold";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={isLocked}
                          onClick={() => handleSelectQuiz(q.id, oIdx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isLocked && isCorrect && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Exhibit explication if results evaluated */}
                  {isLocked && (
                    <div className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-150 inline-block leading-relaxed">
                      <strong>Explicação técnica:</strong> {q.expl}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Evaluation Action Row Button */}
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              {quizScore === null ? (
                <button
                  type="button"
                  onClick={handleCalculateQuiz}
                  disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                  className="bg-blue-600 disabled:opacity-40 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md shadow-blue-100 transition-colors cursor-pointer"
                >
                  Avaliar Minhas Respostas
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="text-xs">
                    <span>Pontuação: </span>
                    <strong className="text-md text-blue-700 font-extrabold">{quizScore} / {quizQuestions.length} acertos</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-2 px-4 rounded-xl transition-colors font-semibold cursor-pointer"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ODS 6 Target Definitions Display */}
      {activeTab === "ods6" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 text-left">
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
              O que é a ODS 6?
            </span>
            <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
              Segurança Hídrica e Saneamento Ecológico Geral
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              No âmbito dos 17 Objetivos de Desenvolvimento Sustentável das Nações Unidas, o ODS 6 ataca de frente a desigualdade do saneamento básico e as perdas de água limpa por falha no encanamento civil.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              O Brasil possui atualmente índices de perdas na rede de distribuição que chegam a incríveis <strong>38%</strong> em locais urbanos. Isso significa que mais de um terço de toda a água purificada some em vazamentos invisíveis no asfalto ou sob calçadas!
            </p>

            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/60 text-xs text-amber-900 flex space-x-2">
              <Info className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-normal">
                <strong>O papel do AquaCity:</strong> Damos visibilidade geográfica imediata aos vazamentos comuns, ajudando operários municipais a conter focos hidráulicos até 5x mais rápido!
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Metas Primárias Integradas neste Sistema
            </h3>

            <div className="space-y-3.5">
              <div className="flex gap-2.5 items-start text-xs text-slate-700">
                <div className="h-5 w-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">6.1</div>
                <div>
                  <h4 className="font-bold text-gray-900 leading-none mb-1">Acesso à água limpa universal</h4>
                  <p className="text-[11px] text-gray-500">Garantir acesso equitativo a água potável confiável e de baixo custo.</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start text-xs text-slate-700">
                <div className="h-5 w-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">6.4</div>
                <div>
                  <h4 className="font-bold text-gray-900 leading-none mb-1">Eficiência de uso de água em larga escala</h4>
                  <p className="text-[11px] text-gray-500">Aumentar a rentabilidade de uso e mitigar o desperdício físico nos aspersores.</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start text-xs text-slate-700">
                <div className="h-5 w-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">6.b</div>
                <div>
                  <h4 className="font-bold text-gray-900 leading-none mb-1">Apoio comunitário ao controle hidráulico</h4>
                  <p className="text-[11px] text-gray-500">Incentivar o engajamento da comunidade de cidadãos no policiamento preventivo.</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100 block text-xs">
              <div className="flex justify-between items-center text-blue-800 font-bold mb-1">
                <span className="flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span>Selo Prata ODS 6</span>
                </span>
                <span>Ativo</span>
              </div>
              <p className="text-[10.5px] text-blue-700 leading-normal">
                Esta plataforma cumpre cumulativamente as diretrizes técnicas de monitoramento do saneamento urbano.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
