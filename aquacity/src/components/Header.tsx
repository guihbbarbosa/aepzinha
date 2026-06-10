import React, { useState } from "react";
import { Droplet, Bell, Shield, User as UserIcon, Coins, Check, Trash2 } from "lucide-react";
import { User, Notificacao } from "../types";

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  onToggleRole: (isAdmin: boolean) => void;
  isAdmin: boolean;
  notificacoes: Notificacao[];
  onMarkRead: (id: string) => void;
  onClearNotifications: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Header({
  currentUser,
  onToggleRole,
  isAdmin,
  notificacoes,
  onMarkRead,
  onClearNotifications,
  currentTab,
  setCurrentTab,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const myNotifications = notificacoes.filter((n) =>
    isAdmin ? n.usuarioId === "usr_admin" : n.usuarioId === currentUser.id
  );
  
  const unreadCount = myNotifications.filter((n) => !n.lida).length;

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "mapa", label: "Mapa & Ocorrências" },
    { id: "registrar", label: "Registrar Ocorrência" },
    { id: "educacional", label: "Central ODS 6" },
    { id: "ranking", label: "Ranking Sustentável" },
    { id: "chatbot", label: "Assistente IA" },
  ];

  // Map user score to sustainability rank
  const getRankBadge = (score: number) => {
    if (score >= 100) return { label: "Patrono da Água", color: "bg-teal-100 text-teal-800 border-teal-200" };
    if (score >= 50) return { label: "Guardião Hídrico", color: "bg-blue-100 text-blue-800 border-blue-200" };
    if (score >= 20) return { label: "Defensor da Natureza", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
    return { label: "Consumidor Consciente", color: "bg-gray-100 text-gray-700 border-gray-200" };
  };

  const rank = getRankBadge(currentUser.pontuacao);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab("dashboard")}>
            <div className="bg-blue-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
              <Droplet className="h-5 w-5 fill-current" />
            </div>
            <div>
              <span className="text-xl font-bold font-sans tracking-tight text-gray-900">
                Aqua<span className="text-blue-600">City</span>
              </span>
              <p className="text-[10px] text-gray-400 font-mono leading-none">GESTAR ODS 6</p>
            </div>
          </div>

          {/* Identity Quick Swapper Dashboard */}
          <div className="hidden md:flex items-center space-x-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200/60 text-xs">
            <span className="text-gray-500 font-medium px-2">Perfil:</span>
            <button
              onClick={() => onToggleRole(false)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                !isAdmin
                  ? "bg-white text-blue-600 shadow-xs border border-gray-200/50"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Cidadão
            </button>
            <button
              onClick={() => onToggleRole(true)}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center space-x-1 ${
                isAdmin
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Gestor Público</span>
            </button>
          </div>

          {/* User Score Badge & Notification Bell */}
          <div className="flex items-center space-x-4">
            {!isAdmin ? (
              <div className="flex items-center space-x-2 bg-blue-50/50 rounded-xl px-3 py-1.5 border border-blue-100">
                <Coins className="h-4 w-4 text-amber-500 animate-pulse" />
                <div className="text-right">
                  <span className="text-xs text-gray-500 block leading-none">Meus Pontos</span>
                  <span className="text-sm font-bold text-blue-700">{currentUser.pontuacao} pts</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-purple-50 rounded-xl px-3 py-1.5 border border-purple-100">
                <Shield className="h-4 w-4 text-purple-600" />
                <div className="text-right">
                  <span className="text-xs text-purple-500 font-medium block leading-none">Controle</span>
                  <span className="text-sm font-bold text-purple-800">Admin Privado</span>
                </div>
              </div>
            )}

            {/* Notification Dropdown Container */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50/20 rounded-xl border border-gray-200/40 relative"
                id="notification-bell-btn"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <span className="font-semibold text-sm text-gray-900">Notificações</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          onClearNotifications();
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Limpar tudo</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {myNotifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 text-xs">
                        Nenhuma notificação por enquanto.
                      </div>
                    ) : (
                      myNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 border-b border-gray-50 text-xs transition-colors hover:bg-gray-50/80 cursor-pointer flex gap-2.5 ${
                            !notif.lida ? "bg-blue-50/20 font-medium" : "text-gray-600"
                          }`}
                          onClick={() => onMarkRead(notif.id)}
                        >
                          <div className="mt-0.5">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                          </div>
                          <div className="flex-1">
                            <p className="leading-relaxed">{notif.mensagem}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {new Date(notif.data).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          {!notif.lida && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkRead(notif.id);
                              }}
                              className="text-blue-500 hover:text-blue-700 self-center"
                              title="Marcar como lida"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto pb-px border-t border-gray-50 pt-2 scrollbar-none">
          {tabs.map((tab) => {
            const isSelected = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id);
                  setShowNotifications(false);
                }}
                className={`py-3 px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Mobile View profile toggle indicator only visible on small screens */}
        <div className="md:hidden flex py-2 border-t border-gray-100 justify-between items-center text-xs text-gray-500">
          <div className="flex items-center space-x-1.5">
            <UserIcon className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-semibold text-gray-700">{currentUser.nome}</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] border ${rank.color}`}>{rank.label}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Visão:</span>
            <button
              onClick={() => onToggleRole(!isAdmin)}
              className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold border border-blue-100"
            >
              {isAdmin ? "Admin (Alterar)" : "Cidadão (Alterar)"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
