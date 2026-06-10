import { User, Ocorrencia as IOcorrencia, OcorrenciaStatus, Notificacao as INotificacao } from "../types";

export class Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  pontuacao: number;

  constructor(id: string, nome: string, email: string, pontuacao: number, senha?: string) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.pontuacao = pontuacao;
    this.senha = senha;
  }

  // Simulates registration action/validation
  static cadastrar(nome: string, email: string, senha?: string): Usuario {
    if (!nome.trim() || !email.trim() || !senha?.trim()) {
      throw new Error("Nome, email e senha são obrigatórios.");
    }
    const id = "usr_" + Math.random().toString(36).substr(2, 9);
    return new Usuario(id, nome, email, 0, senha);
  }

  // Simulates authentication validation
  static login(email: string, senhaToMatch: string, currentUsers: Usuario[]): Usuario | null {
    const found = currentUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found && found.senha === senhaToMatch) {
      return found;
    }
    return null;
  }

  // Helper inside Usuario to register occurrences as per PRD Section 6
  registrarOcorrencia(
    titulo: string,
    descricao: string,
    endereco: string,
    bairro: string,
    latitude: number,
    longitude: number,
    foto: string,
    tipo: "Vazamento em rua" | "Vazamento em calçada" | "Desperdício em espaço público" | "Falta de abastecimento" | "Água acumulada"
  ): IOcorrencia {
    const ocoId = "oco_" + Math.random().toString(36).substr(2, 9);
    return {
      id: ocoId,
      titulo,
      descricao,
      localizacao: {
        endereco,
        bairro,
        latitude,
        longitude
      },
      foto,
      status: "Aberta",
      tipo,
      dataCriacao: new Date().toISOString(),
      usuarioId: this.id,
      usuarioNome: this.nome,
    };
  }
}

export class Ocorrencia implements IOcorrencia {
  id: string;
  titulo: string;
  descricao: string;
  localizacao: {
    endereco: string;
    bairro: string;
    latitude: number;
    longitude: number;
  };
  foto: string;
  status: OcorrenciaStatus;
  tipo: "Vazamento em rua" | "Vazamento em calçada" | "Desperdício em espaço público" | "Falta de abastecimento" | "Água acumulada";
  dataCriacao: string;
  usuarioId: string;
  usuarioNome: string;

  constructor(data: IOcorrencia) {
    this.id = data.id;
    this.titulo = data.titulo;
    this.descricao = data.descricao;
    this.localizacao = data.localizacao;
    this.foto = data.foto;
    this.status = data.status;
    this.tipo = data.tipo;
    this.dataCriacao = data.dataCriacao;
    this.usuarioId = data.usuarioId;
    this.usuarioNome = data.usuarioNome;
  }

  abrir(): void {
    this.status = "Aberta";
  }

  atualizarStatus(novoStatus: OcorrenciaStatus): void {
    this.status = novoStatus;
  }

  finalizar(): void {
    this.status = "Resolvida";
  }
}

export class Notificacao implements INotificacao {
  id: string;
  mensagem: string;
  data: string;
  lida: boolean;
  usuarioId: string;
  ocorrenciaId?: string;

  constructor(id: string, mensagem: string, data: string, lida: boolean, usuarioId: string, ocorrenciaId?: string) {
    this.id = id;
    this.mensagem = mensagem;
    this.data = data;
    this.lida = lida;
    this.usuarioId = usuarioId;
    this.ocorrenciaId = ocorrenciaId;
  }

  static enviar(usuarioId: string, mensagem: string, ocorrenciaId?: string): Notificacao {
    const notifId = "notif_" + Math.random().toString(36).substr(2, 9);
    return new Notificacao(
      notifId,
      mensagem,
      new Date().toISOString(),
      false,
      usuarioId,
      ocorrenciaId
    );
  }
}

export class Chatbot {
  pergunta: string;
  resposta: string;

  constructor(pergunta: string = "", resposta: string = "") {
    this.pergunta = pergunta;
    this.resposta = resposta;
  }

  // Standard preset local responses before forwarding to server AI
  responder(pergunta: string): string {
    const p = pergunta.toLowerCase();
    if (p.includes("denunciar") || p.includes("vazamento") || p.includes("registrar")) {
      return "Para denunciar um vazamento ou problema hídrico, mude para a aba 'Registrar Ocorrência', insira o título, tipo do vazamento, tire ou selecione uma foto e marque a localização no mapa. Depois de enviar, você ganha 10 pontos de sustentabilidade!";
    }
    if (p.includes("economizar") || p.includes("dicas") || p.includes("poupar")) {
      return "Dicas de economia: 1) Tome banhos mais curtos. 2) Feche a torneira ao escovar os dentes. 3) Use água da chuva ou reúso de máquina para lavar pisos. 4) Verifique torneiras pingando (um pequeno vazamento gasta até 40L por dia)!";
    }
    if (p.includes("acompanhar") || p.includes("status")) {
      return "Você pode visualizar e acompanhar todo o progresso de sua ocorrência pela aba 'Ocorrências Ativas/Mapa'. Lá você verá se ela está 'Aberta', 'Em Análise', 'Aprovada' ou 'Resolvida'.";
    }
    if (p.includes("falta") || p.includes("abastecimento") || p.includes("sem água")) {
      return "Em caso de falta de abastecimento, confira se o registro de entrada do seu imóvel está aberto. Caso seja uma interrupção na vizinhança, verifique se há vazamentos reportados no mapa ou use a AquaCity para reportar uma Ocorrência do tipo 'Falta de Abastecimento'.";
    }
    return ""; // Will trigger Gemini AI if returns empty string
  }

  sugerirAcao(): string {
    return "Que tal conferir nossa aba 'Central Educacional' para aprender mais sobre as metas do ODS 6 (Água Potável e Saneamento) ou registrar um novo vazamento e testar a gamificação?";
  }
}
