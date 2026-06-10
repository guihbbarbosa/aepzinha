export interface User {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  pontuacao: number;
}

export type OcorrenciaStatus = "Aberta" | "Em Análise" | "Aprovada" | "Resolvida";

export interface Ocorrencia {
  id: string;
  titulo: string;
  descricao: string;
  localizacao: {
    endereco: string;
    bairro: string;
    latitude: number;
    longitude: number;
  };
  foto: string; // URL or base64
  status: OcorrenciaStatus;
  tipo: "Vazamento em rua" | "Vazamento em calçada" | "Desperdício em espaço público" | "Falta de abastecimento" | "Água acumulada";
  dataCriacao: string;
  usuarioId: string;
  usuarioNome: string;
  feedbacks?: { autor: string; texto: string; data: string }[];
}

export interface Notificacao {
  id: string;
  mensagem: string;
  data: string;
  lida: boolean;
  usuarioId: string;
  ocorrenciaId?: string;
}

export interface ChatbotMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface DashboardStats {
  totalOcorrencias: number;
  ocorrenciasResolvidas: number;
  tempoMedioDias: number; // Avg time to resolve in days
  bairrosMaisAfetados: { nome: string; quantidade: number }[];
  economiaEstimadaLitros: number; // e.g. 1000L per resolved leak/day
}
