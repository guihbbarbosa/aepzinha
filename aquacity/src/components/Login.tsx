import React, { useState } from "react";
import { User } from "../types";
import { Droplet, Mail, Lock, User as UserIcon, Keyboard, AlertCircle, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onSetIsAdmin: (isAdmin: boolean) => void;
}

export default function Login({ onLoginSuccess, onSetIsAdmin }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Form Fields
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Falha na autenticação.");
      }

      // Check if user is the default admin
      if (data.id === "usr_admin" || data.email === "admin@aquacity.com") {
        onSetIsAdmin(true);
      } else {
        onSetIsAdmin(false);
      }

      onLoginSuccess(data);
    } catch (err: any) {
      setError(err.message || "Erro de rede.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !senha) {
      setError("Por favor, preencha todos os campos de cadastro.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const resp = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Erro no cadastro.");
      }

      setSuccessMsg("Sua conta foi criada! Faça login com suas novas credenciais.");
      setIsRegistering(false);
      setError("");
    } catch (err: any) {
      setError(err.message || "Email em uso ou erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Digite o email para recuperar.");
      return;
    }
    setSuccessMsg(`Um link de redefinição de senha fictício foi enviado para ${email}.`);
    setIsForgotPassword(false);
    setError("");
  };

  // Preset accounts helper for demonstration ease
  const fillPresetUser = (type: "citizen" | "admin") => {
    if (type === "citizen") {
      setEmail("guilherme@email.com");
      setSenha("user123");
    } else {
      setEmail("admin@aquacity.com");
      setSenha("admin");
    }
    setError("");
    setSuccessMsg("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-150/80 overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700" />
        
        <div className="p-8 sm:p-10">
          {/* Logo Brand */}
          <div className="flex flex-col items-center text-center space-y-2 mb-8">
            <div className="bg-blue-600 text-white p-3.5 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Droplet className="h-6 w-6 fill-current" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">AquaCity</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs font-medium">
                Plataforma Colaborativa de Combate ao Desperdício Hídrico (ODS 6)
              </p>
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-start space-x-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-start space-x-2.5">
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Main conditional forms */}
          {isForgotPassword ? (
            <form onSubmit={handleRecovery} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Email cadastrado
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors shadow-md shadow-blue-100 flex items-center justify-center space-x-2 hover:cursor-pointer"
              >
                <span>Enviar Link de Recuperação</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError("");
                }}
                className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-1"
              >
                Voltar para o Login
              </button>
            </form>
          ) : isRegistering ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu Nome completo"
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Senha segura
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors shadow-md shadow-blue-100 flex items-center justify-center space-x-2 disabled:opacity-50 hover:cursor-pointer"
              >
                <span>{loading ? "Registrando no Banco..." : "Criar Conta Sustentável"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setError("");
                }}
                className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors py-1"
              >
                Já tem uma conta? Faça Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="filiado@parceiro.com"
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center mb-0.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError("");
                      setSuccessMsg("");
                    }}
                    className="text-[11px] text-slate-550 hover:text-blue-600 font-semibold"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors shadow-md shadow-blue-150 flex items-center justify-center space-x-2 disabled:opacity-50 hover:cursor-pointer"
              >
                <span>{loading ? "Autenticando..." : "Entrar na Plataforma"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setError("");
                  setSuccessMsg("");
                }}
                className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors py-1"
              >
                Sou cidadão novo &mdash; Registrar
              </button>
            </form>
          )}

          {/* Preset Demo Access Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2.5">
              Acesso Rápido para Testes
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillPresetUser("citizen")}
                className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 p-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all"
              >
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase">Perfil</span>
                  <span>Cidadão Ativo</span>
                </div>
                <Keyboard className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => fillPresetUser("admin")}
                className="bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-slate-700 hover:text-purple-700 p-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all"
              >
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase">Gestão</span>
                  <span>Gestor Saneamento</span>
                </div>
                <ShieldAlert className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
