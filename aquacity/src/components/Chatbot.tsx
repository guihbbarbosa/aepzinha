import React, { useState, useRef, useEffect } from "react";
import { ChatbotMessage } from "../types";
import { MessageSquare, Send, Sparkles, User as UserIcon, Bot, ArrowRight, HelpCircle, RefreshCw } from "lucide-react";

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatbotMessage[]>([
    {
      id: "msg_init",
      sender: "bot",
      text: "Olá! Sou o assistente virtual do **AquaCity** 💧\n\nEstou aqui para tirar dúvidas sobre preservação hídrica urbana, metas do **ODS 6 (Água Potável e Saneamento)** e dar instruções de como relatar vazamentos.\n\nComo posso apoiar você hoje?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "Como denunciar um vazamento?",
    "Como economizar água?",
    "Como acompanhar uma ocorrência?",
    "O que fazer em caso de falta de abastecimento?",
    "O que é o ODS 6?"
  ];

  // Scroll to bottom when messages load/update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatbotMessage = {
      id: "msg_" + Math.random().toString(36).substr(2, 9),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const resp = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await resp.json();
      
      const botMsg: ChatbotMessage = {
        id: "msg_" + Math.random().toString(36).substr(2, 9),
        sender: "bot",
        text: data.response || "Infelizmente no momento não consegui obter resposta.",
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot query failed", err);
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          id: "msg_" + Math.random().toString(36).substr(2, 9),
          sender: "bot",
          text: "⚠️ Ocorreu um erro de conexão com nossos servidores. Por favor, verifique se seu servidor Node.js está online ou tente novamente mais tarde.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  // Convert raw markdown line breaks to HTML elements safely for chatbot styling
  const formatBotMsg = (rawText: string) => {
    return rawText.split("\n").map((line, idx) => {
      // Bold syntax conversion
      let processed = line;
      
      // Simple markdown bold replacement
      const matches = line.match(/\*\*(.*?)\*\*/g);
      if (matches) {
        matches.forEach((m) => {
          const rawMatches = m.replace(/\*\*/g, "");
          processed = processed.replace(m, `<strong>${rawMatches}</strong>`);
        });
      }

      // Simple markdown italics
      const matchesItalic = processed.match(/\*(.*?)\*/g);
      if (matchesItalic) {
        matchesItalic.forEach((m) => {
          const rawMatches = m.replace(/\*/g, "");
          processed = processed.replace(m, `<em>${rawMatches}</em>`);
        });
      }

      // Br logic
      if (line === "") return <div key={idx} className="h-2" />;

      return <p key={idx} className="leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: processed }} />;
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-xs flex flex-col h-[520px]">
      
      {/* Chat header */}
      <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
        <div className="flex items-center space-x-3 text-left">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
            <Bot className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold font-mono tracking-wider text-blue-400 uppercase block leading-none">SUPORTE ECOLOGIA</span>
            <span className="text-sm font-black tracking-tight block mt-0.5">Assistente Inteligente AquaCity</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-[10px] uppercase font-mono">Gemini AI Grounding</span>
        </div>
      </div>

      {/* Messages field scroll */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {messages.map((m) => {
          const isBot = m.sender === "bot";
          return (
            <div
              key={m.id}
              className={`flex gap-3 text-xs max-w-[85%] ${
                isBot ? "self-start text-left mr-auto" : "self-end ml-auto flex-row-reverse text-right"
              }`}
            >
              {/* Profile icon */}
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-xxs ${
                isBot ? "bg-blue-600 text-white" : "bg-slate-800 text-white"
              }`}>
                {isBot ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
              </div>

              {/* Box bubble */}
              <div className={`p-3.5 rounded-2xl border ${
                isBot 
                  ? "bg-white border-gray-150 text-gray-800 rounded-tl-none font-sans leading-relaxed" 
                  : "bg-blue-600 border-blue-500 text-white rounded-tr-none font-semibold text-left"
              }`}>
                {isBot ? (
                  <div>{formatBotMsg(m.text)}</div>
                ) : (
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                )}
                <span className={`text-[9px] block mt-1.5 ${isBot ? "text-gray-400" : "text-blue-200"}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex gap-3 text-xs max-w-[80%] self-start text-left mr-auto">
            <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 animate-bounce">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-gray-150 text-gray-800 rounded-tl-none flex items-center space-x-2">
              <RefreshCw className="h-3.5 w-3.5 text-blue-600 animate-spin" />
              <span className="text-xs text-gray-500 font-medium italic">Consultando nossa Inteligência Artificial...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested quick FAQ list prompt section */}
      <div className="p-3 bg-white border-t border-gray-150 scrollbar-none shrink-0 overflow-x-auto flex space-x-1.5 whitespace-nowrap">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            disabled={loading}
            onClick={() => handleSendMessage(q)}
            className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 font-bold py-1.5 px-3 rounded-lg text-xs cursor-pointer transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Text Form Input */}
      <form onSubmit={handleFormSubmit} className="p-3 bg-gray-50 border-t border-gray-150 flex gap-2 shrink-0">
        <input
          type="text"
          className="flex-1 text-xs px-3 py-2.5 bg-white border border-gray-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 font-semibold"
          placeholder="Faça uma pergunta sobre a rede AquaCity ou cuidados hídricos..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2.5 rounded-xl transition-colors shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
}
