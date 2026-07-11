/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Star, MessageSquare, ShoppingCart, Tag, BookOpen } from "lucide-react";
import { Product, Condition } from "../types";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onSelect: (product: Product) => void;
  onNegotiate: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWatchlist: (product: Product) => void;
  isWatchlisted: boolean;
}

export default function ProductCard({
  product,
  onSelect,
  onNegotiate,
  onAddToCart,
  onToggleWatchlist,
  isWatchlisted,
}: ProductCardProps) {
  
  // Custom styling based on product condition
  const getConditionStyles = (cond: Condition) => {
    switch (cond) {
      case Condition.NEW:
        return "bg-green-100 text-green-800 border-green-200";
      case Condition.LIKE_NEW:
        return "bg-sky-100 text-sky-800 border-sky-200";
      case Condition.GOOD:
        return "bg-amber-100 text-amber-800 border-amber-200";
      case Condition.USED:
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div 
      className="bg-white rounded-3xl border border-slate-100 shadow-ambient hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group overflow-hidden"
      id={`product-card-${product.id}`}
    >
      {/* Card Image Area with Overlay Actions */}
      <div className="relative h-48 bg-slate-50 border-b border-slate-100 flex items-center justify-center overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Course code & Condition badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${getConditionStyles(product.condition)}`}>
            {product.condition}
          </span>
          {product.courseCode && (
            <span className="bg-secondary text-white text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {product.courseCode}
            </span>
          )}
        </div>

        {/* Floating Heart / Watchlist button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(product);
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full shadow-md transition-colors z-10 ${
            isWatchlisted 
              ? "bg-red-500 text-white hover:bg-red-600" 
              : "bg-white/90 text-slate-500 hover:text-red-500 hover:bg-white"
          }`}
          title={isWatchlisted ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <svg
            className="w-4.5 h-4.5 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* Category Pill on Image corner */}
        <div className="absolute bottom-2 left-2 bg-slate-900/70 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 z-10">
          <Tag className="w-2.5 h-2.5 text-blue-400" />
          {product.category}
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <h3 
          onClick={() => onSelect(product)}
          className="font-sans font-bold text-slate-800 text-sm hover:text-primary cursor-pointer leading-tight line-clamp-2 min-h-[40px] mb-2"
        >
          {product.title}
        </h3>

        {/* Seller Info line */}
        <div className="flex items-center justify-between mb-3 text-xs border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <img
              src={product.seller.avatar}
              alt={product.seller.name}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-full object-cover border border-slate-200"
            />
            <span className="text-slate-500 font-semibold max-w-[80px] truncate" title={product.seller.name}>
              {product.seller.name}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-700 font-mono font-semibold bg-slate-50 px-1.5 py-0.5 rounded">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{product.seller.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Price and Add action */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">PRECIO DE LISTA</span>
            <span className="font-sans font-black text-secondary text-lg" id={`price-display-${product.id}`}>
              S/. {product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="p-2 bg-slate-50 text-secondary hover:bg-secondary hover:text-white rounded-xl transition-colors border border-slate-100 cursor-pointer"
            title="Añadir al Carrito"
            id={`add-to-cart-btn-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action Button: "Regatear / Chatear" */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelect(product)}
            className="py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-150 transition-all text-center cursor-pointer"
          >
            Ver Detalles
          </button>
          
          <button
            onClick={() => onNegotiate(product)}
            className="py-2 bg-primary-container text-slate-900 hover:bg-blue-600/15 hover:text-primary hover:border-primary/20 border border-transparent text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
            id={`negotiate-btn-${product.id}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Regatear
          </button>
        </div>
      </div>
    </div>
  );
}
