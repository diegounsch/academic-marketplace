/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import CheckoutButton from './components/CheckoutButton';
import React, { useState, useEffect } from "react";
import { supabase } from './supabaseClient';
import { 
  INITIAL_PRODUCTS, 
  MOCK_USER 
} from "./data";
import { 
  Product, 
  Category, 
  Condition, 
  ChatSession, 
  Message, 
  UserProfile 
} from "./types";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import AIEvaluator from "./components/AIEvaluator";
import NegotiationChat from "./components/NegotiationChat";
import ProductDetailModal from "./components/ProductDetailModal";
import SellForm from "./components/SellForm";
import AuthScreen from "./components/AuthScreen";
import PaymentGateway from "./components/PaymentGateway";
import StudentProfile from "./components/StudentProfile";
import AdminDashboard from "./components/AdminDashboard";
import { 
  Filter, 
  AlertCircle, 
  Trash2, 
  ShoppingBag, 
  CheckCircle, 
  ChevronRight, 
  ArrowUpDown, 
  Heart, 
  Tag, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Receipt,
  MessageSquare,
  BookOpen
} from "lucide-react";

export default function App() {
  // --- Persistent States (synced with localStorage & Supabase) ---
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<UserProfile>(MOCK_USER);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("academic_is_logged_in") === "true";
  });
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [reports, setReports] = useState<{
    id: string;
    productId: string;
    productTitle: string;
    reason: string;
    reporterName: string;
    date: string;
  }[]>([]);

  // --- Payment Gateway states ---
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [checkoutAgreedPrice, setCheckoutAgreedPrice] = useState<number>(0);

  // --- UI Layout navigation states ---
  const [activeTab, setActiveTab] = useState<string>("marketplace");
  const handleTabChange = (tab: string) => {
    if (!isLoggedIn && (tab === "evaluator" || tab === "negotiations" || tab === "sell" || tab === "chat" || tab === "profile")) {
      setShowAuthModal(true);
      return;
    }
    setActiveTab(tab);
    setActiveChatSession(null);
  };
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // --- Interaction focus states ---
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // --- Slide modals states ---
  const [showCart, setShowCart] = useState<boolean>(false);
  const [showWatchlist, setShowWatchlist] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // --- Receipt screen on successful transaction ---
  const [transactionReceipt, setTransactionReceipt] = useState<{
    id: string;
    productTitle: string;
    price: number;
    sellerName: string;
    date: string;
    meetingLocation: string;
  } | null>(null);

  // --- Initial loading & Supabase Sync ---
  useEffect(() => {
    // 1. Sync products con Supabase
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, profiles(full_name, avatar_url)')
          .eq('status', 'available');

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedProducts: Product[] = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: Number(item.price),
            image: item.image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80',
            category: (item.category as Category) || Category.TEXTBOOKS,
            condition: (item.condition as Condition) || Condition.USED,
            courseCode: item.course_code || undefined,
            seller: {
              id: item.seller_id,
              name: item.profiles?.full_name || 'Estudiante UNSCH',
              avatar: item.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
              role: 'Vendedor',
              rating: 5.0,
              persona: 'Amigable'
            },
            createdAt: item.created_at,
            isCustom: true
          }));
          setProducts(formattedProducts);
        } else {
          setProducts(INITIAL_PRODUCTS);
        }
      } catch (err: any) {
        console.error("Error conectando productos con Supabase:", err.message);
        setProducts(INITIAL_PRODUCTS);
      }
    };

    fetchProducts();

    // 2. Sync user profile and wallet balance from Supabase
    const syncUserProfile = async () => {
      const savedUserStr = localStorage.getItem("academic_user");
      let baseUser = savedUserStr ? JSON.parse(savedUserStr) : MOCK_USER;

      if (isLoggedIn) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', baseUser.id || 'current_user')
            .maybeSingle();

          if (profile && !error) {
            const updatedUser: UserProfile = {
              ...baseUser,
              name: profile.full_name || baseUser.name,
              avatar: profile.avatar_url || baseUser.avatar,
              isDniVerified: profile.is_dni_verified ?? baseUser.isDniVerified,
              balance: profile.wallet_balance !== undefined && profile.wallet_balance !== null 
                ? Number(profile.wallet_balance) 
                : baseUser.balance
            };
            setUser(updatedUser);
            localStorage.setItem("academic_user", JSON.stringify(updatedUser));
            return;
          }
        } catch (err: any) {
          console.error("Error leyendo saldo real de Supabase:", err.message);
        }
      }

      setUser(baseUser);
    };

    syncUserProfile();

    // Sync watchlist
    const savedWatch = localStorage.getItem("academic_watchlist");
    if (savedWatch) setWatchlist(JSON.parse(savedWatch));

    // Sync cart
    const savedCart = localStorage.getItem("academic_cart");
    if (savedCart) setCart(JSON.parse(savedCart));

    // Sync chat sessions
    const savedChats = localStorage.getItem("academic_chats");
    if (savedChats) setChatSessions(JSON.parse(savedChats));

    // Sync reports
    const savedReports = localStorage.getItem("academic_reports");
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    } else {
      const seedReport = [
        {
          id: "rep_1",
          productId: "p1",
          productTitle: "Cálculo: Trascendentes Tempranas (James Stewart)",
          reason: "Precio irreal o abusivo",
          reporterName: "Camila Torres",
          date: "09/07/2026"
        }
      ];
      setReports(seedReport);
      localStorage.setItem("academic_reports", JSON.stringify(seedReport));
    }
  }, [isLoggedIn]);

  // Helpers to update persistent storage
  const saveProducts = (updated: Product[]) => {
    setProducts(updated);
    localStorage.setItem("academic_products", JSON.stringify(updated));
  };

  const saveUser = (updated: UserProfile) => {
    setUser(updated);
    localStorage.setItem("academic_user", JSON.stringify(updated));
  };

  const saveWatchlist = (updated: string[]) => {
    setWatchlist(updated);
    localStorage.setItem("academic_watchlist", JSON.stringify(updated));
  };

  const saveCart = (updated: string[]) => {
    setCart(updated);
    localStorage.setItem("academic_cart", JSON.stringify(updated));
  };

  const saveChatSessions = (updated: ChatSession[]) => {
    setChatSessions(updated);
    localStorage.setItem("academic_chats", JSON.stringify(updated));
  };

  // --- Admin Panel operations ---
  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    saveProducts(updated);
  };

  const handleDismissReport = (reportId: string) => {
    const updated = reports.filter((r) => r.id !== reportId);
    setReports(updated);
    localStorage.setItem("academic_reports", JSON.stringify(updated));
  };

  const handleBlockProduct = (productId: string) => {
    const updatedProducts = products.filter((p) => p.id !== productId);
    saveProducts(updatedProducts);

    saveCart(cart.filter((id) => id !== productId));
    saveWatchlist(watchlist.filter((id) => id !== productId));

    const updatedReports = reports.filter((r) => r.productId !== productId);
    setReports(updatedReports);
    localStorage.setItem("academic_reports", JSON.stringify(updatedReports));
  };

  const handleReportProduct = (productId: string, reason: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newReport = {
      id: `rep_${Date.now()}`,
      productId: productId,
      productTitle: product.title,
      reason: reason,
      reporterName: user ? user.name : "Estudiante Anónimo",
      date: new Date().toLocaleDateString()
    };

    const updatedReports = [...reports, newReport];
    setReports(updatedReports);
    localStorage.setItem("academic_reports", JSON.stringify(updatedReports));
  };

  // --- Student Auth operations ---
  const handleLoginSuccess = async (loggedInUser: UserProfile) => {
    try {
      // Intentamos sincronizar con Supabase
      const { data: profile, error } = await supabase
        .from('profiles')
        .upsert({
          id: loggedInUser.id || 'current_user',
          full_name: loggedInUser.name,
          avatar_url: loggedInUser.avatar,
          is_dni_verified: loggedInUser.isDniVerified,
          wallet_balance: loggedInUser.balance,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      const finalUser = {
        ...loggedInUser,
        balance: profile?.wallet_balance !== undefined ? Number(profile.wallet_balance) : loggedInUser.balance
      };

      setUser(finalUser);
      localStorage.setItem("academic_user", JSON.stringify(finalUser));
      setIsLoggedIn(true);
      localStorage.setItem("academic_is_logged_in", "true");
      
    } catch (err: any) {
      console.error("Error al sincronizar el perfil con Supabase:", err.message);
      setUser(loggedInUser);
      setIsLoggedIn(true);
      localStorage.setItem("academic_is_logged_in", "true");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem("academic_is_logged_in", "false");
  };

  // --- Cart and Watchlist operations ---
  const handleToggleWatchlist = (product: Product) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    const isPresent = watchlist.includes(product.id);
    const updated = isPresent
      ? watchlist.filter((id) => id !== product.id)
      : [...watchlist, product.id];
    saveWatchlist(updated);
  };

  const handleAddToCart = (product: Product) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    if (cart.includes(product.id)) return;
    const updated = [...cart, product.id];
    saveCart(updated);
  };

  const handleRemoveFromCart = (id: string) => {
    const updated = cart.filter((itemId) => itemId !== id);
    saveCart(updated);
  };

  // --- Manual Listing Posting ---
  const handlePublishProduct = async (p: {
    title: string;
    category: Category;
    condition: Condition;
    price: number;
    description: string;
    courseCode: string;
    image: string;
  }) => {
    if (!user || !user.isDniVerified) {
      alert("No puedes publicar artículos sin antes verificar tu DNI en tu Perfil.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            title: p.title,
            description: p.description,
            price: p.price,
            category: p.category,
            condition: p.condition,
            course_code: p.courseCode || null,
            image_url: p.image,
            seller_id: user.id || 'current_user',
            status: 'available'
          }
        ])
        .select();

      if (error) throw error;

      alert("¡Artículo publicado con éxito!");
      
      if (data && data[0]) {
        const addedProduct: Product = {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description,
          price: Number(data[0].price),
          category: data[0].category as Category,
          condition: data[0].condition as Condition,
          courseCode: data[0].course_code,
          image: data[0].image_url,
          seller: {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            role: "Tú (Estudiante)",
            rating: 5.0,
            persona: "Eres tú",
          },
          createdAt: data[0].created_at,
          isCustom: true,
        };
        setProducts([addedProduct, ...products]);
        setActiveTab("marketplace");
      }
    } catch (err: any) {
      console.error("Error al publicar en Supabase:", err.message);
      alert("Hubo un problema al guardar tu producto en la nube.");
    }
  };

  const handlePublishFromAI = (p: {
    title: string;
    category: Category;
    condition: Condition;
    price: number;
    description: string;
    courseCode: string;
  }) => {
    const presets: Record<string, string> = {
      "Libros de Texto": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80",
      "Apuntes y Guías": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&auto=format&fit=crop&q=80",
      "Tecnología y Electrónica": "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=500&auto=format&fit=crop&q=80",
      "Material de Laboratorio y Estudio": "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=500&auto=format&fit=crop&q=80",
      "Tutorías y Asesorías": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80",
    };

    let chosenImage = presets[p.category] || presets["Libros de Texto"];

    handlePublishProduct({
      ...p,
      image: chosenImage,
    });
  };

  // --- Negotiation & AI Chat systems ---
  const handleStartNegotiate = (product: Product) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    let session = chatSessions.find((s) => s.productId === product.id);

    if (!session) {
      const initialMessage: Message = {
        id: `m_init_${Date.now()}`,
        sender: "seller",
        text: `¡Hola, qué tal! Soy ${product.seller.name}. Me alegra tu interés en mi "${product.title}". El precio original es S/. ${product.price.toFixed(2)}, pero me puedes proponer tu mejor oferta aquí. ¿En cuánto te gustaría negociarlo?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      session = {
        productId: product.id,
        sellerId: product.seller.id,
        messages: [initialMessage],
        currentPrice: product.price,
        status: "active",
        lastUpdated: new Date().toISOString(),
      };

      saveChatSessions([session, ...chatSessions]);
    }

    setActiveChatSession(session);
    setActiveTab("chat");
  };

  const handleSendMessage = async (text: string, isOffer: boolean = false, offerAmount?: number) => {
    if (!activeChatSession) return;

    const product = products.find((p) => p.id === activeChatSession.productId);
    if (!product) return;

    const userMsg: Message = {
      id: `m_user_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOffer,
      offerAmount,
    };

    const updatedMessages = [...activeChatSession.messages, userMsg];
    const sessionWithUserMsg: ChatSession = {
      ...activeChatSession,
      messages: updatedMessages,
      lastUpdated: new Date().toISOString(),
    };

    setActiveChatSession(sessionWithUserMsg);
    const updatedSessions = chatSessions.map((s) =>
      s.productId === activeChatSession.productId ? sessionWithUserMsg : s
    );
    saveChatSessions(updatedSessions);

    setIsSendingChat(true);

    try {
      const response = await fetch("/api/gemini/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          productTitle: product.title,
          productPrice: product.price,
          productCondition: product.condition,
          sellerPersona: product.seller.persona,
        }),
      });

      if (!response.ok) {
        throw new Error("La negociación falló.");
      }

      const data = await response.json();
      
      const sellerMsg: Message = {
        id: `m_seller_${Date.now()}`,
        sender: "seller",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const finalSession: ChatSession = {
        ...sessionWithUserMsg,
        messages: [...updatedMessages, sellerMsg],
        status: data.isAccepted ? "accepted" : "active",
        currentPrice: data.isAccepted && data.agreedPrice ? data.agreedPrice : sessionWithUserMsg.currentPrice,
        lastUpdated: new Date().toISOString(),
      };

      setActiveChatSession(finalSession);
      const reUpdatedSessions = chatSessions.map((s) =>
        s.productId === activeChatSession.productId ? finalSession : s
      );
      saveChatSessions(reUpdatedSessions);
    } catch (err) {
      console.error(err);
      const errMessage: Message = {
        id: `m_err_${Date.now()}`,
        sender: "seller",
        text: "Perdona, me quedé sin señal un momento. ¿Podrías repetirme tu última oferta por favor?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      const errorSession = {
        ...sessionWithUserMsg,
        messages: [...updatedMessages, errMessage],
      };
      setActiveChatSession(errorSession);
    } finally {
      setIsSendingChat(false);
    }
  };

  // --- Purchase / Buy triggers & Supabase Balance Deduction ---
  const handlePaymentSuccess = async (product: Product, buyPrice: number, deliverySpot: string, paymentMethod: string) => {
    // Si pagó con saldo de la billetera, descontamos y sincronizamos con Supabase
    if (paymentMethod === "UNSCH Pay") {
      const newBalance = Math.max(0, user.balance - (buyPrice + 0.99));
      const updatedUser = {
        ...user,
        balance: newBalance,
      };
      saveUser(updatedUser);

      // Descontar en Supabase real
      try {
        await supabase
          .from('profiles')
          .update({ wallet_balance: newBalance })
          .eq('id', user.id || 'current_user');
      } catch (err: any) {
        console.error("Error al actualizar el saldo en Supabase:", err.message);
      }
    }

    // Registrar recibo
    setTransactionReceipt({
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      productTitle: product.title,
      price: buyPrice,
      sellerName: product.seller.name,
      date: new Date().toLocaleDateString("es-PE", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      meetingLocation: deliverySpot,
    });

    const remainingProducts = products.filter((p) => p.id !== product.id);
    saveProducts(remainingProducts);

    saveCart(cart.filter((id) => id !== product.id));
    saveWatchlist(watchlist.filter((id) => id !== product.id));
    saveChatSessions(chatSessions.filter((s) => s.productId !== product.id));

    setCheckoutProduct(null);
    setCheckoutAgreedPrice(0);
    setActiveChatSession(null);
    setShowCart(false);
    setActiveTab("marketplace");
  };

  const handleCartCheckout = () => {
    const cartProducts = products.filter((p) => cart.includes(p.id));
    if (cartProducts.length === 0) return;

    const productToBuy = cartProducts[0];
    setCheckoutProduct(productToBuy);
    setCheckoutAgreedPrice(productToBuy.price);
  };

  // --- Product grid filtering logic ---
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.courseCode && p.courseCode.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesCondition = selectedCondition === "all" || p.condition === selectedCondition;

    return matchesSearch && matchesCategory && matchesCondition;
  }).sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Navbar
        user={user}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowAuthModal(true)}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cart.length}
        watchlistCount={watchlist.length}
        activeChatsCount={chatSessions.filter((s) => s.status === "accepted" || s.status === "active").length}
        onOpenCart={() => {
          if (!isLoggedIn) {
            setShowAuthModal(true);
          } else {
            setShowCart(true);
          }
        }}
        onOpenWatchlist={() => {
          if (!isLoggedIn) {
            setShowAuthModal(true);
          } else {
            setShowWatchlist(true);
          }
        }}
        onLogout={handleLogout}
      />

      {/* Main Container Wrapper */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* SUCCESS TRANSACTION RECEIPT SCREEN OVERLAY */}
        {transactionReceipt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-md border border-slate-200 w-full max-w-md p-6 shadow-hover relative text-center space-y-4">
              <button 
                onClick={() => setTransactionReceipt(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-3 bg-green-50 rounded-full text-green-500 w-fit mx-auto border border-green-100">
                <Receipt className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-sans font-extrabold text-slate-800 text-lg leading-tight">¡Adquisición Confirmada!</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">RECIBO DE TRANSACCIÓN ACADÉMICA</p>
              </div>

              {/* Receipt Body */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 text-left text-xs space-y-2.5 font-sans">
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">CÓDIGO TXN:</span>
                  <span className="font-mono font-bold text-slate-800">{transactionReceipt.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">ARTÍCULO COMPRADO:</span>
                  <span className="font-bold text-slate-700 block mt-0.5">{transactionReceipt.productTitle}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-100 py-2">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">VENDEDOR:</span>
                    <span className="font-medium text-slate-700">{transactionReceipt.sellerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">TOTAL DEBITADO:</span>
                    <span className="font-black text-secondary text-sm">S/. {transactionReceipt.price.toFixed(2)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">PUNTO DE REUNIÓN / ENTREGA:</span>
                  <span className="font-semibold text-slate-700 block mt-0.5 bg-yellow-50 border border-yellow-100 p-2 rounded text-[11px] leading-snug">
                    {transactionReceipt.meetingLocation}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-2 justify-center italic">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                  <span>Tu pago está protegido bajo custodia universitaria</span>
                </div>
              </div>

              <button
                onClick={() => setTransactionReceipt(null)}
                className="w-full h-11 bg-secondary hover:bg-secondary-light text-white text-xs font-bold rounded-md shadow-md cursor-pointer transition-colors"
              >
                Entendido, Continuar
              </button>
            </div>
          </div>
        )}

        {/* --- VIEW: MARKETPLACE GRID --- */}
        {activeTab === "marketplace" && (
          <div className="space-y-6">
            
            {/* College Welcome Hero Banner */}
            <div className="bg-gradient-to-r from-secondary to-secondary-light text-white rounded-md p-6 md:p-8 shadow-ambient relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 z-10 max-w-xl text-center md:text-left">
                <span className="bg-primary-container text-secondary text-[10px] font-black tracking-widest px-2.5 py-1 rounded uppercase font-mono shadow-xs">
                  Ahorro Colaborativo UNSCH
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans leading-tight mt-2">
                  El Mercado Estudiantil Más Confiable
                </h2>
                <p className="text-sm text-slate-200 font-sans leading-relaxed">
                  Evita pagar precios excesivos. Compra apuntes directos, adquiere calculadoras usadas de egresados o negocia el costo de tus libros de texto mediante chat inteligente de regateo.
                </p>
              </div>

              {/* AI helper promotion banner callout */}
              <div className="bg-white/10 border border-white/20 p-4 rounded-lg flex flex-col items-center md:items-start text-center md:text-left gap-2 z-10 max-w-xs shrink-0 shadow-inner">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary-container font-sans">
                  <Sparkles className="w-4.5 h-4.5 fill-current animate-pulse text-primary-container" />
                  <span>¿Tienes algo para vender?</span>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  Usa nuestro Tasador de Precios IA para valorar tu artículo y redactar una descripción óptima al instante.
                </p>
                <button
                  onClick={() => setActiveTab("evaluator")}
                  className="mt-1 px-3 py-1.5 bg-primary-container hover:bg-primary-container/95 text-secondary text-[11px] font-black rounded shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  Probar Valuador IA
                </button>
              </div>
            </div>

            {/* Filter and Grid Division */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Sidebar Filters */}
              <div className="lg:col-span-3 bg-white p-5 rounded-md border border-slate-200/80 shadow-ambient space-y-5">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Filter className="w-4 h-4 text-secondary" />
                    Filtrar Búsqueda
                  </h3>
                  
                  {(selectedCategory !== "all" || selectedCondition !== "all" || searchQuery !== "") && (
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setSelectedCondition("all");
                        setSearchQuery("");
                      }}
                      className="text-[10px] text-red-500 hover:underline font-bold cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Filter Category */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    Categoría Académica
                  </label>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`text-left px-3 py-2 rounded text-xs transition-all ${
                        selectedCategory === "all"
                          ? "bg-secondary text-white font-bold"
                          : "text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                      }`}
                    >
                      Todos los Artículos
                    </button>
                    {Object.values(Category).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-left px-3 py-2 rounded text-xs transition-all flex items-center justify-between ${
                          selectedCategory === cat
                            ? "bg-secondary text-white font-bold"
                            : "text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                        }`}
                      >
                        <span>{cat}</span>
                        <span className="text-[10px] opacity-70 font-mono">
                          ({products.filter((p) => p.category === cat).length})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Condition */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    Estado del Artículo
                  </label>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setSelectedCondition("all")}
                      className={`text-left px-3 py-1.5 rounded text-xs transition-all ${
                        selectedCondition === "all"
                          ? "text-secondary font-bold"
                          : "text-slate-600 hover:bg-slate-50 cursor-pointer"
                      }`}
                    >
                      Cualquier condición
                    </button>
                    {Object.values(Condition).map((cond) => (
                      <button
                        key={cond}
                        onClick={() => setSelectedCondition(cond)}
                        className={`text-left px-3 py-1.5 rounded text-xs transition-all ${
                          selectedCondition === cond
                            ? "text-secondary font-bold bg-slate-100"
                            : "text-slate-600 hover:bg-slate-50 cursor-pointer"
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Grid Header & List */}
              <div className="lg:col-span-9 space-y-4">
                
                {/* Bar info & Sort */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3.5 rounded-md border border-slate-200/80 gap-3">
                  <p className="text-xs text-slate-500 font-sans">
                    Mostrando <strong className="text-slate-800">{filteredProducts.length}</strong> publicaciones disponibles
                  </p>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-400">Ordenar por:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-secondary cursor-pointer"
                    >
                      <option value="newest">Más Recientes</option>
                      <option value="price_asc">Menor Precio</option>
                      <option value="price_desc">Mayor Precio</option>
                    </select>
                  </div>
                </div>

                {/* Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-md border border-slate-200 p-12 text-center space-y-3">
                    <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-700">No se encontraron artículos</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Intenta ajustar tus filtros de búsqueda o escribe otra palabra en la barra superior.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isWatchlisted={watchlist.includes(product.id)}
                        isInCart={cart.includes(product.id)}
                        onToggleWatchlist={handleToggleWatchlist}
                        onAddToCart={handleAddToCart}
                        onNegotiate={handleStartNegotiate}
                        onSelect={setSelectedProduct}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: AI EVALUATOR / VALUADOR --- */}
        {activeTab === "evaluator" && (
          <AIEvaluator onPublish={handlePublishFromAI} />
        )}

        {/* --- VIEW: SELL FORM --- */}
        {activeTab === "sell" && (
          <SellForm onPublish={handlePublishProduct} />
        )}

        {/* --- VIEW: CHAT NEGOTIATIONS --- */}
        {activeTab === "chat" && (
          <NegotiationChat
            sessions={chatSessions}
            activeSession={activeChatSession}
            products={products}
            onSelectSession={setActiveChatSession}
            onSendMessage={handleSendMessage}
            onBuyNow={(prod, price) => {
              setCheckoutProduct(prod);
              setCheckoutAgreedPrice(price);
            }}
            isSending={isSendingChat}
          />
        )}

        {/* --- VIEW: STUDENT PROFILE --- */}
        {activeTab === "profile" && (
          <StudentProfile
            user={user}
            userProducts={products.filter((p) => p.seller.id === user.id || p.isCustom)}
            onUpdateProfile={(updated) => saveUser(updated)}
          />
        )}

        {/* --- VIEW: ADMIN DASHBOARD --- */}
        {activeTab === "admin" && (
          <AdminDashboard
            reports={reports}
            products={products}
            onDismissReport={handleDismissReport}
            onBlockProduct={handleBlockProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
      </main>

      {/* --- MODAL: PRODUCT DETAIL --- */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isWatchlisted={watchlist.includes(selectedProduct.id)}
          isInCart={cart.includes(selectedProduct.id)}
          onClose={() => setSelectedProduct(null)}
          onToggleWatchlist={handleToggleWatchlist}
          onAddToCart={handleAddToCart}
          onNegotiate={(prod) => {
            setSelectedProduct(null);
            handleStartNegotiate(prod);
          }}
          onReport={handleReportProduct}
        />
      )}

      {/* --- SLIDE OVER: CART --- */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slideInRight">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-secondary" />
                <h3 className="font-bold text-slate-800 text-sm">Tu Carrito de Compras</h3>
              </div>
              <button 
                onClick={() => setShowCart(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
                  <p className="text-xs">Tu carrito está vacío</p>
                </div>
              ) : (
                products
                  .filter((p) => cart.includes(p.id))
                  .map((item) => (
                    <div key={item.id} className="flex gap-3 p-2.5 bg-slate-50 rounded border border-slate-200 items-center">
                      <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded" />
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-slate-800 text-xs truncate">{item.title}</h4>
                        <p className="text-xs font-black text-secondary mt-0.5">S/. {item.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-white space-y-3">
                <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                  <span>Total Estudiantil:</span>
                  <span className="text-secondary text-base">
                    S/. {products
                      .filter((p) => cart.includes(p.id))
                      .reduce((sum, p) => sum + p.price, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleCartCheckout}
                  className="w-full h-11 bg-secondary hover:bg-secondary-light text-white font-bold text-xs rounded shadow transition-colors cursor-pointer"
                >
                  Proceder al Pago Segura
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SLIDE OVER: WATCHLIST --- */}
      {showWatchlist && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slideInRight">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <h3 className="font-bold text-slate-800 text-sm">Lista de Guardados</h3>
              </div>
              <button 
                onClick={() => setShowWatchlist(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-3">
              {watchlist.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Heart className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
                  <p className="text-xs">No tienes artículos guardados</p>
                </div>
              ) : (
                products
                  .filter((p) => watchlist.includes(p.id))
                  .map((item) => (
                    <div key={item.id} className="flex gap-3 p-2.5 bg-slate-50 rounded border border-slate-200 items-center">
                      <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded" />
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-slate-800 text-xs truncate">{item.title}</h4>
                        <p className="text-xs font-black text-secondary mt-0.5">S/. {item.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => handleToggleWatchlist(item)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: AUTH / LOGIN --- */}
      {showAuthModal && (
        <AuthScreen
          onLoginSuccess={(loggedInUser) => {
            handleLoginSuccess(loggedInUser);
            setShowAuthModal(false);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* --- MODAL: PAYMENT GATEWAY --- */}
      {checkoutProduct && (
        <PaymentGateway
          product={checkoutProduct}
          agreedPrice={checkoutAgreedPrice}
          user={user}
          onClose={() => {
            setCheckoutProduct(null);
            setCheckoutAgreedPrice(0);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
