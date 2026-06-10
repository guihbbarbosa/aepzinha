import React, { useState } from "react";
import { Ocorrencia, OcorrenciaStatus, User } from "../types";
import { 
  MapPin, 
  Map as MapIcon, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  User as UserIcon, 
  MessageSquare, 
  Send,
  Droplet,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut
} from "lucide-react";

interface MapSectionProps {
  ocorrencias: Ocorrencia[];
  currentUser: User;
  onUpdateStatus: (id: string, newStatus: OcorrenciaStatus) => void;
  isAdmin: boolean;
  onSelectMapCoordinate: (lat: number, lng: number, address: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function MapSection({
  ocorrencias,
  currentUser,
  onUpdateStatus,
  isAdmin,
  onSelectMapCoordinate,
  onNavigateToTab,
}: MapSectionProps) {
  const [filterType, setFilterType] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(
    ocorrencias.length > 0 ? ocorrencias[0] : null
  );

  // Map settings
  const [mapType, setMapType] = useState<"ruas" | "hidrografica">("ruas");
  const [zoomLevel, setZoomLevel] = useState<number>(3); // Simulates map zoom

  // Local comments state per occurrence dynamically
  const [commentText, setCommentText] = useState("");
  const [commentsMap, setCommentsMap] = useState<Record<string, { autor: string; texto: string; data: string }[]>>({
    oco_1: [
      { autor: "SABESP (Oficial)", texto: "Enviando equipe técnica de inspeção emergencial ao local em 30 minutos.", data: new Date(Date.now() - 3600000).toISOString() }
    ],
    oco_2: [
      { autor: "Prefeitura SP", texto: "Notificação encaminhada à CET para sinalização asfáltica.", data: new Date(Date.now() - 3600000 * 6).toISOString() }
    ]
  });

  // Filter occurrences
  const filtered = ocorrencias.filter((o) => {
    const matchesSearch = 
      o.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.localizacao.endereco.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.localizacao.bairro.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "todos" || o.tipo === filterType;
    const matchesStatus = filterStatus === "todos" || o.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: OcorrenciaStatus) => {
    switch (status) {
      case "Aberta":
        return { label: "Aberta", color: "bg-red-50 text-red-700 border-red-200" };
      case "Em Análise":
        return { label: "Em Análise", color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "Aprovada":
        return { label: "Aprovada", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "Resolvida":
        return { label: "Resolvida", color: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    }
  };

  const getStatusColorCircle = (status: OcorrenciaStatus) => {
    switch (status) {
      case "Aberta": return "bg-red-500 ring-red-300";
      case "Em Análise": return "bg-amber-500 ring-amber-300";
      case "Aprovada": return "bg-blue-500 ring-blue-300";
      case "Resolvida": return "bg-emerald-500 ring-emerald-300";
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedOcorrencia) return;

    const newComment = {
      autor: isAdmin ? "Gestor Público (Admin)" : currentUser.nome,
      texto: commentText,
      data: new Date().toISOString()
    };

    const currentComments = commentsMap[selectedOcorrencia.id] || [];
    setCommentsMap({
      ...commentsMap,
      [selectedOcorrencia.id]: [...currentComments, newComment]
    });

    setCommentText("");
  };

  // Pre-configured São Paulo map boundaries for interactive visual elements
  const mapPoints = filtered.map((o) => {
    // Math maps coordinate offsets on a 2D plane for visual simulator
    // Latitude range: -23.55 to -23.61 -> y percentage
    // Longitude range: -46.63 to -46.68 -> x percentage
    const latBase = -23.55;
    const latRange = -0.06;
    const lngBase = -46.63;
    const lngRange = -0.05;

    const y = ((o.localizacao.latitude - latBase) / latRange) * 80 + 10; // offset inside 0-100% boundary space
    const x = ((o.localizacao.longitude - lngBase) / lngRange) * 80 + 10;

    return { ...o, x: isNaN(x) ? 50 : Math.max(5, Math.min(x, 95)), y: isNaN(y) ? 50 : Math.max(5, Math.min(y, 95)) };
  });

  const customPickCoordinatesOnMap = (e: React.MouseEvent<HTMLDivElement>) => {
    // User clicks empty map location to report! Geonavigate coords!
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const pctX = clickX / rect.width;
    const pctY = clickY / rect.height;

    // Convert back from percentages to latitude and longitude coordinates
    // SP Central point defaults
    const lat = -23.55 + pctY * -0.06;
    const lng = -46.63 + pctX * -0.05;

    // Fast-reverse geocoding simulation with local neighborhoods
    const neighborhoods = ["Jardins", "Cerqueira César", "Consolação", "Vila Mariana", "Pinheiros", "Bela Vista", "Santa Cecília", "Perdizes", "Santo Amaro"];
    const streetNames = ["Alameda Santos", "Rua Augusta", "Avenida Brigadeiro Luís Antônio", "Rua Pamplona", "Avenida Consolação", "Rua Hadock Lobo", "Avenida Santo Amaro"];
    
    const randomNeighborhood = neighborhoods[Math.floor(Math.abs(lat * 1000) % neighborhoods.length)];
    const randomStreet = streetNames[Math.floor(Math.abs(lng * 1000) % streetNames.length)];
    const randomNum = Math.floor(Math.abs(lat + lng) * 1234) % 1500 + 150;
    
    const address = `${randomStreet}, ${randomNum} - ${randomNeighborhood}`;

    // Prompt user on coordinate pick
    onSelectMapCoordinate(lat, lng, address);
    
    // Smooth user guidance
    alert(`📍 Localização marcada! Coordenadas registradas:\n\nEndereço: ${address}\nLat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}\n\nNós copiamos esses dados para a ficha de cadastro da nova ocorrência!`);
    onNavigateToTab("registrar");
  };

  const getPhotoPlaceholder = (photo: string, type: string) => {
    if (photo && photo !== "vazamento_calcada" && photo !== "vazamento_asfalto" && photo !== "desperdicios" && photo !== "resolvida" && photo.startsWith("data:")) {
      return photo; // base64 payload
    }
    // Return high contrast vector styling representing issue
    switch (type) {
      case "Vazamento em rua": return "https://images.unsplash.com/photo-1560782205-4dd83ceb0270?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
      case "Vazamento em calçada": return "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=400";
      case "Desperdício em espaço público": return "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=400";
      case "Falta de abastecimento": return "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=400";
      default: return "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=400";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Sidebar Control: Ocorrências List Search & Filters */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-150 p-4 space-y-4 shadow-xs">
        <div>
          <h3 className="font-bold text-gray-950 text-sm flex items-center space-x-1.5">
            <Filter className="h-4 w-4 text-blue-600" />
            <span>Filtro de Logística</span>
          </h3>
          <p className="text-xs text-gray-450 mt-1">Busque ocorrências hídricas em andamento.</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            className="w-full text-xs font-semibold pl-9 pr-4 py-2 bg-gray-50 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            placeholder="Buscar por bairro, rua ou problema..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-450 block mb-1">Status</label>
            <select
              className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="todos">Todos Status</option>
              <option value="Aberta">Aberta</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Aprovada">Aprovada</option>
              <option value="Resolvida">Resolvida</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-450 block mb-1">Tipologia</label>
            <select
              className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="todos">Todas Categorias</option>
              <option value="Vazamento em rua">Vazamento em rua</option>
              <option value="Vazamento em calçada">Vazamento em calçada</option>
              <option value="Desperdício em espaço público">Desperdício</option>
              <option value="Falta de abastecimento">Falta de Água</option>
              <option value="Água acumulada">Água Acumulada</option>
            </select>
          </div>
        </div>

        {/* Occurrences Items Card Container Stack */}
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
              <p className="text-xs text-gray-400 font-medium">Nenhuma ocorrência encontrada.</p>
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedOcorrencia?.id === item.id;
              const badge = getStatusBadge(item.status);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedOcorrencia(item);
                    // Centralize on this element coordinates simulations
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-left block relative ${
                    isSelected
                      ? "bg-blue-50/50 border-blue-500 shadow-xs"
                      : "bg-white border-gray-150 hover:border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] font-mono text-gray-400 block">{item.id}</span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{item.titulo}</h4>
                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{item.localizacao.endereco}</p>
                  <div className="flex justify-between items-center mt-2.5 text-[9px] text-gray-400">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded-md font-semibold text-gray-600">
                      {item.tipo}
                    </span>
                    <span>
                      {new Date(item.dataCriacao).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50/35 p-3 rounded-xl border border-blue-100 flex items-start space-x-2">
          <Droplet className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10.5px] text-blue-800 leading-snug">
            <strong>Ajuda Rápida:</strong> Toque em qualquer espaço vago do mapa ao lado direito para marcar coordenadas e gerar novos reportes de forma geolocalizada!
          </p>
        </div>
      </div>

      {/* Center Grid Column: Visual Simulated Map & Detailed selected log */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Visual Map Canvas Card */}
        <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden flex flex-col">
          {/* Map Header Toolbar with layers buttons */}
          <div className="p-3 bg-gray-50/80 border-b border-gray-150 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center space-x-2">
              <MapIcon className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold text-gray-800">Mapa de Análise Urbana de São Paulo</span>
            </div>
            
            <div className="flex items-center space-x-1.5 text-xs">
              {/* Layout switcher */}
              <button
                onClick={() => setMapType("ruas")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
                  mapType === "ruas"
                    ? "bg-white text-blue-600 shadow-xxs border border-gray-200"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Layers className="h-3 w-3" />
                <span>Malha Urbana</span>
              </button>
              <button
                onClick={() => setMapType("hidrografica")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
                  mapType === "hidrografica"
                    ? "bg-blue-600 text-white shadow-xxs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Droplet className="h-3 w-3" />
                <span>Hidrográfico</span>
              </button>

              <div className="h-4 w-px bg-gray-300 mx-1" />

              <button 
                onClick={() => setZoomLevel(Math.min(zoomLevel + 1, 5))}
                className="p-1 hover:bg-white border hover:border-gray-200 transition-colors rounded"
                title="Aumentar Zoom"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(Math.max(zoomLevel - 1, 1))}
                className="p-1 hover:bg-white border hover:border-gray-200 transition-colors rounded"
                title="Diminuir Zoom"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Map Visual Simulator */}
          <div 
            onClick={customPickCoordinatesOnMap}
            className="h-80 w-full relative cursor-crosshair overflow-hidden border-b border-gray-150 select-none transition-all duration-300"
            style={{
              backgroundColor: mapType === "ruas" ? "#f1f5f9" : "#0f172a"
            }}
          >
            {/* Ambient Water pipe flow line visuals overlay under hydrographic view mode */}
            {mapType === "hidrografica" ? (
              <svg className="absolute inset-0 w-full h-full opacity-45 pointer-events-none">
                {/* Visual lines depicting pipe lines */}
                <line x1="0" y1="50" x2="100%" y2="150" stroke="#0ea5e9" strokeWidth="4" strokeDasharray="5,10" className="animate-[dash_15s_linear_infinite]" />
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="5,7" />
                <line x1="100" y1="10%" x2="500" y2="80%" stroke="#0284c7" strokeWidth="2" />
                <circle cx="50%" cy="50%" r="90" stroke="#0ea5e9" strokeWidth="1" fill="none" strokeDasharray="3" />
                <circle cx="30%" cy="40%" r="140" stroke="#0ea5e9" strokeWidth="1" fill="none" strokeDasharray="13" />
              </svg>
            ) : (
              <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
                {/* Visual grid representing city blocks of São Paulo */}
                <path d="M 0,20 L 1000,20 M 0,60 L 1000,60 M 0,100 L 1000,100 M 0,140 L 1000,140 M 0,180 L 1000,185 M 0,220 L 1000,220 M 0,260 L 1000,260 M 0,300 L 1000,300 M 0,340 L 1000,340" stroke="#cbd5e1" strokeWidth="1" />
                <path d="M 50,0 L 50,500 M 110,0 L 110,500 M 180,0 L 180,500 M 260,0 L 260,500 M 340,0 L 340,500 M 420,0 L 420,500 M 520,0 L 520,500 M 600,0 L 600,500 M 700,0 L 700,500" stroke="#cbd5e1" strokeWidth="1" />
                {/* Main Paulista avenues representation lines */}
                <line x1="0" y1="110" x2="100%" y2="290" stroke="#94a3b8" strokeWidth="11" />
                <line x1="200" y1="0" x2="350" y2="100%" stroke="#94a3b8" strokeWidth="9" />
              </svg>
            )}

            {/* Simulated parks representation */}
            <div className={`absolute top-10 left-5 rounded-full filter blur-xl opacity-20 transition-all ${
              mapType === "ruas" ? "bg-green-700 w-44 h-32" : "bg-cyan-900 w-44 h-32"
            }`} />
            
            <div className={`absolute bottom-8 right-16 rounded-full filter blur-xl opacity-25 transition-all ${
              mapType === "ruas" ? "bg-green-600 w-48 h-28" : "bg-cyan-950 w-48 h-28"
            }`} />

            {/* Mini center prompt to direct actions */}
            <div className="absolute top-2.5 left-2.5 bg-black/75 px-2.5 py-1.5 rounded-lg text-[10px] text-white space-y-0.5 pointer-events-none max-w-[210px] uppercase font-mono tracking-wider">
              <span className="block font-bold text-amber-400">🔥 Monitor de Áreas Críticas</span>
              <span className="block text-gray-300">Toque em qualquer rua para relatar vazamentos</span>
            </div>

            {/* Rendering Markers */}
            {mapPoints.map((item) => {
              const isSelected = selectedOcorrencia?.id === item.id;
              const circleColor = getStatusColorCircle(item.status);

              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation(); // Don't pick coordinates instead
                    setSelectedOcorrencia(item);
                  }}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group transition-transform z-10 hover:scale-135"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                  }}
                >
                  <div className="relative">
                    {/* Ring highlight animation for open cases */}
                    {item.status === "Aberta" && (
                      <span className="absolute -inset-2.5 rounded-full bg-red-400 opacity-40 animate-ping" />
                    )}
                    
                    {/* Main PIN marker */}
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shadow-md transition-colors ${
                      isSelected 
                        ? "bg-blue-600 text-white scale-110" 
                        : "bg-slate-900 text-white"
                    }`}>
                      <Droplet className={`h-3 w-3 fill-current ${
                        item.status === "Resolvida" ? "text-emerald-400" : "text-cyan-400"
                      }`} />
                    </div>

                    {/* Miniature dot depicting active status color */}
                    <span className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-white ring-2 ${circleColor}`} />

                    {/* Pop-up title tooltips */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-950 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                      {item.titulo}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 text-center text-xs text-gray-500 font-medium">
            💡 Encontrou um problema perto de você? <strong>Toque acima para marcar e cadastrar!</strong>
          </div>
        </div>

        {/* Detailed Selected Occurrences card & interaction feedback logs */}
        {selectedOcorrencia ? (
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-6">
            
            {/* Header metadata Info */}
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <div className="flex items-center space-x-2 text-xs text-gray-450 mb-1">
                  <span className="font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {selectedOcorrencia.id}
                  </span>
                  <span>&bull;</span>
                  <span className="font-semibold text-blue-700">{selectedOcorrencia.tipo}</span>
                  <span>&bull;</span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span>{new Date(selectedOcorrencia.dataCriacao).toLocaleDateString("pt-BR")}</span>
                  </span>
                </div>
                
                <h3 className="text-lg font-black text-gray-950 tracking-tight leading-snug">
                  {selectedOcorrencia.titulo}
                </h3>
                
                <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 inline" />
                  <span className="font-medium text-gray-700">{selectedOcorrencia.localizacao.endereco}</span>
                  <span>(bairro {selectedOcorrencia.localizacao.bairro})</span>
                </div>
              </div>

              {/* Status Selector for ADMIN (to award points) */}
              <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <div className="text-left mr-1">
                  <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Status Atual</span>
                  <span className="text-xs font-bold text-slate-800">{selectedOcorrencia.status}</span>
                </div>

                {isAdmin ? (
                  <div className="flex items-center space-x-1.5 pt-px">
                    <select
                      className="text-xs font-bold bg-white border border-gray-300 p-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-blue-800 focus:border-blue-600"
                      value={selectedOcorrencia.status}
                      onChange={(e) => onUpdateStatus(selectedOcorrencia.id, e.target.value as OcorrenciaStatus)}
                    >
                      <option value="Aberta">Aberta</option>
                      <option value="Em Análise">Em Análise</option>
                      <option value="Aprovada">Aprovada</option>
                      <option value="Resolvida">Resolvida</option>
                    </select>
                    <div className="bg-purple-100 text-purple-800 p-1 rounded-lg" title="Apenas administradores podem atualizar o status!">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 flex items-center space-x-0.5 ml-2">
                    {selectedOcorrencia.status === "Resolvida" ? (
                      <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg font-bold flex items-center space-x-1 animate-pulse">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Consertado!</span>
                      </div>
                    ) : (
                      <span className="italic">Aguardando reparo público</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Description & Image Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-4 border-t border-gray-100">
              {/* Photo representation */}
              <div className="md:col-span-2 space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Foto Enviada</span>
                <div className="aspect-video sm:aspect-square bg-slate-100 border border-slate-200 rounded-xl overflow-hidden relative group">
                  <img
                    src={getPhotoPlaceholder(selectedOcorrencia.foto, selectedOcorrencia.tipo)}
                    alt={selectedOcorrencia.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-85 p-3 flex items-end">
                    <span className="text-[10px] font-mono text-white block">Sinalizado por {selectedOcorrencia.usuarioNome}</span>
                  </div>
                </div>
              </div>

              {/* Description & pipeline info */}
              <div className="md:col-span-3 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Descrição do Ocorrido</span>
                  <p className="text-xs text-gray-700 leading-relaxed font-sans block p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                    {selectedOcorrencia.descricao || "Nenhuma descrição adicional informada."}
                  </p>
                </div>

                <div className="bg-blue-50/40 rounded-xl p-3 border border-blue-100 text-xs text-blue-900 space-y-1">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="font-semibold">Localização exata:</span>
                    <span className="font-mono text-gray-500">{selectedOcorrencia.localizacao.latitude.toFixed(5)}, {selectedOcorrencia.localizacao.longitude.toFixed(5)}</span>
                  </div>
                  {selectedOcorrencia.status === "Resolvida" ? (
                    <p className="text-[11px] text-emerald-800 pt-1">
                      🌱 **Impacto Real:** Este vazamento resolvido barrou o desperdício estimado de aproximadamente 3.400 Litros de água limpa por dia!
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-800 pt-1">
                      ⚠️ **Impacto Estimado:** Vazamentos desse tipo derramam em média 1.200 Litros por dia antes do conserto técnico.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Public/Admin Feedback & Comments log */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <div className="flex items-center space-x-1.5">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-bold text-gray-900">Histórico de Providências & Comentários</h4>
              </div>

              {/* Comments stack */}
              <div className="space-y-3">
                {(!commentsMap[selectedOcorrencia.id] || commentsMap[selectedOcorrencia.id].length === 0) ? (
                  <p className="text-xs text-gray-400 italic">Nenhum comentário ou providência logada ainda.</p>
                ) : (
                  commentsMap[selectedOcorrencia.id].map((comm, idx) => {
                    const isAdminAuthor = comm.autor.includes("Admin") || comm.autor.includes("SABESP") || comm.autor.includes("Prefeitura");
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl text-xs space-y-1 border ${
                          isAdminAuthor
                            ? "bg-purple-50/50 border-purple-250 text-purple-950"
                            : "bg-gray-50 border-gray-150 text-gray-800"
                        }`}
                      >
                        <div className="flex justify-between font-bold">
                          <span className="flex items-center space-x-1">
                            <UserIcon className="h-3 w-3 shrink-0" />
                            <span>{comm.autor}</span>
                          </span>
                          <span className="text-[10px] text-gray-400 font-normal">
                            {new Date(comm.data).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="leading-relaxed text-[11px]">{comm.texto}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Leave comment form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    isAdmin 
                    ? "Escreva um comunicado ou providência técnica oficial..." 
                    : "Deixe um comentário público ou observação local sobre o vazamento..."
                  }
                  className="flex-1 text-xs px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-xl"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 flex items-center justify-center cursor-pointer font-bold shrink-0 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center text-gray-400 text-xs">
            Nenhuma ocorrência selecionada. Por favor, marque uma no filtro da barra lateral ou selecione uma coordenada no mapa.
          </div>
        )}

      </div>
    </div>
  );
}
