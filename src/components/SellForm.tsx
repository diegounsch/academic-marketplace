/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { PlusCircle, Image, BookOpen, Tag, CheckCircle2, AlertCircle } from "lucide-react";
import { Category, Condition } from "../types";

interface SellFormProps {
  onPublish: (product: {
    title: string;
    category: Category;
    condition: Condition;
    price: number;
    description: string;
    courseCode: string;
    image: string;
  }) => void;
  setActiveTab: (tab: string) => void;
  isDniVerified: boolean;
}

const IMAGE_PRESETS = [
  {
    name: "Libro de Cálculo",
    url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80",
  },
  {
    name: "Apuntes y Resúmenes",
    url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&auto=format&fit=crop&q=80",
  },
  {
    name: "Dispositivo Tecnológico",
    url: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=500&auto=format&fit=crop&q=80",
  },
  {
    name: "Material de Laboratorio",
    url: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=500&auto=format&fit=crop&q=80",
  },
  {
    name: "Asesoría o Tutoría",
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80",
  },
  {
    name: "Peluche de Stitch Colección",
    url: "/src/assets/images/stitch_plush_1783649171605.jpg",
  },
  {
    name: "Mochila Universitaria de Stitch",
    url: "/src/assets/images/stitch_backpack_1783649183900.jpg",
  },
  {
    name: "Taza 3D de Stitch para Café",
    url: "/src/assets/images/stitch_mug_1783649200664.jpg",
  }
];

