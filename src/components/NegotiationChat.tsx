/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, DollarSign, CheckCircle2, ChevronLeft, Info, HelpCircle, Star, Sparkles, Loader } from "lucide-react";
import { Product, Message, ChatSession, Seller } from "../types";

interface NegotiationChatProps {
  session: ChatSession;
  product: Product;
  onSendMessage: (text: string, isOffer?: boolean, offerAmount?: number) => void;
  onAcceptFinalDeal: (finalPrice: number) => void;
  onBack: () => void;
  isSending: boolean;
}

export default function NegotiationChat({
  session,
  product,
  onSendMessage,
  onAcceptFinalDeal,
  onBack,
  isSending,
}: NegotiationChatProps) {
  const [inputText, setInputText] = useState("");
  const [offerPrice, setOfferPrice] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const seller = product.seller;

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages, isSending]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleSendOffer = () => {
    const amount = parseFloat(offerPrice);
    if (isNaN(amount) || amount <= 0) return;
    
    // Send message detailing the offer
    onSendMessage(`Te ofrezco formalmente $${amount.toFixed(2)} por el artículo. ¿Aceptas?`, true, amount);
    setOfferPrice("");
  };

  const handleQuickOffer = (percent: number) => {
    const discountedPrice = Math.round(product.price * (1 - percent / 100));
    onSendMessage(`¿Qué te parece si cerramos el trato en $${discountedPrice}?`, true, discountedPrice);
  };

  return (
    <div className="max-w-4xl mx-auto py-2 h-[calc(100vh-140px)] flex flex-col" id={`chat-session-${product.id}`}>
      
      {/* Upper Navigation / Seller Profile Card */}
      <div className="bg-white border border-slate-100 rounded-t-3xl p-4 shadow-ambient flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Back and Seller Header */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-bold text-sm border border-transparent hover:border-slate-100"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver</span>
          </button>

          <div className="flex items-center gap-3">
            <img
              src={seller.avatar}
              alt={seller.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full border-2 border-primary-container object-cover shadow-sm"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-sans font-bold text-slate-800 text-sm leading-tight">{seller.name}</h3>
                <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Vendedor
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-tight mt-0.5">{seller.role}</p>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-600">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="font-bold">{seller.rating.toFixed(1)}</span>
                <span className="text-slate-300">•</span>
                <span>{seller.salesCount} ventas exitosas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product details summary */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 w-full md:w-auto md:max-w-xs self-stretch md:self-auto">
          <img
            src={product.image}
            alt={product.title}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
          />
          <div className="flex-grow min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate leading-tight">{product.title}</h4>
            <div className="flex items-center justify-between mt-1 text-xs font-mono">
              <span className="text-slate-400">P. Original:</span>
              <span className="font-bold text-slate-600">${product.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat messages content container */}
      <div className="flex-grow bg-slate-50 border-x border-slate-100 p-4 overflow-y-auto space-y-4 flex flex-col">
        
        {/* Welcome and Persona Info banner */}
        <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-2xl text-xs text-slate-700 flex items-start gap-2.5 max-w-2xl mx-auto shadow-xs">
          <Info className="w-4.5 h-4.5 text-blue-600 stroke-[2.5] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 block">Información de Negociación por IA</span>
            Estás negociando con <span className="font-semibold">{seller.name}</span>. Su inteligencia artificial está programada para responder de acuerdo con su personalidad, situación y rol universitario. ¡Conversa con naturalidad, ofrece ofertas educadas y trata de cerrar un trato!
          </div>
        </div>

        {/* Messages timeline */}
        {session.messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[80%] ${isUser ? "self-end items-end" : "self-start items-start"}`}
            >
              {/* Message bubble */}
              <div
                className={`p-3 rounded-lg text-sm shadow-xs ${
                  isUser
                    ? "bg-secondary text-white rounded-br-none"
                    : "bg-white text-slate-800 rounded-bl-none border border-slate-200"
                }`}
              >
                {/* Text */}
                <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                
                {/* Offer amount highlight if present */}
                {msg.isOffer && msg.offerAmount && (
                  <div className={`mt-2 p-1.5 rounded flex items-center justify-between text-xs font-mono border ${
                    isUser 
                      ? "bg-white/10 border-white/20 text-primary-container font-semibold" 
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}>
                    <span>OFERTA ENVIADA:</span>
                    <span className="font-bold">${msg.offerAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-slate-400 font-mono mt-1 px-1">{msg.timestamp}</span>
            </div>
          );
        })}

        {/* Typing spinner for seller latency simulation */}
        {isSending && (
          <div className="flex items-center gap-2 text-slate-500 self-start bg-white border border-slate-100 px-3 py-2 rounded-xl text-xs font-semibold shadow-xs">
            <Loader className="w-3.5 h-3.5 animate-spin text-blue-500" />
            <span>{seller.name} está redactando respuesta...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Agreed price deal block */}
      {session.status === "accepted" && (
        <div className="bg-green-50/55 border-x border-slate-100 p-4 border-y border-green-200/50 flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3 text-green-850">
            <CheckCircle2 className="w-8 h-8 text-green-500 fill-green-100 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">¡Trato Cerrado con Éxito!</h4>
              <p className="text-xs text-green-700">
                {seller.name} aceptó el precio final de <span className="font-mono font-bold text-green-900">${session.currentPrice.toFixed(2)}</span>. Puedes efectuar el pago para retirar tu producto.
              </p>
            </div>
          </div>
          <button
            onClick={() => onAcceptFinalDeal(session.currentPrice)}
            className="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md text-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
            id="buy-deal-btn"
          >
            <DollarSign className="w-4 h-4 stroke-[2.5]" />
            Comprar ahora por ${session.currentPrice.toFixed(2)}
          </button>
        </div>
      )}

      {/* Input controls panel (Only active when status is negotiating) */}
      {session.status === "active" && (
        <div className="bg-white border border-slate-100 rounded-b-3xl p-4 shadow-ambient space-y-3">
          
          {/* Quick Offers Helpers */}
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Propuestas rápidas de descuento:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleQuickOffer(10)}
                className="px-2.5 py-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-lg cursor-pointer transition-colors"
                title="Ofrecer un 10% menos del precio original"
              >
                -10% (${Math.round(product.price * 0.9)})
              </button>
              <button
                onClick={() => handleQuickOffer(20)}
                className="px-2.5 py-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-lg cursor-pointer transition-colors"
                title="Ofrecer un 20% menos del precio original"
              >
                -20% (${Math.round(product.price * 0.8)})
              </button>
              <button
                onClick={() => handleQuickOffer(30)}
                className="px-2.5 py-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-lg cursor-pointer transition-colors"
                title="Ofrecer un 30% menos del precio original"
              >
                -30% (${Math.round(product.price * 0.7)})
              </button>
            </div>
          </div>

          {/* Offer Input and Chat Send */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Offer Input */}
            <div className="md:col-span-4 flex items-center gap-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <DollarSign className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="Ofrecer nuevo precio..."
                className="w-full h-10 pl-8 pr-16 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                min="1"
                id="offer-price-input"
              />
              <button
                onClick={handleSendOffer}
                disabled={!offerPrice || isSending}
                className="absolute right-1.5 inset-y-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-extrabold rounded-lg cursor-pointer disabled:opacity-50"
              >
                Ofertar
              </button>
            </div>

            {/* Standard Text Chat send */}
            <form onSubmit={handleSendText} className="md:col-span-8 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Chatea con ${seller.name}...`}
                className="flex-grow h-10 px-3.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                disabled={isSending}
                id="chat-message-input"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="h-10 w-12 bg-secondary hover:bg-secondary-light text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
                id="chat-send-btn"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
