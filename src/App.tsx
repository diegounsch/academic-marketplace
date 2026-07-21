/* @license
 * SPDX-License-Identifier: Apache-2.0
 */
import CheckoutButton from './components/CheckoutButton'; // Ajusta la ruta si es necesario
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
  // --- Persistent States (synced with localStorage) ---
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

  // --- Initial loading on component mount ---
  useEffect(() => {
    
   // Sync products con Supabase
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, profiles(full_name, avatar_url)') // Traemos producto y datos del vendedor
          .eq('status', 'available');

        if (error) throw error;

        if (data && data.length > 0) {
          // Adaptamos los datos de Supabase al formato visual de tu app
          const formattedProducts = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            image: item.image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80',
            category: 'Libros de Texto', // Valor por defecto temporal
            condition: 'Usado',

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
          // Si tu base de datos de Supabase está vacía, mostraremos los datos de prueba para que no se vea vacío
          setProducts(INITIAL_PRODUCTS);
        }
      } catch (err) {
        console.error("Error conectando a Supabase:", err.message);
        setProducts(INITIAL_PRODUCTS); // Si hay error, caemos en los datos falsos
      }
    };

    fetchProducts();

    // Sync user profile (includes wallet balance)
    const savedUser = localStorage.getItem("academic_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      localStorage.setItem("academic_user", JSON.stringify(MOCK_USER));
    }






























    // Sync watchlist
    const savedWatch = localStorage.getItem("academic_watchlist");
    if (savedWatch) {
      setWatchlist(JSON.parse(savedWatch));
    }

    // Sync cart
    const savedCart = localStorage.getItem("academic_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Sync chat sessions
    const savedChats = localStorage.getItem("academic_chats");
    if (savedChats) {
      setChatSessions(JSON.parse(savedChats));
    }

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
        },
        {
          id: "rep_2",
          productId: "stitch_plush",
          productTitle: "Peluche de Stitch Coleccionista (Edición Universitaria)",
          reason: "No es un artículo académico",
          reporterName: "Dr. Héctor Valenzuela",
          date: "09/07/2026"
        }
      ];
      setReports(seedReport);
      localStorage.setItem("academic_reports", JSON.stringify(seedReport));
    }
  }, []);

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

  // --- Admin Panel callback operations ---
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
      // Intentamos registrar o actualizar el perfil del alumno en Supabase usando 'upsert'
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: loggedInUser.id || 'current_user',
          full_name: loggedInUser.name,
          avatar_url: loggedInUser.avatar,
          is_dni_verified: loggedInUser.isDniVerified,
          wallet_balance: loggedInUser.balance,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });



      if (error) throw error;

      // Si se guardó bien en la base de datos, lo mantenemos en la interfaz de React
      setUser(loggedInUser);
      localStorage.setItem("academic_user", JSON.stringify(loggedInUser));




      setIsLoggedIn(true);
      localStorage.setItem("academic_is_logged_in", "true");

    } catch (err) {
      console.error("Error al sincronizar el perfil con Supabase:", err.message);
      // Fallback: Permitimos loguear localmente de todas formas para no trabar al usuario
      setUser(loggedInUser);
      setIsLoggedIn(true);

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
    if (cart.includes(product.id)) return; // prevent duplicates
    const updated = [...cart, product.id];
    saveCart(updated);
  };

  const handleRemoveFromCart = (id: string) => {
    const updated = cart.filter((itemId) => itemId !== id);
    saveCart(updated);
  };

  // --- New Manual Listing Posting ---
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
      // 1. Guardamos el producto en la tabla 'products' de Supabase
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
            seller_id: user.id || 'current_user', // Enlazamos al estudiante actual
            status: 'available'
          }
        ])
        .select();

      if (error) throw error;

      alert("¡Artículo publicado con éxito en Supabase!");

      // 2. Recargamos la página o actualizamos el estado local para mostrar el nuevo item
      if (data && data[0]) {
        const addedProduct: Product = {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description,
          price: data[0].price,
          category: data[0].category,
          condition: data[0].condition,
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
        setActiveTab("marketplace"); // Redirigir al inicio
      }
    } catch (err) {
      console.error("Error al publicar en Supabase:", err.message);
      alert("Hubo un problema al guardar tu producto en la nube.");
    }
  };

  // --- AI-assisted listing posting callback ---
  const handlePublishFromAI = (p: {
    title: string;
    category: Category;
    condition: Condition;
    price: number;
    description: string;
    courseCode: string;
  }) => {
    // Use standard image based on category
    const presets: Record<string, string> = {
      "Libros de Texto": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80",
      "Apuntes y Guías": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&auto=format&fit=crop&q=80",
      "Tecnología y Electrónica": "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=500&auto=format&fit=crop&q=80",
      "Material de Laboratorio y Estudio": "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=500&auto=format&fit=crop&q=80",
      "Tutorías y Asesorías": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80",
    };

    let chosenImage = presets[p.category] || presets["Libros de Texto"];

    // Check for Stitch keywords to match the Stitch images
    const lowerTitle = p.title.toLowerCase();
    if (lowerTitle.includes("stitch")) {
      if (lowerTitle.includes("taza") || lowerTitle.includes("mug") || lowerTitle.includes("café")) {
        chosenImage = "/src/assets/images/stitch_mug_1783649200664.jpg";
      } else if (lowerTitle.includes("mochila") || lowerTitle.includes("backpack") || lowerTitle.includes("bolso")) {
        chosenImage = "/src/assets/images/stitch_backpack_1783649183900.jpg";
      } else {
        chosenImage = "/src/assets/images/stitch_plush_1783649171605.jpg";
      }
    }

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
    // Find if session already exists
    let session = chatSessions.find((s) => s.productId === product.id);

    if (!session) {
      const initialMessage: Message = {
        id: `m_init_${Date.now()}`,
        sender: "seller",
        text: `¡Hola, qué tal! Soy ${product.seller.name}. Me alegra tu interés en mi "${product.title}". El precio original es $${product.price.toFixed(2)}, pero me puedes proponer tu mejor oferta aquí. ¿En cuánto te gustaría negociarlo?`,
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

    // Find respective product
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

    // Append user message instantly
    const updatedMessages = [...activeChatSession.messages, userMsg];
    const sessionWithUserMsg: ChatSession = {
      ...activeChatSession,
      messages: updatedMessages,
      lastUpdated: new Date().toISOString(),
    };

    // Update state & save
    setActiveChatSession(sessionWithUserMsg);
    const updatedSessions = chatSessions.map((s) =>
      s.productId === activeChatSession.productId ? sessionWithUserMsg : s
    );
    saveChatSessions(updatedSessions);

    // Call server negotiation endpoint
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
        throw new Error("La negociación falló. Revisa tu red o vuelve a ofertar.");
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
      // Fallback seller error response
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

  // --- Purchase / Buy triggers and receipt builders ---
  const handlePaymentSuccess = (product: Product, buyPrice: number, deliverySpot: string, paymentMethod: string) => {
    // If they paid with wallet balance, deduct it
    if (paymentMethod === "UNSCH Pay") {

      const updatedUser = {
        ...user,
        balance: user.balance - (buyPrice + 0.99), // price + academic safe fee
      };
      saveUser(updatedUser);










    }

    // Record receipt
    setTransactionReceipt({
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      productTitle: product.title,
      price: buyPrice,
      sellerName: product.seller.name,
      date: new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      meetingLocation: deliverySpot,
    });

    // Remove bought item from available catalog
    const remainingProducts = products.filter((p) => p.id !== product.id);
    saveProducts(remainingProducts);

    // Clear from cart / watchlist
    saveCart(cart.filter((id) => id !== product.id));
    saveWatchlist(watchlist.filter((id) => id !== product.id));

    // Remove negotiation session
    saveChatSessions(chatSessions.filter((s) => s.productId !== product.id));

    // Reset checkout states
    setCheckoutProduct(null);
    setCheckoutAgreedPrice(0);
    setActiveChatSession(null);
    setShowCart(false);
    setActiveTab("marketplace");
  };

  const handleCartCheckout = () => {
    // Get products in cart
    const cartProducts = products.filter((p) => cart.includes(p.id));
    if (cartProducts.length === 0) return;

    // Trigger payment gateway for first item
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
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // newest
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
                    <span className="font-black text-secondary text-sm">${transactionReceipt.price.toFixed(2)}</span>
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

                  {/* Reset filters shortcut */}
                  {(selectedCategory !== "all" || selectedCondition !== "all" || searchQuery !== "") && (
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setSelectedCondition("all");
                        setSearchQuery("");
                      }}
                      className="text-[10px] text-red-500 hover:underline font-bold"
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
                          : "text-slate-600 hover:bg-slate-50 font-medium"
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
                            : "text-slate-600 hover:bg-slate-50 font-medium"
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
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    Estado de Conservación
                  </label>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setSelectedCondition("all")}
                      className={`text-left px-3 py-2 rounded text-xs transition-all ${
                        selectedCondition === "all"
                          ? "bg-secondary text-white font-bold"
                          : "text-slate-600 hover:bg-slate-50 font-medium"
                      }`}
                    >
                      Cualquier Estado
                    </button>
                    {Object.values(Condition).map((cond) => (
                      <button
                        key={cond}
                        onClick={() => setSelectedCondition(cond)}
                        className={`text-left px-3 py-2 rounded text-xs transition-all ${
                          selectedCondition === cond
                            ? "bg-secondary text-white font-bold"
                            : "text-slate-600 hover:bg-slate-50 font-medium"
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Order */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Ordenar resultados
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-9 px-2.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-secondary bg-white font-medium text-slate-700"
                  >
                    <option value="newest">Más Recientes primero</option>
                    <option value="price_asc">Precio: Menor a Mayor</option>
                    <option value="price_desc">Precio: Mayor a Menor</option>
                  </select>
                </div>
              </div>

              {/* Main Product Grid results */}
              <div className="lg:col-span-9 space-y-4">

                {/* Search / Result Count stats */}
                <div className="flex items-center justify-between text-xs text-slate-500 font-sans border-b border-slate-200 pb-3">
                  <span>
                    Mostrando <span className="font-bold text-slate-800">{filteredProducts.length}</span> artículos académicos
                  </span>
                  {searchQuery && (
                    <span>
                      Búsqueda: "<span className="font-semibold text-secondary">{searchQuery}</span>"
                    </span>
                  )}









                </div>

                {/* Grid layout */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-md border border-slate-200/80 p-12 text-center shadow-ambient flex flex-col items-center justify-center min-h-[300px]">
                    <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
                    <h4 className="font-sans font-bold text-slate-600 text-sm">No se encontraron artículos</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      No hay publicaciones que coincidan con tus filtros de búsqueda. Intenta limpiando las selecciones.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="product-grid">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={setSelectedProduct}
                        onNegotiate={handleStartNegotiate}
                        onAddToCart={handleAddToCart}
                        onToggleWatchlist={handleToggleWatchlist}
                        isWatchlisted={watchlist.includes(product.id)}





                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: AI PRICE VALUATION ASSISTANT --- */}
        {activeTab === "evaluator" && (
          <AIEvaluator onPublishFromAI={handlePublishFromAI} />
        )}

        {/* --- VIEW: MY ACTIVE NEGOTIATIONS TIMELINE --- */}
        {activeTab === "negotiations" && (
          <div className="max-w-4xl mx-auto py-4 space-y-6">
            <div className="bg-white rounded-md border border-slate-200 p-6 shadow-ambient">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Centro de Regateo Estudiantil
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Aquí se listan tus negociaciones activas en tiempo real con alumnos y docentes del campus. Revisa el estatus, retoma las conversaciones o procede a concretar la compra.
              </p>
            </div>

            {chatSessions.length === 0 ? (
              <div className="bg-slate-100 rounded-md border-2 border-dashed border-slate-300 p-12 text-center flex flex-col items-center justify-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="font-sans font-bold text-slate-600 text-sm">No tienes negociaciones activas</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Explora el catálogo y presiona "Regatear" en el artículo de tu interés para entablar un chat con su vendedor.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-md border border-slate-200 shadow-ambient overflow-hidden divide-y divide-slate-100">
                {chatSessions.map((session) => {
                  const product = products.find((p) => p.id === session.productId);
                  if (!product) return null; // skipped if sold out

                  return (
                    <div 
                      key={session.productId}
                      className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => {
                        setActiveChatSession(session);
                        setActiveTab("chat");
                      }}
                    >
                      {/* Left side details */}
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <img
                          src={product.image}
                          alt={product.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded object-cover border border-slate-200 shadow-xs"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 leading-tight line-clamp-1 max-w-md">
                            {product.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                            <span>Vendedor: <span className="font-semibold text-slate-700">{product.seller.name}</span></span>
                            <span>•</span>
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600 font-mono font-bold">
                              Original: ${product.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right side stats and button triggers */}
                      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto self-stretch md:self-auto border-t border-slate-100 pt-3 md:border-none md:pt-0">
                        {/* Status tag */}
                        <div className="text-left md:text-right">
                          <span className="text-[9px] block text-slate-400 font-bold uppercase tracking-wider font-mono">ESTATUS</span>
                          {session.status === "accepted" ? (
                            <span className="bg-green-100 text-green-800 text-[10px] px-2.5 py-0.5 rounded font-bold border border-green-200">
                              Trato Cerrado por ${session.currentPrice.toFixed(2)}
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded font-bold border border-amber-200">
                              En Regateo / Propuesta activa
                            </span>
                          )}
                        </div>

                        {/* Continue btn */}
                        <button
                          className="px-4 py-2 bg-secondary hover:bg-secondary-light text-white text-xs font-bold rounded flex items-center gap-1"
                        >
                          Continuar Chat
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: CREATE / POST NEW LISTING --- */}
        {activeTab === "sell" && (
          <SellForm 
            onPublish={handlePublishProduct} 
            setActiveTab={setActiveTab} 
            isDniVerified={!!user?.isDniVerified} 
          />
        )}

        {/* --- VIEW: DETAILED LIVE IA CHAT NEGOTIATOR --- */}
        {activeTab === "chat" && activeChatSession && (
          (() => {
            const product = products.find((p) => p.id === activeChatSession.productId);
            if (!product) {
              return (
                <div className="bg-white p-8 rounded text-center border">
                  Este artículo ya ha sido vendido por el oferente.
                </div>
              );
            }
            return (
              <NegotiationChat
                session={activeChatSession}
                product={product}
                onSendMessage={handleSendMessage}
                onAcceptFinalDeal={(price) => {
                  setCheckoutProduct(product);
                  setCheckoutAgreedPrice(price);
                }}
                onBack={() => {
                  setActiveTab("negotiations");
                  setActiveChatSession(null);
                }}
                isSending={isSendingChat}
              />
            );
          })()
        )}

        {/* --- VIEW: STUDENT PROFILE & WALLET --- */}
        {activeTab === "profile" && isLoggedIn && (
          <StudentProfile 
            user={user} 
            onUpdateProfile={saveUser} 

          />
        )}

        {/* --- VIEW: ADMINISTRATIVE DASHBOARD CONTROL PANEL --- */}
        {activeTab === "admin" && isLoggedIn && user?.isAdmin && (
          <AdminDashboard
            products={products}
            onDeleteProduct={handleDeleteProduct}
            reports={reports}

            onDismissReport={handleDismissReport}
            onBlockProduct={handleBlockProduct}

          />
        )}

      </main>

      {/* --- CART SLIDE-OVER DRAWER MODAL --- */}

















      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full flex flex-col p-6 shadow-hover animate-slideLeft">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-sans font-extrabold text-slate-800 text-base flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-secondary" />
                Mi Carrito de Compras
              </h3>
              <button 
                onClick={() => setShowCart(false)}
                className="p-1 rounded-full hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart list content */}
            {cart.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                <ShoppingBag className="w-12 h-12 text-slate-300 mb-2" />
                <h4 className="font-sans font-bold text-slate-600 text-sm">Tu carrito está vacío</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Agrega libros, calculadoras o apuntes de clase para proceder al pago unificado.
                </p>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto divide-y divide-slate-100 pr-1 py-4">
                {products.filter((p) => cart.includes(p.id)).map((item) => (
                  <div key={item.id} className="py-3.5 flex gap-3 items-start justify-between">
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded object-cover border border-slate-200 shadow-xs"
                    />
                    <div className="flex-grow min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{item.category}</p>
                      <span className="text-secondary font-sans font-black text-xs block mt-1">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Eliminar del carrito"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-slate-100 pt-4 mt-auto space-y-4">
                {/* Pricing sum */}
                <div className="flex justify-between items-center font-sans text-slate-700">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total a pagar:</span>
                  <span className="font-extrabold text-secondary text-xl">
                    ${products.filter((p) => cart.includes(p.id)).reduce((sum, p) => sum + p.price, 0).toFixed(2)}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-100 text-[10px] text-slate-400 leading-normal flex items-start gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                  <span>
                    El carrito procesará por ahora el primer producto listado para su entrega e intercambio custodiado presencial en el campus de la UNSCH.
                  </span>
                </div>

                <button
                  onClick={handleCartCheckout}
                  className="w-full h-12 bg-secondary hover:bg-secondary-light text-white text-xs font-bold rounded-md shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  id="checkout-btn"
                >
                  Confirmar Compra Segura
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- WATCHLIST SLIDE-OVER DRAWER MODAL --- */}
      {showWatchlist && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full flex flex-col p-6 shadow-hover animate-slideLeft">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-sans font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                Mi Lista de Deseos (Watchlist)
              </h3>
              <button 
                onClick={() => setShowWatchlist(false)}
                className="p-1 rounded-full hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Watchlist content */}
            {watchlist.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                <Heart className="w-12 h-12 text-slate-300 mb-2" />
                <h4 className="font-sans font-bold text-slate-600 text-sm">Tu lista de deseos está vacía</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Guarda publicaciones de tu interés presionando el ícono de corazón en las tarjetas de artículos.
                </p>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto divide-y divide-slate-100 pr-1 py-4">
                {products.filter((p) => watchlist.includes(p.id)).map((item) => (
                  <div 
                    key={item.id} 
                    className="py-3 flex gap-3 items-center justify-between hover:bg-slate-50 rounded px-1 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedProduct(item);
                      setShowWatchlist(false);
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded object-cover border border-slate-200 shadow-xs"
                    />
                    <div className="flex-grow min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">{item.title}</h4>
                      <span className="text-secondary font-sans font-bold text-xs block mt-0.5">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWatchlist(item);
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title="Quitar de favoritos"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- POPUP DETAILED VIEW MODAL --- */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onNegotiate={handleStartNegotiate}
          onAddToCart={handleAddToCart}
          onToggleWatchlist={handleToggleWatchlist}
          isWatchlisted={watchlist.includes(selectedProduct.id)}
          onReportProduct={handleReportProduct}
        />
      )}

      {/* --- SECURE PAYMENT GATEWAY MODAL --- */}
      {checkoutProduct && (
        <PaymentGateway
          product={checkoutProduct}
          agreedPrice={checkoutAgreedPrice}
          user={user}
          onPaymentSuccess={(price, deliverySpot, method) => handlePaymentSuccess(checkoutProduct, price, deliverySpot, method)}
          onCancel={() => {
            setCheckoutProduct(null);
            setCheckoutAgreedPrice(0);
          }}

        />
      )}

      {/* --- AUTHENTICATION MODAL OVERLAY --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-5xl my-8 relative">
            <AuthScreen
              onLoginSuccess={(loggedInUser) => {
                handleLoginSuccess(loggedInUser);
                setShowAuthModal(false);
              }}
              mockUser={MOCK_USER}
              onClose={() => setShowAuthModal(false)}
            />
          </div>
        </div>
      )}

      {/* Footer bar */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 font-sans">
          <div className="flex items-center justify-center gap-1">
            <BookOpen className="w-4.5 h-4.5 text-primary-container fill-primary-container stroke-slate-900" />
            <span className="font-bold tracking-tight text-white font-sans">
              ACADEMIC <span className="text-primary-container">MARKETPLACE</span>
            </span>
          </div>
          <p className="max-w-md mx-auto text-slate-500 leading-relaxed">
            Una plataforma diseñada para el fomento de la economía estudiantil circular. UNSCH © 2026. Todos los derechos reservados.
          </p>
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-600 font-mono">
            <ShieldCheck className="w-4 h-4 text-green-600/80" />
            <span>Transacciones y regateos asistidos por la Inteligencia Artificial del modelo Gemini</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
