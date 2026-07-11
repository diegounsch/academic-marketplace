/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, DollarSign, BookOpen, AlertCircle, RefreshCw, CheckCircle, Tag, TrendingUp, FileText } from "lucide-react";
import { Category, Condition } from "../types";

interface AIEvaluatorProps {
  onPublishFromAI: (aiProduct: {
    title: string;
    category: Category;
    condition: Condition;
    price: number;
    description: string;
    courseCode: string;
  }) => void;
}

export default function AIEvaluator({ onPublishFromAI }: AIEvaluatorProps) {
  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(Category.TEXTBOOKS);
  const [condition, setCondition] = useState<Condition>(Condition.GOOD);
  const [description, setDescription] = useState("");

  // Loading & Result state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [evaluationResult, setEvaluationResult] = useState<{
    recommendedPrice: number;
    demandLevel: "Alta" | "Media" | "Baja";
    demandReason: string;
    courseCodes: string[];
    optimizedDescription: string;
    tagSuggestions: string[];
    isSimulated?: boolean;
  } | null>(null);

  const [published, setPublished] = useState(false);

  // Simulated step loading messages for rich UX
  const loadingMessages = [
    "Analizando catálogo del mercado universitario...",
    "Consultando algoritmos de tasación de IA...",
    "Calculando nivel de demanda por semestre...",
    "Redactando descripción de ventas optimizada para estudiantes...",
    "¡Listo! Generando reporte académico de tasación..."
  ];

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Por favor, ingresa un título para el artículo.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setEvaluationResult(null);
    setPublished(false);
    setLoadingStep(0);

    // Dynamic steps tick
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const response = await fetch("/api/gemini/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          condition,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("La tasación por IA falló. Revisa tu conexión o inténtalo de nuevo.");
      }

      const data = await response.json();
      setEvaluationResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al conectar con la tasación de IA.");
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const handlePublish = () => {
    if (!evaluationResult) return;
    onPublishFromAI({
      title,
      category,
      condition,
      price: evaluationResult.recommendedPrice,
      description: evaluationResult.optimizedDescription,
      courseCode: evaluationResult.courseCodes?.[0] || "GEN-101",
    });
    setPublished(true);
  };

  return (
    <div className="max-w-6xl mx-auto py-4">
      {/* Introduction Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-ambient mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
          <Sparkles className="w-48 h-48 text-secondary" />
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50/50 rounded-xl text-primary">
            <Sparkles className="w-8 h-8 text-blue-500 fill-blue-100 animate-pulse stroke-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Valuador de Precios y Apuntes por IA
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              ¿No estás seguro de cuánto pedir por tus apuntes de clase, un libro de texto usado o tu calculadora gráfica? 
              Nuestra de inteligencia artificial analiza las características del artículo, infiere el código de curso asociado, 
              pronostica la demanda para el semestre y redacta una descripción optimizada para vender tu producto en tiempo récord.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Input Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 p-6 shadow-ambient h-fit">
          <h3 className="font-sans font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Detalles de tu Artículo
          </h3>

          <form onSubmit={handleEvaluate} className="space-y-4" id="ai-evaluator-form">
                <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Título del artículo o tema
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. James Stewart Cálculo Trascendentes 7ma o Apuntes de Anatomía Médica"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white transition-all"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white transition-all"
              >
                {Object.values(Category).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Estado Físico / Desgaste
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Condition)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white transition-all"
              >
                {Object.values(Condition).map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            {/* User details / Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Detalles Adicionales (Opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Menciona si tiene rayones, páginas resaltadas, si incluye accesorios, o detalles particulares de tus apuntes de clase..."
                rows={4}
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none transition-all bg-white"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-secondary hover:bg-secondary-light text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              id="ai-evaluate-btn"
            >
              <Sparkles className="w-5 h-5 text-blue-400 fill-secondary" />
              Tasar con Inteligencia Artificial
            </button>
          </form>
        </div>

        {/* Right Side: AI Assessment Results */}
        <div className="lg:col-span-7">
          
          {/* Default state */}
          {!isLoading && !evaluationResult && !error && (
            <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-250 p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
              <Sparkles className="w-12 h-12 text-blue-500 mb-3 animate-pulse" />
              <h4 className="font-sans font-bold text-slate-650 text-sm">Esperando Datos...</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                Completa los detalles de tu artículo a la izquierda y presiona el botón para generar el reporte de tasación con Inteligencia Artificial.
              </p>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 shadow-ambient text-center h-full flex flex-col items-center justify-center min-h-[400px]">
              <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <h4 className="font-sans font-bold text-slate-700 text-base">Tasación en Progreso...</h4>
              
              {/* Stepper text */}
              <p className="text-sm text-secondary font-medium mt-2 max-w-md animate-pulse">
                {loadingMessages[loadingStep]}
              </p>
              
              <div className="w-64 bg-slate-100 h-2 rounded-full overflow-hidden mt-6">
                <div 
                  className="bg-blue-500 h-full transition-all duration-1000"
                  style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center h-full flex flex-col items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
              <h4 className="font-sans font-bold text-red-800 text-base">Error de Conexión</h4>
              <p className="text-sm text-red-600 mt-1 max-w-md leading-relaxed">{error}</p>
              <button 
                onClick={handleEvaluate} 
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Successful assessment result */}
          {evaluationResult && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-ambient overflow-hidden flex flex-col h-full animate-fadeIn" id="ai-evaluation-result">
              {/* Result Header */}
              <div className="bg-secondary text-white p-5 flex items-center justify-between border-b border-secondary-light">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400 fill-secondary" />
                  <span className="font-mono text-xs font-bold tracking-wider uppercase text-slate-300">Tasación Completada</span>
                </div>
                {evaluationResult.isSimulated && (
                  <span className="bg-white/10 text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg border border-white/20">
                    MODO DEMO
                  </span>
                )}
              </div>

              {/* Result Body content */}
              <div className="p-6 space-y-6 flex-grow">
                
                {/* Large Recommended Price Widget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recommended price */}
                  <div className="bg-blue-50/20 border border-blue-100 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">PRECIO RECOMENDADO</span>
                      <span className="font-sans font-black text-secondary text-3xl flex items-center gap-0.5 mt-0.5">
                        <DollarSign className="w-7 h-7 text-blue-500 stroke-[2.5]" />
                        {evaluationResult.recommendedPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-2.5 bg-blue-100 text-blue-600 rounded-full shadow-sm">
                      <DollarSign className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  </div>

                  {/* Demand predictor */}
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">PREDICCIÓN DE DEMANDA</span>
                      <span className={`font-sans font-bold text-base flex items-center gap-1.5 mt-1.5 ${
                        evaluationResult.demandLevel === "Alta" ? "text-green-600" : evaluationResult.demandLevel === "Media" ? "text-amber-600" : "text-slate-600"
                      }`}>
                        <TrendingUp className="w-5 h-5" />
                        Demanda {evaluationResult.demandLevel}
                      </span>
                    </div>
                    <div className="text-right text-xs text-slate-400 max-w-[150px] leading-tight font-medium font-sans">
                      {evaluationResult.demandReason}
                    </div>
                  </div>
                </div>

                {/* Suggested course codes & tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Course Codes */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      Cursos Estudiantiles Relacionados
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {evaluationResult.courseCodes?.map((code) => (
                        <span key={code} className="bg-secondary text-white text-xs font-mono font-bold px-2 py-0.5 rounded-lg shadow-xs">
                          {code}
                        </span>
                      )) || <span className="text-xs text-slate-400">Ninguno sugerido</span>}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      Etiquetas / Keywords Sugeridas
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {evaluationResult.tagSuggestions?.map((tag) => (
                        <span key={tag} className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          {tag}
                        </span>
                      )) || <span className="text-xs text-slate-400">Ninguna sugerida</span>}
                    </div>
                  </div>
                </div>

                {/* AI Optimized Copy / Description */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    Descripción Optimizada para Estudiantes (Copiable)
                  </span>
                  <div className="p-4 bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 text-xs leading-relaxed max-h-48 overflow-y-auto italic">
                    {evaluationResult.optimizedDescription}
                  </div>
                </div>
              </div>

              {/* Direct Listing trigger button */}
              <div className="bg-slate-50 p-4 border-t border-slate-150 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  ¿Te gustan estos datos sugeridos por la IA?
                </span>
                
                {published ? (
                  <button
                    disabled
                    className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-xs flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    ¡Artículo Publicado!
                  </button>
                ) : (
                  <button
                    onClick={handlePublish}
                    className="px-5 py-2.5 bg-secondary hover:bg-secondary-light text-primary-container font-black rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                    id="publish-from-ai-btn"
                  >
                    Publicar Artículo Directamente
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
