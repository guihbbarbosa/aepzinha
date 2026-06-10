import React, { useState, useEffect } from "react";
import { Ocorrencia, User } from "../types";
import { 
  Droplet, 
  MapPin, 
  Upload, 
  FileText, 
  Calendar, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Info 
} from "lucide-react";

interface RegistrarProps {
  currentUser: User;
  onAddOcorrencia: (ocorrencia: any) => Promise<any>;
  selectedCoordinate: { lat: number; lng: number; address: string } | null;
  onClearCoordinate: () => void;
  onNavigateToTab: (tab: string) => void;
}

export default function Registrar({
  currentUser,
  onAddOcorrencia,
  selectedCoordinate,
  onClearCoordinate,
  onNavigateToTab,
}: RegistrarProps) {
  
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("Vila Mariana");
  const [latitude, setLatitude] = useState<number>(-23.5855);
  const [longitude, setLongitude] = useState<number>(-46.6599);
  
  const [tipo, setTipo] = useState<
    "Vazamento em rua" | "Vazamento em calçada" | "Desperdício em espaço público" | "Falta de abastecimento" | "Água acumulada"
  >("Vazamento em calçada");

  const [foto, setFoto] = useState<string>("vazamento_calcada"); // or base64 data
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [pointsAwarded, setPointsAwarded] = useState<number>(0);

  // Sync selected coordinate from Map tap
  useEffect(() => {
    if (selectedCoordinate) {
      setEndereco(selectedCoordinate.address);
      setLatitude(selectedCoordinate.lat);
      setLongitude(selectedCoordinate.lng);
      
      // Auto-extract possible neighborhood from string
      const parts = selectedCoordinate.address.split(" - ");
      if (parts.length > 1) {
        setBairro(parts[1]);
      } else {
        setBairro("Centro");
      }
    }
  }, [selectedCoordinate]);

  // Handle file import conversions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate obtaining live GPS coordinates
  const handleSimulateGPS = () => {
    // Center of São Paulo offsets slightly
    const offsetLat = (Math.random() - 0.5) * 0.05;
    const offsetLng = (Math.random() - 0.5) * 0.05;
    const generatedLat = -23.5581 + offsetLat;
    const generatedLng = -46.6433 + offsetLng;

    const suburbs = ["Pinheiros", "Jardins", "Consolação", "Santo Amaro", "Liberdade", "Centro", "Butantã", "Lapa", "Belém"];
    const streets = ["Avenida Rebouças", "Rua da Consolação", "Alameda Lorena", "Avenida Brigadeiro Faria Lima", "Avenida São João", "Avenida Santo Amaro", "Rua Pamplona"];

    const rSuburb = suburbs[Math.floor(Math.random() * suburbs.length)];
    const rStreet = streets[Math.floor(Math.random() * streets.length)];
    const rNum = Math.floor(Math.random() * 1200) + 10;

    setLatitude(Number(generatedLat.toFixed(6)));
    setLongitude(Number(generatedLng.toFixed(6)));
    setBairro(rSuburb);
    setEndereco(`${rStreet}, ${rNum} - ${rSuburb}`);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim() || !descricao.trim() || !endereco.trim()) {
      setErrorMsg("Por favor, preencha o título, descrição e endereço.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const payload = {
      titulo,
      descricao,
      localizacao: {
        endereco,
        bairro,
        latitude,
        longitude
      },
      foto,
      tipo,
      usuarioId: currentUser.id,
      usuarioNome: currentUser.nome
    };

    try {
      const resp = await onAddOcorrencia(payload);
      setPointsAwarded(resp.pontosGanhados || 10);
      setSuccess(true);
      onClearCoordinate(); // clear map coordinates stash
      
      // Reset form fields
      setTitulo("");
      setDescricao("");
      setFoto("vazamento_calcada");
    } catch (err: any) {
      setErrorMsg("Erro ao salvar ocorrência: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const availableCategories = [
    { value: "Vazamento em rua", desc: "Vazamento contínuo de água de lavagem ou cano estourado no asfalto." },
    { value: "Vazamento em calçada", desc: "Rachaduras pingando ou jorrando água limpa antes de entrar na residência." },
    { value: "Desperdício em espaço público", desc: "Chafariz, aspersores de praças públicas ou hidrante ativo quebrados." },
    { value: "Falta de abastecimento", desc: "Interrupção completa de fornecimento hídrico em escala coletiva de bairro." },
    { value: "Água acumulada", desc: "Poças imensas de água limpa por falha no encanamento de bueiros públicos." }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      
      {success ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-8 text-center space-y-6 shadow-md max-w-xl mx-auto my-12 animate-fade-in text-slate-800">
          <div className="mx-auto h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-50">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Ocorrência Registrada com Sucesso!</h3>
            <p className="text-xs text-gray-400">
              Obrigado pela sua atitude cidadã. Sua sinalização foi cadastrada de forma definitiva no painel urbano.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-2xl flex items-center justify-between border border-blue-400/20 max-w-md mx-auto">
            <div className="text-left">
              <span className="text-[10px] text-blue-100 font-bold uppercase tracking-wider block">Recompensa Sustentável</span>
              <span className="text-sm font-black font-mono block mt-0.5">Pontos Recebidos:</span>
            </div>
            <div className="flex items-center space-x-1 font-mono font-bold text-xl bg-white/20 px-3.5 py-1.5 rounded-xl border border-white/15">
              <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
              <span>+{pointsAwarded} pts</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setSuccess(false);
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Registrar Outra
            </button>
            <button
              onClick={() => onNavigateToTab("mapa")}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-blue-100 cursor-pointer"
            >
              Ver no Mapa
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 shadow-xs space-y-6 text-left">
          
          {/* Header instructions block */}
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">Formulário de Registro Cidadão</h3>
            <p className="text-xs text-gray-400 mt-0.5">Defina o problema do local com exatidão para facilitar o reparo rápido.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-start space-x-2.5">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form parameters */}
          <div className="space-y-4">
            
            {/* Title / Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              <div className="md:col-span-8 space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Título da Ocorrência</label>
                <input
                  type="text"
                  placeholder="Ex: Vazamento de água limpa jorrando na calçada"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold"
                />
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Tipologia</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800"
                >
                  <option value="Vazamento em rua">Vazamento em rua</option>
                  <option value="Vazamento em calçada">Vazamento em calçada</option>
                  <option value="Desperdício em espaço público">Desperdício Público</option>
                  <option value="Falta de abastecimento">Falta de Abastecimento</option>
                  <option value="Água acumulada">Água Acumulada</option>
                </select>
              </div>

            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Descrição Detalhada</label>
              <textarea
                rows={3}
                placeholder="Informe detalhes do desperdício de água: há quanto tempo ocorre, volume aproximado, número da residência vizinha mais próxima..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed font-sans block"
              />
            </div>

            {/* Georeference and Address fields */}
            <div className="space-y-3.5 pt-2 border-t border-gray-50">
              
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 block leading-none">Dados de Localização Geográfica</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Eles nos dão a posição visual do desperdício.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateGPS}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Gerar Sinal GPS SP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      alert("Use o mapa na aba anterior para tocar e escolher pontos visuais!");
                      onNavigateToTab("mapa");
                    }}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-250 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-lg cursor-pointer"
                  >
                    <span>Abrir no Mapa</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-8 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-500 block">Endereço Completo</label>
                  <input
                    type="text"
                    placeholder="Ex: Avenida Brigadeiro Luís Antônio, 120 - Bela Vista"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800"
                  />
                </div>

                <div className="md:col-span-4 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-500 block">Bairro de SP</label>
                  <input
                    type="text"
                    placeholder="Ex: Bela Vista"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800"
                  />
                </div>

                <div className="md:col-span-6 space-y-1 grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] uppercase font-extrabold text-gray-450 block">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-550 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-extrabold text-gray-450 block">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-550 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Drag & Drop Upload Photo Image Container Section */}
            <div className="space-y-2 pt-2 border-t border-gray-50">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Foto Real do Vazamento</label>
              
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                
                {/* Drag zone */}
                <div 
                  className={`md:col-span-4 border-2 border-dashed rounded-2xl p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-colors relative ${
                    dragActive 
                      ? "border-blue-500 bg-blue-50/20" 
                      : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="leak-file-picker"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Camera className="h-8 w-8 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700 inline block">
                    Arraste ou clique para enviar foto
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Formatos suportados: PNG, JPG ou JPEG</span>
                </div>

                {/* Preset default illustrations list selector */}
                <div className="md:col-span-2 space-y-1 text-left">
                  <span className="text-[10px] font-bold text-slate-550 uppercase tracking-widest block mb-1">
                    Exemplos Rápidos
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-700">
                    <button
                      type="button"
                      onClick={() => setFoto("vazamento_calcada")}
                      className={`p-2 rounded-lg border text-left flex items-center justify-between cursor-pointer ${
                        foto === "vazamento_calcada" ? "border-blue-600 bg-blue-50/30 text-blue-700 font-bold" : "border-gray-200 bg-white"
                      }`}
                    >
                      <span>Vazamento Calçada</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFoto("vazamento_asfalto")}
                      className={`p-2 rounded-lg border text-left flex items-center justify-between cursor-pointer ${
                        foto === "vazamento_asfalto" ? "border-blue-600 bg-blue-50/30 text-blue-700 font-bold" : "border-gray-200 bg-white"
                      }`}
                    >
                      <span>Vazamento Rua</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFoto("desperdicios")}
                      className={`p-2 rounded-lg border text-left flex items-center justify-between cursor-pointer ${
                        foto === "desperdicios" ? "border-blue-600 bg-blue-50/30 text-blue-700 font-bold" : "border-gray-200 bg-white"
                      }`}
                    >
                      <span>Desperdício Público</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Upload Preview if not default keys */}
              {foto && !["vazamento_calcada", "vazamento_asfalto", "desperdicios"].includes(foto) && (
                <div className="mt-2.5 p-2 bg-emerald-50 rounded-xl border border-emerald-200 inline-flex items-center space-x-2 text-xs text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Sua imagem customizada foi enviada com sucesso!</span>
                  <button 
                    type="button" 
                    onClick={() => setFoto("vazamento_calcada")} 
                    className="text-red-500 font-bold hover:underline ml-1"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Action Row Submit Button */}
          <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-start space-x-1.5 text-xs text-gray-500 max-w-sm mr-2 leading-tight">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <span>Ao enviar seu reporte hídrico, nossa equipe técnica irá avaliar a procedência regional para despachar soluções em minutos.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl text-xs transition-colors shadow-md shadow-blue-100 cursor-pointer flex items-center space-x-1.5 shrink-0 disabled:opacity-40"
            >
              <Droplet className="h-3.5 w-3.5 fill-current" />
              <span>{loading ? "Salvando no Banco..." : "Enviar Ocorrência"}</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
