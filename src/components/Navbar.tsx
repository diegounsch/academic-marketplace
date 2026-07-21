/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  MessageSquare, 
  PlusCircle, 
  Heart, 
  ShoppingCart, 
  Wallet, 
  Award, 
  LogIn, 
  User, 
  ShieldCheck 
} from "lucide-react";
import { UserProfile } from "../types";

interface NavbarProps {
  user: UserProfile;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount: number;
  watchlistCount: number;
  activeChatsCount: number;
  onOpenCart: () => void;
  onOpenWatchlist: () => void;
  onLogout?: () => void;
}

export default function Navbar({
  user,
  isLoggedIn,
  onLoginClick,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  cartCount,
  watchlistCount,
  activeChatsCount,
  onOpenCart,
  onOpenWatchlist,
  onLogout,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-secondary text-white shadow-md border-b border-secondary-light/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Bar: Brand, Search & User Info */}
        <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4 border-b border-white/10">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none" 
            onClick={() => setActiveTab("marketplace")}
            id="nav-logo"
          >
            <div className="p-2 bg-primary-container text-secondary rounded-xl font-bold shadow-sm">
              <BookOpen className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight font-sans text-white flex items-center gap-1.5">
                ACADEMIC <span className="text-blue-400">MARKETPLACE</span>
              </h1>
              <p className="text-xs text-slate-400 font-mono tracking-wider font-semibold">UNSCH • PORTAL ESTUDIANTIL</p>
            </div>
          </div>

          {/* Central Search Bar */}
          <div className="w-full md:max-w-md relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Buscar libros, apuntes, tecnología..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== "marketplace") {
                  setActiveTab("marketplace");
                }
              }}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm shadow-inner transition-all border border-slate-700"
              id="search-input"
            />
          </div>

          {/* User Widget or Login Button */}
          {isLoggedIn ? (
            <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-start">
              
              {/* Wallet Balance */}
              <div 
                onClick={() => setActiveTab("profile")}
                className="flex items-center gap-2 bg-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-mono border border-slate-700 shadow-sm cursor-pointer hover:bg-slate-700 hover:border-slate-600 transition-all active:scale-95" 
                title="Ver Monedero UNSCH Pay"
              >
                <Wallet className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-[9px] font-bold block text-slate-400 leading-none">MI SALDO</span>
                  <span className="font-extrabold text-white text-xs mt-0.5 block">
                    S/. {(user?.balance ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Profile Avatar & Info */}
              <div className="flex items-center gap-2.5">
                <div 
                  onClick={() => setActiveTab("profile")}
                  className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-all active:scale-98 animate-fadeIn"
                  title="Configuración de Perfil"
                >
                  <img
                    src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                    alt={user?.name || "Usuario"}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover"
                  />
                  <div className="hidden lg:block">
                    <div className="font-bold text-sm flex items-center gap-1 leading-tight text-white">
                      {user?.name || "Estudiante"}
                      <Award className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 block max-w-[150px] truncate mt-0.5">
                      {user?.university || "UNSCH"}
                    </span>
                  </div>
                </div>
                
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="ml-1 text-[10px] bg-red-600/80 hover:bg-red-500 hover:text-white text-red-100 border border-red-700 font-extrabold px-2.5 py-1.5 rounded-lg transition-all font-mono cursor-pointer shadow-sm hover:shadow"
                    title="Cerrar Sesión de Estudiante"
                    id="nav-logout-btn"
                  >
                    SALIR
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">Accede a tu cuenta:</span>
              <button
                onClick={onLoginClick}
                className="h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                id="nav-login-btn"
              >
                <LogIn className="w-4 h-4 text-slate-100" />
                <span>Iniciar Sesión / Registro</span>
              </button>
            </div>
          )}
        </div>

        {/* Lower Bar: Navigation Tabs & Cart/Watchlist buttons */}
        <div className="flex items-center justify-between py-2 overflow-x-auto scrollbar-none">
          <nav className="flex gap-1.5">
            <button
              onClick={() => setActiveTab("marketplace")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                activeTab === "marketplace"
                  ? "bg-primary-container text-secondary font-extrabold shadow-sm scale-102"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
              id="tab-marketplace"
            >
              <BookOpen className="w-4 h-4" />
              Mercado Académico
            </button>

            <button
              onClick={() => setActiveTab("evaluator")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                activeTab === "evaluator"
                  ? "bg-primary-container text-secondary font-extrabold shadow-sm scale-102"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
              id="tab-evaluator"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Valuador IA
            </button>

            <button
              onClick={() => setActiveTab("negotiations")}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                activeTab === "negotiations" || activeTab === "chat"
                  ? "bg-primary-container text-secondary font-extrabold shadow-sm scale-102"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
              id="tab-negotiations"
            >
              <MessageSquare className="w-4 h-4" />
              Mis Regateos
              {activeChatsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse border border-white">
                  {activeChatsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("sell")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                activeTab === "sell"
                  ? "bg-primary-container text-secondary font-extrabold shadow-sm scale-102"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
              id="tab-sell"
            >
              <PlusCircle className="w-4 h-4" />
              Vender Artículo
            </button>

            {isLoggedIn && (
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-primary-container text-secondary font-extrabold shadow-sm scale-102"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
                id="tab-profile"
              >
                <User className="w-4 h-4 text-blue-400" />
                Mi Perfil / Monedero
              </button>
            )}

            {isLoggedIn && user?.isAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition-all border border-red-500/30 cursor-pointer ${
                  activeTab === "admin"
                    ? "bg-red-600 text-white shadow-sm scale-102"
                    : "bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:text-red-300"
                }`}
                id="tab-admin"
              >
                <ShieldCheck className="w-4 h-4" />
                Panel de Admin
              </button>
            )}
          </nav>

          {/* Watchlist & Cart Actions */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            {/* Watchlist */}
            <button
              onClick={onOpenWatchlist}
              className="relative p-2 rounded-full hover:bg-white/10 text-slate-100 transition-colors cursor-pointer"
              title="Mi Lista de Deseos"
              id="watchlist-btn"
            >
              <Heart className="w-5 h-5" />
              {watchlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {watchlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full hover:bg-white/10 text-slate-100 transition-colors bg-secondary-light/30 border border-white/10 cursor-pointer"
              title="Mi Carrito de Compras"
              id="cart-btn"
            >
              <ShoppingCart className="w-5 h-5 text-primary-container" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-secondary">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
