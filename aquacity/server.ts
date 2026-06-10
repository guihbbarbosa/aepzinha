import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: "50mb" }));

// DB File setup for session persistence
const DB_FILE = path.join(process.cwd(), "db.json");

// Define seed database structure
const initialDB = {
  users: [
    { id: "usr_admin", nome: "Gestão Pública (Admin)", email: "admin@aquacity.com", senha: "admin", pontuacao: 0 },
    { id: "usr_1", nome: "Guilherme Santos", email: "guilherme@email.com", senha: "user123", pontuacao: 40 },
    { id: "usr_2", nome: "Mariana Silva", email: "mariana@email.com", senha: "user123", pontuacao: 20 },
    { id: "usr_3", nome: "Anônimo Consciente", email: "anon@email.com", senha: "user123", pontuacao: 10 }
  ],
  ocorrencias: [
    {
      id: "oco_1",
      titulo: "Vazamento severo em cano adutor na calçada",
      descricao: "Água límpida jorrando com força há mais de 4 horas, danificando a calçada e correndo em direção à sarjeta.",
      localizacao: {
        endereco: "Avenida Paulista, 1200",
        bairro: "Jardins",
        latitude: -23.56152,
        longitude: -46.6533
      },
      foto: "vazamento_calcada",
      status: "Aberta",
      tipo: "Vazamento em calçada",
      dataCriacao: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      usuarioId: "usr_1",
      usuarioNome: "Guilherme Santos"
    },
    {
      id: "oco_2",
      titulo: "Asfalto cedendo e minando água na pista comercial",
      descricao: "Água limpa minando continuamente do asfalto, abrindo uma fresta na pista direita da via expressa.",
      localizacao: {
        endereco: "Av. Brigadeiro Luís Antônio, 2500",
        bairro: "Centro",
        latitude: -23.5581,
        longitude: -46.6433
      },
      foto: "vazamento_asfalto",
      status: "Em Análise",
      tipo: "Vazamento em rua",
      dataCriacao: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
      usuarioId: "usr_2",
      usuarioNome: "Mariana Silva"
    },
    {
      id: "oco_3",
      titulo: "Chafariz público com válvula espanada jorrando",
      descricao: "Boca de aspersor quebrada no meio da praça. Jorrando dezenas de litros por minuto sem controle.",
      localizacao: {
        endereco: "Parque do Ibirapuera - Portão 3",
        bairro: "Vila Mariana",
        latitude: -23.5855,
        longitude: -46.6599
      },
      foto: "desperdicios",
      status: "Aprovada",
      tipo: "Desperdício em espaço público",
      dataCriacao: new Date(Date.now() - 3600000 * 26).toISOString(), // ~1 day ago
      usuarioId: "usr_1",
      usuarioNome: "Guilherme Santos"
    },
    {
      id: "oco_4",
      titulo: "Cavalete de água residencial quebrado",
      descricao: "Cano quebrado de entrada de água antes do medidor do imóvel. Resolvido com trocas de conexões públicas.",
      localizacao: {
        endereco: "Av. Santo Amaro, 1800",
        bairro: "Santo Amaro",
        latitude: -23.6083,
        longitude: -46.6712
      },
      foto: "resolvida",
      status: "Resolvida",
      tipo: "Vazamento em calçada",
      dataCriacao: new Date(Date.now() - 3600000 * 75).toISOString(), // ~3 days ago
      usuarioId: "usr_3",
      usuarioNome: "Anônimo Consciente"
    }
  ],
  notificacoes: [
    {
      id: "notif_1",
      mensagem: "Sua ocorrência 'Cavalete de água residencial quebrado' foi concluída com sucesso! Obrigado pelo apoio! +20 pontos recebidos.",
      data: new Date(Date.now() - 3600000 * 74).toISOString(),
      lida: true,
      usuarioId: "usr_3",
      ocorrenciaId: "oco_4"
    },
    {
      id: "notif_2",
      mensagem: "Nova ocorrência reportada no bairro Jardins: 'Vazamento severo em cano adutor na calçada'.",
      data: new Date(Date.now() - 3600000 * 2).toISOString(),
      lida: false,
      usuarioId: "usr_admin",
      ocorrenciaId: "oco_1"
    }
  ]
};

// Initialize DB file if not exists
function getDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), "utf8");
      return initialDB;
    }
    const content = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading db file, falling back to in-memory state", err);
    return initialDB;
  }
}

function saveDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing db file", err);
  }
}

// Ensure database file gets established on startup
let db = getDB();

// Setup Gemini Client lazily inside API triggers or safely on server start
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI client", err);
    return null;
  }
}

