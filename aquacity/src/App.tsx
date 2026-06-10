import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import MapSection from "./components/MapSection";
import Registrar from "./components/Registrar";
import Educacional from "./components/Educacional";
import Ranking from "./components/Ranking";
import Chatbot from "./components/Chatbot";
import Login from "./components/Login";

import { User, Ocorrencia, OcorrenciaStatus, Notificacao } from "./types";
import { Droplet, AlertCircle, RefreshCw, LogOut } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentTab, setCurrentTab] = useState("dashboard");

  // Occurrence geographic coordinates picked from Map Section
  const [selectedCoordinate, setSelectedCoordinate] = useState<{ lat: number; lng: number; address: string } | null>(null);

  // States
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [stats, setStats] = useState<any>({
    totalOcorrencias: 0,
    ocorrenciasResolvidas: 0,
    tempoMedioDias: 1.8,
    bairrosMaisAfetados: [],
    economiaEstimadaLitros: 0
  });

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync state data on load & if current authentication changes
  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // Parallel reads
      const [ocoRes, notifRes, statsRes] = await Promise.all([
        fetch("/api/ocorrencias"),
        fetch("/api/notificacoes"),
        fetch("/api/stats")
      ]);

      if (!ocoRes.ok || !notifRes.ok || !statsRes.ok) {
        throw new Error("Erro ao coletar informações do servidor AquaCity.");
      }

      const ocoData = await ocoRes.json();
      const notifData = await notifRes.json();
      const statsData = await statsRes.json();

      setOcorrencias(ocoData);
      setNotificacoes(notifData);
      setStats(statsData);

      // Also refresh the local current user points dynamically from fresh list!
      if (currentUser) {
        const usersResp = await fetch("/api/users");
        if (usersResp.ok) {
          const allUsers = await usersResp.json();
          const freshMe = allUsers.find((u: any) => u.id === currentUser.id);
          if (freshMe) {
            setCurrentUser(freshMe);
          }
        }
      }

    } catch (err: any) {
      console.error("Authentication synchronous fetch flow failed", err);
      setErrorMsg("Conexão fraca com o servidor backend. Tentando restabelecer...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser?.id, currentUser?.pontuacao]);

  // Handle addition of occurrences
  const handleAddOcorrencia = async (payload: any) => {
    try {
      const resp = await fetch("/api/ocorrencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Não foi possível enviar ocorrência.");
      }

      // Re-trigger global refresh
      await fetchData();
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Update Occurrence status (Admin Privileges)
  const handleUpdateStatus = async (id: string, newStatus: OcorrenciaStatus) => {
    try {
      const resp = await fetch(`/api/ocorrencias/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Erro ao atualizar status.");
      }

      // Local success feedback
      alert(`Status atualizado para: "${newStatus}"! Notificações emitidas com sucesso.`);
      
      // Refresh database logs
      await fetchData();
    } catch (err: any) {
      alert("Falha: " + err.message);
    }
  };

  // Mark single Notification read
  const handleMarkRead = async (id: string) => {
    try {
      const resp = await fetch(`/api/notificacoes/${id}/ler`, {
        method: "PUT"
      });
      if (resp.ok) {
        // Optimistic UI updates
        setNotificacoes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clear all notifications
  const handleClearNotifications = async () => {
    if (!currentUser) return;
    try {
      const resp = await fetch(`/api/notificacoes/limpar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: isAdmin ? "usr_admin" : currentUser.id })
      });
      if (resp.ok) {
        setNotificacoes((prev) =>
          prev.map((n) =>
            (isAdmin ? n.usuarioId === "usr_admin" : n.usuarioId === currentUser.id)
              ? { ...n, lida: true }
              : n
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setCurrentTab("dashboard");
    setSelectedCoordinate(null);
  };

  // Main login protection wrapper check
  if (!currentUser) {
    return (
      <Login 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          // If the logged user has admin prefix, set admin true
          if (user.id === "usr_admin" || user.email === "admin@aquacity.com") {
            setIsAdmin(true);
          }
        }} 
        onSetIsAdmin={setIsAdmin} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-250">
      
      {/* Header element */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onToggleRole={(wantsAdmin) => {
          setIsAdmin(wantsAdmin);
          setCurrentTab("dashboard"); // reset tab
        }}
        isAdmin={isAdmin}
        notificacoes={notificacoes}
        onMarkRead={handleMarkRead}
        onClearNotifications={handleClearNotifications}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Main Container Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Global Connection/Log diagnostics */}
        {errorMsg && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 animate-bounce" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={fetchData}
              className="bg-white hover:bg-slate-155 text-blue-600 px-2.5 py-1 rounded-lg border border-amber-250 font-bold transition-all shrink-0 cursor-pointer text-[10px]"
            >
              Reconectar
            </button>
          </div>
        )}

        {/* Dynamic page router loading indicator */}
        {loading && ocorrencias.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            <div className="text-center">
              <h4 className="text-sm font-bold text-gray-900">AquaCity</h4>
              <p className="text-xs text-gray-400">Sincronizando índices ecológicos do servidor...</p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in duration-300">
            {/* Navigates cleanly based on selected tabs */}
            {currentTab === "dashboard" && (
              <Dashboard
                stats={stats}
                ocorrencias={ocorrencias}
                onNavigateToTab={setCurrentTab}
              />
            )}

            {currentTab === "mapa" && (
              <MapSection
                ocorrencias={ocorrencias}
                currentUser={currentUser}
                onUpdateStatus={handleUpdateStatus}
                isAdmin={isAdmin}
                onSelectMapCoordinate={(lat, lng, address) => {
                  setSelectedCoordinate({ lat, lng, address });
                }}
                onNavigateToTab={setCurrentTab}
              />
            )}

            {currentTab === "registrar" && (
              <Registrar
                currentUser={currentUser}
                onAddOcorrencia={handleAddOcorrencia}
                selectedCoordinate={selectedCoordinate}
                onClearCoordinate={() => setSelectedCoordinate(null)}
                onNavigateToTab={setCurrentTab}
              />
            )}

            {currentTab === "educacional" && <Educacional />}

            {currentTab === "ranking" && <Ranking currentUser={currentUser} />}

            {currentTab === "chatbot" && <Chatbot />}
          </div>
        )}

      </main>

      {/* Footer copyright */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-450 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-1">
            <Droplet className="h-4 w-4 text-blue-600 fill-current" />
            <span className="font-bold text-gray-800">AquaCity &copy; 2026</span>
            <span className="text-gray-400">|</span>
            <span className="italic">Parceria Cidadã ODS 6 Água e Saneamento</span>
          </div>

          <div className="flex items-center space-x-3 text-gray-400 font-medium">
            <span>Usuário: <strong>{currentUser.nome}</strong></span>
            <span>&bull;</span>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 transition-colors flex items-center space-x-1 font-bold cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
