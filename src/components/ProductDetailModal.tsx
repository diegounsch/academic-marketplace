/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, ShoppingCart, Heart, MessageSquare, Star, BookOpen, Tag, Calendar, ShieldCheck, AlertTriangle } from "lucide-react";
import { Product, Condition } from "../types";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onNegotiate: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWatchlist: (product: Product) => void;
  isWatchlisted: boolean;
  onReportProduct?: (productId: string, reason: string) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onNegotiate,
  onAddToCart,
  onToggleWatchlist,
  isWatchlisted,
  onReportProduct,
}: ProductDetailModalProps) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  
  const getConditionBadgeClass = (cond: Condition) => {
    switch (cond) {
      case Condition.NEW: return "bg-green-100 text-green-800 border-green-200";
      case Condition.LIKE_NEW: return "bg-sky-100 text-sky-800 border-sky-200";
      case Condition.GOOD: return "bg-amber-100 text-amber-800 border-amber-200";
      case Condition.USED: return "bg-slate-100 text-slate-800 border-slate-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) return;
    if (onReportProduct) {
      onReportProduct(product.id, reportReason);
    }
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportForm(false);
      setReportSubmitted(false);
      setReportReason("");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl border border-slate-100 shadow-hover overflow-hidden flex flex-col md:flex-row h-auto max-h-[90vh] md:max-h-none md:h-fit">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors z-20 cursor-pointer"
          title="Cerrar detalles"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Product Image Display */}
        <div className="w-full md:w-1/2 bg-slate-50 relative flex items-center justify-center min-h-[300px] max-h-[350px] md:max-h-none md:h-[500px]">
          <img
            src={product.image}
            alt={product.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${getConditionBadgeClass(product.condition)}`}>
              Estado: {product.condition}
            </span>
            {product.courseCode && (
              <span className="bg-secondary text-white text-xs font-mono font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {product.courseCode}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto h-[450px] md:h-[500px]">
          {/* Category */}
          <div className="flex items-center gap-1 text-slate-400 font-mono text-[10px] font-bold tracking-wider uppercase mb-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>{product.category}</span>
          </div>

          {/* Title */}
          <h2 className="font-sans font-extrabold text-slate-800 text-xl md:text-2xl tracking-tight leading-tight mb-3">
            {product.title}
          </h2>

          {/* Price Tag */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">PRECIO ACTUAL DE VENTA</span>
              <span className="font-sans font-black text-secondary text-2xl" id="modal-price-display">
                S/. {product.price.toFixed(2)}
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onToggleWatchlist(product)}
                className={`p-2.5 rounded-xl border shadow-xs transition-colors cursor-pointer ${
                  isWatchlisted 
                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
                    : "bg-white text-slate-500 border-slate-200 hover:text-red-500"
                }`}
                title={isWatchlisted ? "Quitar de favoritos" : "Guardar en favoritos"}
              >
                <Heart className={`w-5 h-5 ${isWatchlisted ? "fill-current text-red-500" : ""}`} />
              </button>
              
              <button
                onClick={() => onAddToCart(product)}
                className="px-4 py-2.5 bg-secondary hover:bg-secondary-light text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                id="modal-add-to-cart"
              >
                <ShoppingCart className="w-4 h-4" />
                Añadir al Carrito
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">Descripción de Artículo</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-sans whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          {/* Seller Information */}
          <div className="border-t border-slate-150 pt-5 mt-auto">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-3">Información del Vendedor</h4>
            
            <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={product.seller.avatar}
                  alt={product.seller.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h5 className="font-bold text-slate-800 text-sm leading-tight">{product.seller.name}</h5>
                  <p className="text-xs text-slate-500 leading-tight mt-0.5">{product.seller.role}</p>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-slate-600">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{product.seller.rating.toFixed(1)}</span>
                    <span className="text-slate-300">•</span>
                    <span>{product.seller.salesCount} ventas</span>
                  </div>
                </div>
              </div>

              {/* Chat action */}
              <button
                onClick={() => {
                  onNegotiate(product);
                  onClose();
                }}
                className="px-4 py-2.5 bg-primary-container text-secondary hover:bg-primary-container/90 text-xs font-extrabold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1 cursor-pointer"
                id="modal-start-negotiation"
              >
                <MessageSquare className="w-4 h-4" />
                Regatear
              </button>
            </div>
          </div>

          {/* Trust assurances footer */}
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[9px] uppercase font-mono tracking-wider font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              <span>Transacción Segura UNSCH</span>
            </div>
            {!showReportForm && (
              <button
                type="button"
                onClick={() => setShowReportForm(true)}
                className="text-red-500 hover:text-red-700 font-bold text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
                id="report-listing-btn"
              >
                <AlertTriangle className="w-3 h-3 text-red-500" />
                Reportar publicación
              </button>
            )}
          </div>

          {/* Interactive Report Form */}
          {showReportForm && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 animate-fadeIn">
              {reportSubmitted ? (
                <div className="text-center py-2 text-xs font-bold text-red-700 flex flex-col items-center gap-1">
                  <span>🚨 ¡Reporte Registrado!</span>
                  <span className="font-normal text-[10px] text-red-500">Un administrador revisará esta publicación a la brevedad.</span>
                </div>
              ) : (
                <form onSubmit={handleSendReport} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-red-700 flex items-center gap-1 uppercase tracking-wider font-mono">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Reportar Artículo
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowReportForm(false)}
                      className="text-slate-450 hover:text-slate-600 text-xs font-bold font-mono"
                    >
                      [Cancelar]
                    </button>
                  </div>
                  
                  <div className="space-y-1.5">
                    {[
                      "Precio irreal o abusivo",
                      "No es un artículo académico",
                      "Contenido inapropiado / Spam",
                      "Sospecha de estafa o fraude",
                    ].map((reason, idx) => (
                      <label key={idx} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-800">
                        <input
                          type="radio"
                          name="report_reason"
                          value={reason}
                          required
                          checked={reportReason === reason}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="accent-red-600"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full h-8 bg-red-600 hover:bg-red-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Enviar Reporte a Moderación</span>
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
