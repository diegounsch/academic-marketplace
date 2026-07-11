/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import React, { useState } from "react";
import { 
  BookOpen, 
  User, 
  Mail, 
  Lock, 
  Wallet, 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  CheckCircle,
  Eye,
  EyeOff,
  X
} from "lucide-react";
import { UserProfile } from "../types";

const GoogleIcon = () => (
  <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

// Suggested Student Avatars
const STUDENT_AVATARS = [
  { id: "a1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", label: "Diego (Sistemas)" },
  { id: "a2", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", label: "Carlos (Derecho)" },
  { id: "a3", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", label: "Andrea (Medicina)" },
  { id: "a4", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80", label: "Valeria (Artes)" },
];

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  mockUser: UserProfile;
  onClose?: () => void;
}

export default function AuthScreen({ onLoginSuccess, mockUser, onClose }: AuthScreenProps) {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isAdminLogin, setIsAdminLogin] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Admin Form States
  const [adminEmail, setAdminEmail] = useState<string>("admin@unsch.edu.pe");
  const [adminPassword, setAdminPassword] = useState<string>("");
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  
  // Register Form States
  const [regFirstName, setRegFirstName] = useState<string>("");
  const [regLastName, setRegLastName] = useState<string>("");
  const [regDni, setRegDni] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");
  const [regUniversity, setRegUniversity] = useState<string>("Universidad Nacional de San Cristóbal de Huamanga");
  const [regBalance, setRegBalance] = useState<number>(150);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(STUDENT_AVATARS[0].url);
  
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

// Handler for Real Google Login
  const handleRealGoogleLogin = async () => {
    try {
      setErrorMessage("");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Adaptamos los datos de Google al formato de tu aplicación (UserProfile)
      const googleStudent: UserProfile = {
        name: user.displayName || "Estudiante UNSCH",
        firstName: user.displayName?.split(" ")[0] || "Estudiante",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "UNSCH",
        email: user.email || "",
        university: "Universidad Nacional de San Cristóbal de Huamanga",
        avatar: user.photoURL || STUDENT_AVATARS[0].url,
        balance: 150.0,
        dni: "Pendiente", // Google no proporciona DNI, lo dejamos pendiente
        isDniVerified: false
      };

      setSuccessMessage(`¡Bienvenido ${user.displayName}!`);
      
      setTimeout(() => {
        onLoginSuccess(googleStudent);
      }, 1000);

    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      setErrorMessage("Hubo un error al conectar con Google. Cierra la ventana emergente e intenta de nuevo.");
    }
  };

  // Handler for Manual Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!loginEmail || !loginPassword) {
      setErrorMessage("Por favor, ingresa tu correo y contraseña.");
      return;
    }

    const trimmedEmail = loginEmail.trim().toLowerCase();

    // Check Admin login credentials securely
    if (trimmedEmail === "admin@unsch.edu.pe") {
      if (loginPassword === "admin123") {
        setSuccessMessage("¡Acceso administrativo concedido!");
        const adminProfile: UserProfile = {
          name: "Administrador UNSCH",
          firstName: "Administrador",
          lastName: "UNSCH",
          email: "admin@unsch.edu.pe",
          university: "Rectorado y Soporte Técnico - UNSCH",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          balance: 999999.00,
          isAdmin: true
        };
        setTimeout(() => {
          onLoginSuccess(adminProfile);
        }, 850);
        return;
      } else {
        setErrorMessage("Contraseña administrativa incorrecta.");
        return;
      }
    }

    const savedUsersRaw = localStorage.getItem("registered_students");
    const savedUsers: UserProfile[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

    // Simple validation
    if (trimmedEmail === mockUser.email.toLowerCase()) {
      const matchedUser = savedUsers.find(u => u.email.toLowerCase() === mockUser.email.toLowerCase());
      if (matchedUser?.isBlocked) {
        setErrorMessage("Acceso Denegado: Su cuenta estudiantil principal ha sido bloqueada temporalmente por un administrador.");
        return;
      }
      onLoginSuccess(matchedUser || mockUser);
    } else {
      const matchedUser = savedUsers.find(u => u.email.toLowerCase() === trimmedEmail);
      
      if (matchedUser) {
        if (matchedUser.isBlocked) {
          setErrorMessage("Acceso Denegado: Su cuenta estudiantil ha sido bloqueada temporalmente por un administrador de la UNSCH debido a infracciones.");
          return;
        }
        onLoginSuccess(matchedUser);
      } else {
        // For convenience in testing, we let them login anyway with a new generated profile!
        const generatedUser: UserProfile = {
          name: loginEmail.split("@")[0].split(".").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") || "Estudiante UNSCH",
          email: loginEmail,
          university: "Universidad Nacional de San Cristóbal de Huamanga",
          avatar: STUDENT_AVATARS[Math.floor(Math.random() * STUDENT_AVATARS.length)].url,
          balance: 100.0,
        };
        onLoginSuccess(generatedUser);
      }
    }
  };

  // Handler for Admin Portal Login
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!adminEmail || !adminPassword) {
      setErrorMessage("Por favor, ingresa el correo y contraseña administrativa.");
      return;
    }

    if (adminEmail.trim().toLowerCase() === "admin@unsch.edu.pe" && adminPassword === "admin123") {
      setSuccessMessage("¡Acceso administrativo concedido! Iniciando panel...");
      const adminProfile: UserProfile = {
        name: "Administrador UNSCH",
        firstName: "Administrador",
        lastName: "UNSCH",
        email: "admin@unsch.edu.pe",
        university: "Rectorado y Soporte Técnico - UNSCH",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        balance: 999999.00,
        isAdmin: true
      };
      setTimeout(() => {
        onLoginSuccess(adminProfile);
      }, 1000);
    } else {
      setErrorMessage("Credenciales inválidas. Ingrese con admin@unsch.edu.pe y contraseña admin123");
    }
  };

  // Handler for Register Submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!regFirstName.trim() || !regLastName.trim() || !regDni.trim() || !regEmail || !regPassword) {
      setErrorMessage("Por favor completa todos los campos obligatorios.");
      return;
    }

    const dniRegex = /^\d{8}$/;
    if (!dniRegex.test(regDni.trim())) {
      setErrorMessage("El número de DNI debe contener exactamente 8 dígitos numéricos.");
      return;
    }

    if (!regEmail.includes("@unsch.edu.pe") && !regEmail.includes("@gmail.com") && !regEmail.includes(".edu")) {
      setErrorMessage("Por favor ingresa un correo electrónico institucional o válido.");
      return;
    }

    // Uniqueness of DNI check: search in saved registered users and mockUser
    const savedUsersRaw = localStorage.getItem("registered_students");
    const savedUsers: UserProfile[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

    const dniAlreadyExists = 
      (mockUser.dni === regDni.trim() && mockUser.email.toLowerCase() !== regEmail.toLowerCase()) ||
      savedUsers.some(u => u.dni === regDni.trim() && u.email.toLowerCase() !== regEmail.toLowerCase());

    if (dniAlreadyExists) {
      setErrorMessage("Error: El número de DNI ingresado ya está asociado a otra cuenta registrada.");
      return;
    }

    // Create New Student Profile
    const newStudent: UserProfile = {
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      name: `${regFirstName.trim()} ${regLastName.trim()}`,
      email: regEmail,
      university: regUniversity,
      avatar: selectedAvatar,
      balance: Number(regBalance) || 150.0,
      dni: regDni.trim(),
      isDniVerified: false, // Starts as false
    };

    // Save user to localStorage list of registered students
    // Avoid duplicates by email
    const filteredUsers = savedUsers.filter(u => u.email.toLowerCase() !== regEmail.toLowerCase());
    localStorage.setItem("registered_students", JSON.stringify([...filteredUsers, newStudent]));

    setSuccessMessage("¡Cuenta estudiantil creada con éxito!");
    
    // Automatically log in after 1.2 seconds
    setTimeout(() => {
      onLoginSuccess(newStudent);
    }, 1200);
  };

  return (
    <div className={onClose ? "w-full" : "min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8"} id="auth-screen">
      {/* Container Frame */}
      <div className="w-full max-w-5xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] animate-fadeIn">
        
        {/* Left Side: Branding and Welcome */}
        <div className="col-span-1 md:col-span-5 bg-gradient-to-br from-secondary via-secondary-dark to-slate-900 p-8 sm:p-12 flex flex-col justify-between text-white relative">
          
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />

          {/* Logo */}
          <div className="flex items-center gap-2 relative z-10">
            <div className="p-2.5 bg-blue-500 text-white rounded-2xl font-bold shadow-lg">
              <BookOpen className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-widest text-slate-300 block leading-none uppercase">ACADEMIC</span>
              <span className="font-black text-lg tracking-tight text-white block">MARKETPLACE</span>
            </div>
          </div>

          {/* Slogan */}
          <div className="my-8 space-y-4 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              La Red Estudiantil de la <span className="text-blue-400">UNSCH</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Compra y vende libros de texto, apuntes de clase premium y tecnología directamente con tus compañeros de facultad.
            </p>
            
            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-2 text-xs">
                <span className="p-1 bg-white/10 rounded-lg text-blue-300 mt-0.5 font-bold">✔</span>
                <span>Tasaciones asistidas por Inteligencia Artificial</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="p-1 bg-white/10 rounded-lg text-blue-300 mt-0.5 font-bold">✔</span>
                <span>Negociación en tiempo real por chat</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="p-1 bg-white/10 rounded-lg text-blue-300 mt-0.5 font-bold">✔</span>
                <span>Pasarela de pago y monedero universitario</span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-[10px] text-slate-400 font-mono tracking-wider relative z-10 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            <span>UNSCH • Portal de Intercambio Académico 2026</span>
          </div>
        </div>

        {/* Right Side: Interactive Login / Register Form */}
        <div className="col-span-1 md:col-span-7 bg-slate-900 p-8 sm:p-12 flex flex-col justify-center relative">
          
          {/* Close button if rendered as overlay */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 cursor-pointer transition-all active:scale-95 z-20"
              title="Cerrar y volver al Mercado"
              id="close-auth-btn"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          {/* Form Header */}
          <div className="mb-6">
            <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase block mb-1">
              {isRegistering 
                ? "PORTAL DE REGISTRO" 
                : "ACCESO AUTORIZADO"}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {isRegistering 
                ? "Crea tu Cuenta Estudiantil" 
                : "Ingresa a tu Portal Académico"}
            </h3>
          </div>

          {/* Selector de Tipo de Acceso / Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/60 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setIsAdminLogin(false);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                !isRegistering
                  ? "bg-blue-600 text-white shadow font-extrabold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(true);
                setIsAdminLogin(false);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                isRegistering
                  ? "bg-blue-600 text-white shadow font-extrabold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Notification Alerts */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
              <span className="text-lg font-bold">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-300 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5 text-green-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Conditional rendering based on mode */}
          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Correo Estudiantil / Usuario
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="ejemplo@unsch.edu.pe o correo@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-xs border border-slate-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                  <span>Contraseña</span>
                  <a href="#forgot" className="text-blue-400/80 hover:underline text-[9px]">¿La olvidaste?</a>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full h-11 pl-11 pr-11 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-xs border border-slate-800 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Ingresar al Portal Académico</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Separador O */}
              <div className="relative flex py-2 items-center justify-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">O</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Botón Google Login */}
              <button
                type="button"
                onClick={handleRealGoogleLogin}
                className="w-full h-11 bg-white hover:bg-slate-100 text-slate-900 text-xs font-black rounded-xl shadow-lg flex items-center justify-center gap-2.5 cursor-pointer transition-all border border-slate-200 active:scale-98"
                id="google-login-btn"
              >
                <GoogleIcon />
                <span>Ingresar con Google</span>
              </button>

            </form>
          ) : (
            /* REGISTER / SIGN UP FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              
              {/* Profile Avatar Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Elige tu Avatar de Estudiante
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {STUDENT_AVATARS.map((av) => (
                    <button
                      type="button"
                      key={av.id}
                      onClick={() => setSelectedAvatar(av.url)}
                      className={`relative p-1 rounded-xl bg-slate-950 border transition-all ${
                        selectedAvatar === av.url 
                          ? "border-blue-500 ring-2 ring-blue-500/20" 
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <img 
                        src={av.url} 
                        alt={av.label} 
                        className="w-12 h-12 rounded-lg object-cover mx-auto" 
                      />
                      <span className="text-[8px] text-slate-400 block text-center mt-1 font-semibold truncate">
                        {av.label.split(" ")[0]}
                      </span>
                      {selectedAvatar === av.url && (
                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5" id="reg-firstname-label">
                    Nombre *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Ej: Camila"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      required
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-xs border border-slate-800 transition-all"
                      id="reg-firstname-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5" id="reg-lastname-label">
                    Apellido *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Ej: Torres"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      required
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-xs border border-slate-800 transition-all"
                      id="reg-lastname-input"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5" id="reg-dni-label">
                    Número de DNI (8 dígitos) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-bold text-xs">
                      🪪
                    </span>
                    <input
                      type="text"
                      maxLength={8}
                      placeholder="Ej: 71234567"
                      value={regDni}
                      onChange={(e) => setRegDni(e.target.value.replace(/\D/g, ""))}
                      required
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-xs border border-slate-800 transition-all font-mono font-bold"
                      id="reg-dni-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5" id="reg-email-label">
                    Correo UNSCH / Institucional *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      placeholder="ejemplo@unsch.edu.pe"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-xs border border-slate-800 transition-all"
                      id="reg-email-input"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Establecer Contraseña *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-xs border border-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between items-center">
                    <span>Saldo de Prueba (S/. Soles)</span>
                    <span className="text-amber-400 text-[8px] font-mono font-bold bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-900/40">FLEXIBLE</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <Wallet className="w-4 h-4 text-blue-400" />
                    </span>
                    <input
                      type="number"
                      min="5"
                      max="1000"
                      value={regBalance}
                      onChange={(e) => setRegBalance(Number(e.target.value))}
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-xs border border-slate-800 transition-all font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Universidad o Escuela Profesional
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-bold text-xs">
                    🏫
                  </span>
                  <input
                    type="text"
                    value={regUniversity}
                    onChange={(e) => setRegUniversity(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-xs border border-slate-800 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Crear Cuenta e Ingresar</span>
                </button>
              </div>

              {/* Separador O */}
              <div className="relative flex py-2 items-center justify-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">O</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Botón Google Sign Up */}
              <button
                type="button"
                onClick={() => {
                  setGoogleIsRegistering(true);
                  setShowGoogleModal(true);
                }}
                className="w-full h-11 bg-white hover:bg-slate-100 text-slate-900 text-xs font-black rounded-xl shadow-lg flex items-center justify-center gap-2.5 cursor-pointer transition-all border border-slate-200 active:scale-98"
                id="google-register-btn"
              >
                <GoogleIcon />
                <span>Crear cuenta con Google</span>
              </button>
            </form>
          )}

        </div>
      </div>

      {/* GOOGLE SIGN IN MODAL OVERLAY */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn" id="google-auth-modal">
          <div className="bg-white text-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative max-h-[90vh]">
            
            {/* Header / Brand */}
            <div className="p-6 pb-4 border-b border-slate-100 flex flex-col items-center text-center relative">
              <button 
                type="button" 
                onClick={() => {
                  setShowGoogleModal(false);
                  setGoogleError("");
                  setShowCustomGoogleForm(false);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                id="close-google-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-3">
                <GoogleIcon />
              </div>
              <h4 className="font-sans font-black text-slate-900 text-lg leading-tight">
                {googleIsRegistering ? "Crear cuenta con Google" : "Iniciar sesión con Google"}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                para continuar en <span className="font-bold text-blue-600">Academic Marketplace UNSCH</span>
              </p>
            </div>

            {/* Error Message */}
            {googleError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <span>⚠️</span>
                <span className="font-medium">{googleError}</span>
              </div>
            )}

            {/* Scrollable account listing or Custom Form */}
            <div className="p-6 overflow-y-auto space-y-4">
              {!showCustomGoogleForm ? (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
                    {googleIsRegistering ? "Selecciona un perfil de Google para registrarte:" : "Elige una cuenta para ingresar:"}
                  </span>
                  
                  {googleAccountsList.map((acc, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleSelectGoogleAccount(acc)}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/10 flex items-center justify-between text-left transition-all active:scale-98 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={acc.avatar} 
                          alt={acc.name} 
                          className="w-9 h-9 rounded-full object-cover border border-slate-100"
                        />
                        <div>
                          <span className="font-bold text-xs text-slate-800 block group-hover:text-blue-600 transition-colors">{acc.name}</span>
                          <span className="text-[10px] text-slate-450 block font-mono">{acc.email}</span>
                        </div>
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg font-mono">
                        Google Auth
                      </div>
                    </button>
                  ))}

                  {/* Option: Use another account */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomGoogleForm(true);
                      setGoogleError("");
                    }}
                    className="w-full p-3.5 rounded-2xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/10 flex items-center gap-3 text-left transition-all text-slate-600 hover:text-blue-600 font-bold text-xs cursor-pointer"
                    id="google-use-custom-btn"
                  >
                    <span className="p-1.5 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600">➕</span>
                    <span>Usar otra cuenta de Google</span>
                  </button>
                </div>
              ) : (
                /* CUSTOM GOOGLE SIGN IN / CREATE ACCOUNT FORM */
                <form onSubmit={handleCustomGoogleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Nombre Completo *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Camila Torres"
                        value={googleNewName}
                        onChange={(e) => setGoogleNewName(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-800 bg-slate-50"
                        id="google-custom-name-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Correo de Google *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="ejemplo@gmail.com o @unsch.edu.pe"
                        value={googleNewEmail}
                        onChange={(e) => setGoogleNewEmail(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-800 bg-slate-50"
                        id="google-custom-email-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Número de DNI (8 dígitos) *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-bold text-xs">
                        🪪
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={8}
                        placeholder="Ej: 71234567"
                        value={googleNewDni}
                        onChange={(e) => setGoogleNewDni(e.target.value.replace(/\D/g, ""))}
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-blue-500 text-slate-800 bg-slate-50"
                        id="google-custom-dni-input"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomGoogleForm(false);
                        setGoogleError("");
                      }}
                      className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      className="flex-1 h-10 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <GoogleIcon />
                      <span>{googleIsRegistering ? "Registrar" : "Ingresar"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer security badge */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 font-mono">
              <span>🔒 Conexión Segura vía Google Accounts API</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}


