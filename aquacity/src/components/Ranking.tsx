import React, { useEffect, useState } from "react";
import { User } from "../types";
import { Award, Trophy, Medal, Crown, Star, ShieldAlert, Sparkles } from "lucide-react";

interface RankingProps {
  currentUser: User;
}

export default function Ranking({ currentUser }: RankingProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch dynamic list of users to construct the global leaderboard
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        // Sort users descending by score
        const sorted = (data || []).sort((a: any, b: any) => b.pontuacao - a.pontuacao);
        setUsers(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load global rank board", err);
        setLoading(false);
      });
  }, [currentUser.pontuacao]); // Re-fire if user score modifies

  // Identify achievements of current user based on score
  const achievements = [
    {
      id: "first_leak",
      name: "Minha Primeira Gota",
      description: "Fez o registro de uma ocorrência hídrica válida no sistema.",
      requiredScore: 10,
      badge: "💧",
      unlocked: currentUser.pontuacao >= 10
    },
    {
      id: "savior",
      name: "Guardião Residente",
      description: "Atingiu 40 pontos ajudando no repasse municipal de vazamentos.",
      requiredScore: 45,
      badge: "🌿",
      unlocked: currentUser.pontuacao >= 40
    },
    {
      id: "water_patron",
      name: "Patrono da Sede",
      description: "Ultrapassou os 100 pontos acumulados na plataforma AquaCity.",
      requiredScore: 100,
      badge: "👑",
      unlocked: currentUser.pontuacao >= 100
    },
    {
      id: "quiz_champion",
      name: "Cidadão Intelecto",
      description: "Respondeu de forma coerente às preocupações da ODS 6.",
      requiredScore: 20,
      badge: "🧠",
      unlocked: currentUser.pontuacao >= 20
    }
  ];

  const getRankLevel = (score: number) => {
    if (score >= 100) return { title: "Patrono da Água (Level 4)", style: "text-teal-700 bg-teal-50 border-teal-200" };
    if (score >= 50) return { title: "Guardião Hídrico (Level 3)", style: "text-blue-700 bg-blue-50 border-blue-200" };
    if (score >= 20) return { title: "Defensor da Natureza (Level 2)", style: "text-indigo-700 bg-indigo-50 border-indigo-200" };
    return { title: "Consumidor Consciente (Level 1)", style: "text-gray-700 bg-gray-50 border-gray-200" };
  };

  const currentRank = getRankLevel(currentUser.pontuacao);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Leaderboard panel on Left Column */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-150 p-6 flex flex-col justify-between shadow-xs">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">Leaderboard Ecológica</h3>
              <p className="text-xs text-gray-400">Pessoas que mais reportaram e apoiaram o saneamento sustentável.</p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-gray-450">Carregando posições...</div>
          ) : (
            <div className="space-y-2.5 pt-2">
              {users.map((item, idx) => {
                const isCurrentUser = item.id === currentUser.id;
                
                // Position ornaments
                let posDecorator = <span className="text-xs font-mono font-bold text-gray-400">#{idx + 1}</span>;
                if (idx === 0) posDecorator = <Crown className="h-4.5 w-4.5 text-amber-500" />;
                else if (idx === 1) posDecorator = <Medal className="h-4.5 w-4.5 text-slate-400" />;
                else if (idx === 2) posDecorator = <Medal className="h-4.5 w-4.5 text-amber-700" />;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      isCurrentUser
                        ? "bg-blue-50/50 border-blue-400 shadow-xs"
                        : "bg-white border-gray-150"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 flex justify-center">
                        {posDecorator}
                      </div>

                      <div>
                        <span className="font-bold text-gray-900 block font-sans">
                          {item.nome} {isCurrentUser && <span className="text-[10px] text-blue-600 font-normal italic">(Você)</span>}
                        </span>
                        <span className="text-[10px] text-gray-450 block">Level: {getRankLevel(item.pontuacao).title}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 font-mono font-bold">
                      <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        {item.pontuacao} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 p-3 bg-slate-50 border border-slate-150 text-[11px] text-gray-500 rounded-xl leading-relaxed">
          <strong>Como subir de posição:</strong> Ganhe <strong>+10 pontos</strong> ao registrar cada vazamento com foto real, e ganhe adicionais <strong>+20 pontos</strong> automáticos assim que o status da ocorrência for alterado para <strong>'Resolvida'</strong> pelo monitoramento oficial!
        </div>
      </div>

      {/* Profile summary & achievements on Right Column */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10">
            <Award className="h-32 w-32 text-indigo-400 fill-current" />
          </div>
          <div className="relative z-10 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-300 block tracking-wider font-mono">Minha Classificação</span>
              <h3 className="text-xl font-bold tracking-tight mt-1">{currentUser.nome}</h3>
              <p className="text-xs text-indigo-200 mt-1">{currentUser.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-indigo-200 block font-bold leading-none">Pontuação</span>
                <span className="text-2xl font-extrabold text-amber-400 block mt-1.5">{currentUser.pontuacao}</span>
              </div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-indigo-200 block font-bold leading-none">Conquistas</span>
                <span className="text-2xl font-extrabold text-blue-300 block mt-1.5">
                  {achievements.filter((a) => a.unlocked).length} / {achievements.length}
                </span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl text-xs font-bold border ${currentRank.style}`}>
              Categoria: {currentRank.title}
            </div>
          </div>
        </div>

        {/* Badges and achievements display list */}
        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-4 text-left">
          <div className="flex items-center space-x-2">
            <Star className="h-4.5 w-4.5 text-blue-600" />
            <h4 className="text-sm font-bold text-gray-900">Emblemas e Medalhas</h4>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  ach.unlocked
                    ? "bg-slate-50 border-gray-200/80"
                    : "bg-gray-50/40 border-gray-200/50 opacity-40 select-none"
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-white border border-gray-150 shadow-xxs flex items-center justify-center text-xl shrink-0">
                  {ach.badge}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-gray-800 leading-none">{ach.name}</span>
                    {ach.unlocked ? (
                      <span className="bg-emerald-50 text-emerald-800 text-[8px] font-extrabold tracking-wider border border-emerald-150 px-1.5 py-0.5 rounded uppercase">
                        Conquistado
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-[8px] font-bold px-1.5 py-0.5 rounded">
                        Bloqueado
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-505 leading-tight mt-1">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