export default function SellForm({ onPublish, setActiveTab, isDniVerified }: SellFormProps) {
  if (!isDniVerified) {
    return (
      <div className="max-w-4xl mx-auto py-4">
        <div className="bg-white rounded-3xl border border-slate-150 p-10 text-center shadow-ambient flex flex-col items-center justify-center min-h-[400px] animate-fadeIn space-y-6">
          <div className="p-4 bg-red-50 rounded-full text-red-500 border border-red-100 shadow-sm animate-bounce">
            <AlertCircle className="w-12 h-12 stroke-[2.5]" />
          </div>
          <div className="space-y-2">
            <h3 className="font-sans font-black text-slate-800 text-xl tracking-tight">🔒 Publicación Bloqueada</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              De acuerdo con las normativas de la UNSCH, <span className="font-bold text-red-600">debes verificar tu identidad con DNI</span> para evitar cuentas duplicadas antes de poder publicar cualquier artículo en el mercado.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md text-xs text-slate-550 text-left space-y-1.5 font-mono">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">REQUERIMIENTOS:</span>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Número de DNI válido (8 dígitos)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500 font-bold">➜</span>
              <span>Foto nítida de la parte frontal del DNI</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500 font-bold">➜</span>
              <span>Foto nítida de la parte trasera del DNI</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className="px-6 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
            id="go-to-profile-verify-btn"
          >
            <span>Verificar Mi DNI en Perfil</span>
            <span>➜</span>
          </button>
        </div>
      </div>
    );
  }

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(Category.TEXTBOOKS);
  const [condition, setCondition] = useState<Condition>(Condition.GOOD);
  const [price, setPrice] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");
  
  // Image handling
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [useCustomImage, setUseCustomImage] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!title.trim()) {
      setValidationError("El título del artículo es requerido.");
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setValidationError("Por favor ingresa un precio válido mayor a cero.");
      return;
    }
    if (!description.trim()) {
      setValidationError("Por favor proporciona una descripción de tu artículo.");
      return;
    }

    const finalImage = useCustomImage && customImageUrl.trim() 
      ? customImageUrl.trim() 
      : IMAGE_PRESETS[selectedPreset].url;

    onPublish({
      title: title.trim(),
      category,
      condition,
      price: numPrice,
      description: description.trim(),
      courseCode: courseCode.trim().toUpperCase(),
      image: finalImage,
    });

    setIsSuccess(true);
    
    // Clear form
    setTitle("");
    setPrice("");
    setCourseCode("");
    setDescription("");
    setCustomImageUrl("");
    setUseCustomImage(false);

    // Auto redirect
    setTimeout(() => {
      setIsSuccess(false);
      setActiveTab("marketplace");
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      {isSuccess ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-ambient flex flex-col items-center justify-center min-h-[400px] animate-fadeIn">
          <div className="p-4 bg-green-50 rounded-full text-green-500 mb-4 shadow-sm border border-green-100">
            <CheckCircle2 className="w-12 h-12 stroke-[2]" />
          </div>
          <h3 className="font-sans font-black text-slate-800 text-xl tracking-tight">¡Artículo Publicado Exitosamente!</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            Tu artículo ha sido catalogado y ya está disponible para el resto de la comunidad estudiantil. Redireccionando al mercado...
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-ambient overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-secondary text-white p-5 flex items-center gap-2.5 border-b border-secondary-light">
            <PlusCircle className="w-5 h-5 text-blue-400 fill-secondary" />
            <span className="font-sans font-bold text-sm tracking-wide">Publicar Nuevo Artículo Académico</span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6" id="sell-form">
            
            {/* Error alerts */}
            {validationError && (
              <div className="bg-red-50 border border-red-200 rounded p-4 flex items-center gap-2.5 text-sm text-red-700">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Form: Fields */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Título de la Publicación
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Guía Resuelta de Física II o Bata de Laboratorio Algodón"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white transition-all"
                    required
                  />
                </div>

                {/* Grid categories / prices */}
                <div className="grid grid-cols-2 gap-4">
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
                      Estado Físico
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
                </div>

                {/* Price and Course Code */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Precio de Venta (Soles / PEN)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500 font-bold text-xs">
                        S/.
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full h-11 pl-9 pr-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono transition-all bg-white"
                        required
                        min="0.1"
                      />
                    </div>
                  </div>

                  {/* Course Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Código de Curso (Opcional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        placeholder="Ej. MAT-101"
                        className="w-full h-11 pl-9 pr-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono transition-all bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Descripción del artículo
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Menciona detalles como: edición del libro, estado de las hojas, si incluyes materiales extra o el horario de entrega en el campus universitario..."
                    rows={5}
                    className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none transition-all bg-white"
                    required
                  />
                </div>
              </div>

              {/* Right Form: Image Preset Picker */}
              <div className="space-y-4">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Image className="w-4 h-4 text-slate-400" />
                  Imagen de la publicación
                </span>

                {/* Image Mode Switcher */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setUseCustomImage(false)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-center transition-all cursor-pointer ${
                      !useCustomImage ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Plantillas de Imagen
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCustomImage(true)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg text-center transition-all cursor-pointer ${
                      useCustomImage ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Enlace de Imagen URL
                  </button>
                </div>

                {/* Layout depending on Custom vs Preset */}
                {!useCustomImage ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 font-medium">
                      Elige una de nuestras imágenes universitarias de alta calidad según el tipo de producto:
                    </p>
                    
                    <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {IMAGE_PRESETS.map((preset, idx) => (
                        <div
                          key={preset.name}
                          onClick={() => setSelectedPreset(idx)}
                          className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all ${
                            selectedPreset === idx 
                              ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20 shadow-xs" 
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                          />
                          <span className="text-xs font-bold text-slate-700">{preset.name}</span>
                        </div>
                      ))}
                    </div>

                    {/* Preset preview */}
                    <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50 p-2 text-center">
                      <img
                        src={IMAGE_PRESETS[selectedPreset].url}
                        alt="Vista Previa"
                        referrerPolicy="no-referrer"
                        className="w-full h-24 object-cover rounded-xl"
                      />
                      <span className="text-[10px] font-mono text-slate-450 mt-1 block uppercase font-bold">Vista previa de la plantilla</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      Enlace directo de imagen (HTTPS)
                    </label>
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-mono transition-all bg-white"
                    />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Copia y pega la URL de cualquier imagen web. Recomendamos usar enlaces directos de Unsplash o Picsum.
                    </p>

                    {customImageUrl.trim() && (
                      <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50 p-2 text-center">
                        <img
                          src={customImageUrl.trim()}
                          alt="Vista Previa Personalizada"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80";
                          }}
                          className="w-full h-28 object-cover rounded-xl"
                        />
                        <span className="text-[10px] font-mono text-slate-450 mt-1 block uppercase font-bold">Vista previa de tu URL</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-150 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("marketplace")}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                className="px-6 py-2.5 bg-secondary hover:bg-secondary-light text-white font-extrabold rounded-xl shadow-md text-xs cursor-pointer transition-all"
                id="submit-sell-btn"
              >
                Publicar Artículo en el Mercado
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