// ==========================================
// API REST ENDPOINTS
// ==========================================

// --- USER MANAGEMENT & AUTH ---
app.post("/api/auth/register", (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios." });
  }

  const database = getDB();
  const exists = database.users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "Este email já está cadastrado." });
  }

  const newUser = {
    id: "usr_" + Math.random().toString(36).substr(2, 9),
    nome,
    email,
    senha,
    pontuacao: 0
  };

  database.users.push(newUser);
  saveDB(database);

  // Return user omitting password
  const { senha: _, ...userResp } = newUser;
  res.status(201).json(userResp);
});

app.post("/api/auth/login", (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }

  const database = getDB();
  const user = database.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.senha !== senha) {
    return res.status(401).json({ error: "Credenciais inválidas." });
  }

  const { senha: _, ...userResp } = user;
  res.json(userResp);
});

app.get("/api/users", (req, res) => {
  const database = getDB();
  // Return users with score and rank without passwords for safety
  const safeUsers = database.users.map(({ senha: _, ...user }: any) => user);
  res.json(safeUsers);
});

// --- OCCURRENCES MANAGEMENT ---
app.get("/api/ocorrencias", (req, res) => {
  const database = getDB();
  res.json(database.ocorrencias);
});

app.post("/api/ocorrencias", (req, res) => {
  const { titulo, descricao, localizacao, foto, tipo, usuarioId, usuarioNome } = req.body;
  
  if (!titulo || !descricao || !localizacao || !tipo || !usuarioId) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  const database = getDB();
  const newOcorrencia = {
    id: "oco_" + Math.random().toString(36).substr(2, 9),
    titulo,
    descricao,
    localizacao: {
      endereco: localizacao.endereco || "Endereço Desconhecido",
      bairro: localizacao.bairro || "Centro",
      latitude: Number(localizacao.latitude) || -23.55052,
      longitude: Number(localizacao.longitude) || -46.633308
    },
    foto: foto || "vazamento_calcada",
    status: "Aberta",
    tipo,
    dataCriacao: new Date().toISOString(),
    usuarioId,
    usuarioNome: usuarioNome || "Cidadão Anônimo"
  };

  database.ocorrencias.push(newOcorrencia);

  // Gamification reward: Creating a valid report awards +10 points
  const userIndex = database.users.findIndex((u: any) => u.id === usuarioId);
  let pontosAdicionados = 0;
  if (userIndex !== -1) {
    database.users[userIndex].pontuacao = (database.users[userIndex].pontuacao || 0) + 10;
    pontosAdicionados = 10;
  }

  // Generate public alert for admin and other users
  const alertNotif = {
    id: "notif_" + Math.random().toString(36).substr(2, 9),
    mensagem: `Nova ocorrência reportada no bairro ${newOcorrencia.localizacao.bairro}: "${titulo}" por ${newOcorrencia.usuarioNome}.`,
    data: new Date().toISOString(),
    lida: false,
    usuarioId: "usr_admin",
    ocorrenciaId: newOcorrencia.id
  };
  database.notificacoes.push(alertNotif);

  // Also send a personal reward notification to the reporter
  const userRewardNotif = {
    id: "notif_" + Math.random().toString(36).substr(2, 9),
    mensagem: `Obrigado! Seu registro "${titulo}" foi enviado. Você recebeu +10 pontos de sustentabilidade!`,
    data: new Date().toISOString(),
    lida: false,
    usuarioId: usuarioId,
    ocorrenciaId: newOcorrencia.id
  };
  database.notificacoes.push(userRewardNotif);

  saveDB(database);
  res.status(201).json({ ocorrencia: newOcorrencia, pontosGanhados: pontosAdicionados });
});

// Update status (Admin function)
app.put("/api/ocorrencias/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // e.g. "Em Análise", "Aprovada", "Resolvida"
  
  if (!status) {
    return res.status(400).json({ error: "Status é obrigatório." });
  }

  const database = getDB();
  const ocoIndex = database.ocorrencias.findIndex((o: any) => o.id === id);
  if (ocoIndex === -1) {
    return res.status(404).json({ error: "Ocorrência não encontrada." });
  }

  const oldStatus = database.ocorrencias[ocoIndex].status;
  database.ocorrencias[ocoIndex].status = status;

  const reporterId = database.ocorrencias[ocoIndex].usuarioId;
  const ocoTitle = database.ocorrencias[ocoIndex].titulo;

  let extraPoints = 0;
  // If moving to "Resolvida", award +20 points to reporter (gamification Section 4.6)
  if (status === "Resolvida" && oldStatus !== "Resolvida") {
    const usrIndex = database.users.findIndex((u: any) => u.id === reporterId);
    if (usrIndex !== -1) {
      database.users[usrIndex].pontuacao = (database.users[usrIndex].pontuacao || 0) + 20;
      extraPoints = 20;
    }
  }

  // Create update notification
  let notificationMessage = `O status da sua ocorrência "${ocoTitle}" foi atualizado para "${status}".`;
  if (status === "Resolvida") {
    notificationMessage += ` Sua ação ajudou a salvar milhares de litros! Você recebeu +20 pontos sustentáveis.`;
  }

  const statusNotif = {
    id: "notif_" + Math.random().toString(36).substr(2, 9),
    mensagem: notificationMessage,
    data: new Date().toISOString(),
    lida: false,
    usuarioId: reporterId,
    ocorrenciaId: id
  };
  database.notificacoes.push(statusNotif);

  saveDB(database);
  res.json({ ocorrencia: database.ocorrencias[ocoIndex], pontosAdicionais: extraPoints });
});

// --- NOTIFICATIONS ---
app.get("/api/notificacoes", (req, res) => {
  const database = getDB();
  res.json(database.notificacoes);
});

app.put("/api/notificacoes/:id/ler", (req, res) => {
  const { id } = req.params;
  const database = getDB();
  const index = database.notificacoes.findIndex((n: any) => n.id === id);
  if (index !== -1) {
    database.notificacoes[index].lida = true;
    saveDB(database);
    return res.json(database.notificacoes[index]);
  }
  res.status(404).json({ error: "Notificação não encontrada." });
});

app.post("/api/notificacoes/limpar", (req, res) => {
  const { usuarioId } = req.body;
  const database = getDB();
  database.notificacoes = database.notificacoes.map((item: any) => {
    if (item.usuarioId === usuarioId) {
      return { ...item, lida: true };
    }
    return item;
  });
  saveDB(database);
  res.json({ message: "Notificações marcadas como lidas." });
});

// --- METRICAS/DASHBOARD STATS ---
app.get("/api/stats", (req, res) => {
  const database = getDB();
  const ocoList = database.ocorrencias;

  const total = ocoList.length;
  const resolvidas = ocoList.filter((o: any) => o.status === "Resolvida").length;

  // Static/dynamic calculation parameters for water waste:
  // Pre-configured average leak water savings estimate: 1200 Litres per day per active leak.
  // We assume resolved cases saved: 1200L * days active, let's say average 2.5 days = 3000L saved per resolved leak
  const economiaEstimada = resolvidas * 3400 + ocoList.filter((o: any) => o.status === "Aprovada" || o.status === "Em Análise").length * 800;

  // Neighborhoods statistics aggregation
  const bairrosStatsMap: Record<string, number> = {};
  ocoList.forEach((o: any) => {
    const b = o.localizacao.bairro || "Outros";
    bairrosStatsMap[b] = (bairrosStatsMap[b] || 0) + 1;
  });

  const bairrosStats = Object.entries(bairrosStatsMap).map(([nome, quantidade]) => ({
    nome,
    quantidade
  })).sort((a, b) => b.quantidade - a.quantidade);

  res.json({
    totalOcorrencias: total,
    ocorrenciasResolvidas: resolvidas,
    tempoMedioDias: 1.8, // static index representative for active workflow
    bairrosMaisAfetados: bairrosStats.slice(0, 5),
    economiaEstimadaLitros: economiaEstimada
  });
});

// --- CHATBOT WITH AI GROUNDING / EDUCATION ENHANCEMENT ---
app.post("/api/chatbot", async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Mensagem vazia." });
  }

  const normalized = message.toLowerCase();

  // 1. Check local preset answers first (FAQ guidelines per section 4.8 of PRD)
  let localAnswer = "";
  if (normalized.includes("denunciar") || normalized.includes("vazamento") || normalized.includes("registrar") || normalized.includes("como relatar")) {
    localAnswer = "💧 **Como denunciar um vazamento:** Vá na aba **'Registrar Ocorrência'**, preencha o formulário com o tipo de problema (vazamento na calçada, rua, cano estourado, falta de abastecimento), use seu sinal GPS ou selecione uma área no mapa interativo, anexe uma imagem do vazamento e envie seu reporte. Você apoiará sua vizinhança e receberá **+10 pontos** de sustentabilidade!";
  } else if (normalized.includes("economizar") || normalized.includes("dicas") || normalized.includes("poupar") || normalized.includes("reduzir o consumo")) {
    localAnswer = "🌱 **Dicas essenciais de Economia de Água (ODS 6):**<br/>1. **Banhos Curtos:** Reduzir o tempo de banho de 15 para 5 minutos economiza cerca de 90 litros de água tratada.<br/>2. **Feche a Torneira:** Escovar dentes com a torneira aberta desperdiça mais de 10 litros.<br/>3. **Verifique Conexões:** Torneira gotejando consome cerca de 40L por dia. Troque as borrachas velhas!<br/>4. **Reúso de água:** Use a água do enxágue da máquina de lavar para lavar garagens ou descarga.";
  } else if (normalized.includes("acompanhar") || normalized.includes("status") || normalized.includes("minha ocorrencia")) {
    localAnswer = "🔍 **Acompanhamento de Ocorrências:** Suas denúncias geradas aparecem no painel interativo. Quando a prefeitura ou a companhia de saneamento analisa o problema, o status passa de **'Aberta'** para **'Em Análise'**, depois para **'Aprovada'** e, por fim, **'Resolvida'**, somando adicionais **+20 pontos** ao seu usuário!";
  } else if (normalized.includes("falta") || normalized.includes("abastecimento") || normalized.includes("sem água")) {
    localAnswer = "🚰 **Caso esteja enfrentando Falta de Abastecimento:** Inspecione inicialmente se a sua caixa d'água está vazia ou se os registros de entrada gerais da casa estão limpos. Caso os vizinhos também estejam afetados, relate imediatamente um evento do tipo 'Falta de Abastecimento' pelo nosso painel de Ocorrências. Nossa equipe de sanitaristas visualizará a aglomeração de chamados na área geográfica no mapa!";
  } else if (normalized.includes("ods") || normalized.includes("objetivo 6") || normalized.includes("saneamento")) {
    localAnswer = "🌍 **ODS 6 - Água Potável e Saneamento:** Este objetivo de desenvolvimento sustentável da ONU visa garantir o acesso universal e equitativo à água potável segura e ao saneamento adequado até 2030. O **AquaCity** apoia o ODS 6 reduzindo o desperdício físico de água potável através da identificação acelerada de vazamentos e incentivando a conscientização da comunidade!";
  }

  // If we have a local FAQ match, we can optionally use Gemini to enrich it or return it directly.
  // Let's call Gemini which provides supreme interactive conversations!
  const gemini = getGeminiClient();

  if (gemini) {
    try {
      const instructions = `Você é o assistente virtual da AquaCity, uma plataforma inteligente para gestão de desperdício hídrico urbano ligada à ODS 6 (Água Potável e Saneamento).
Sua meta é responder perguntas dos cidadãos de forma prestativa, educada e otimista.
Responda em português do Brasil, utilizando formatação Markdown limpa e amigável.
Evite falar sobre segredos técnicos de programação ou chaves secretas.

O usuário está perguntando: "${message}".
Se a pergunta for relacionada aos tópicos abaixo, privilegie e adapte esta resposta oficial:
${localAnswer ? `- Informação Oficial do Sistema: ${localAnswer}` : "- Sem informação do sistema específica (forneça a melhor resposta pedagógica de ecologia hídrica e saneamento)."}

Lembre o usuário que ele/ela acumula pontos de sustentabilidade ao denunciar vazamentos válidos de água no mapa (+10 no registro e +20 quando for resolvida).`;

      const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction: instructions,
          temperature: 0.7
        }
      });

      const responseText = response.text || "Desculpe, não consegui processar sua resposta no momento.";
      return res.json({ response: responseText });
    } catch (err) {
      console.error("Gemini API call failed, falling back to local handler", err);
      // Fallback if key or API call errors out
    }
  }

  // Dynamic simulated bot response if Gemini is not ready/unconfigured
  if (localAnswer) {
    return res.json({ response: localAnswer + "\n\n💡 *Dica extra:* Para mais detalhes detalhados, acesse a nossa 'Central Educacional' na parte superior da tela!" });
  }

  // Generic water ecology responses
  return res.json({
    response: `Olá! Sou o assistente inteligente da **AquaCity**. Estou aqui para apoiar a preservação hídrica urbana e o engajamento com o **ODS 6 (Água Potável e Saneamento)**.\n\nSinto muito por estar limitado temporariamente em tópicos diversos, mas posso informá-lo sobre:\n- Como denunciar um vazamento ou cano estourado\n- Consultar o mapa e o status de ocorrências\n- Dicas úteis de racionamento e economia doméstica\n- O que é o ODS 6 e qual o impacto do projeto\n\n_Diga-me: o que você gostaria de explorar hoje?_`
  });
});

// ==========================================
// VITE SETUP (Development vs Production)
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with active Vite middlewares...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static bundle assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AquaCity Backend] Running on HTTP endpoint: http://localhost:${PORT}`);
  });
}

startServer();
