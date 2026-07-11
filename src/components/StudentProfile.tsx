/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  User, 
  Mail, 
  BookOpen, 
  Wallet, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  ArrowUpRight, 
  Lock, 
  ShieldCheck, 
  Sparkles,
  Hash,
  Calendar,
  DollarSign,
  Smartphone,
  QrCode
} from "lucide-react";
import { UserProfile } from "../types";

// Pre-defined high-quality avatars for UNSCH students
const PRESET_AVATARS = [
  { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80", label: "Estudiante de Ingeniería" },
  { url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&fit=crop&q=80", label: "Estudiante de Ciencias" },
  { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&fit=crop&q=80", label: "Estudiante de Medicina" },
  { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop&q=80", label: "Estudiante de Derecho" },
  { url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&fit=crop&q=80", label: "Estudiante de Sociales" },
  { url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&fit=crop&q=80", label: "Estudiante de Administración" },
];

interface StudentProfileProps {
  user: UserProfile;
  onUpdateProfile: (updatedUser: UserProfile) => void;
}

export default function StudentProfile({ user, onUpdateProfile }: StudentProfileProps) {
  // Profile edit states
  const [profileFirstName, setProfileFirstName] = useState(user.firstName || user.name.split(" ")[0] || "");
  const [profileLastName, setProfileLastName] = useState(user.lastName || user.name.split(" ").slice(1).join(" ") || "");
  const [profileDni, setProfileDni] = useState(user.dni || "");
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profileUniversity, setProfileUniversity] = useState(user.university);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [showCustomAvatarInput, setShowCustomAvatarInput] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");

  // DNI Verification states
  const [dniFrontFile, setDniFrontFile] = useState<string | null>(user.dniFrontUrl || null);
  const [dniBackFile, setDniBackFile] = useState<string | null>(user.dniBackUrl || null);
  const [isDniVerifying, setIsDniVerifying] = useState(false);
  const [dniVerifyingStep, setDniVerifyingStep] = useState("");
  const [dniSuccessMsg, setDniSuccessMsg] = useState("");
  const [dniErrorMsg, setDniErrorMsg] = useState("");
  
  // Wallet recharge states
  const [rechargeAmount, setRechargeAmount] = useState<number>(20);
  const [customAmountText, setCustomAmountText] = useState("");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [rechargeMethod, setRechargeMethod] = useState<"card" | "yape_plin">("yape_plin");
  
  // Yape / Plin recharge states
  const [rechargeYapeOrPlin, setRechargeYapeOrPlin] = useState<"yape" | "plin">("yape");
  const [rechargeYapePhone, setRechargeYapePhone] = useState("");
  const [rechargeYapeHolder, setRechargeYapeHolder] = useState("");
  
  // Card states
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  
  // Transaction processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [rechargeError, setRechargeError] = useState("");

  // Handler: Save profile updates
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg("");
    setProfileSuccessMsg("");

    if (!profileFirstName.trim()) {
      setProfileErrorMsg("Por favor, ingresa tu nombre.");
      return;
    }
    if (!profileLastName.trim()) {
      setProfileErrorMsg("Por favor, ingresa tu apellido.");
      return;
    }
    
    const dniRegex = /^\d{8}$/;
    if (!profileDni.trim() || !dniRegex.test(profileDni.trim())) {
      setProfileErrorMsg("Por favor, ingresa un número de DNI válido de 8 dígitos.");
      return;
    }

    if (!profileEmail.trim() || !profileEmail.includes("@")) {
      setProfileErrorMsg("Por favor, ingresa un correo institucional válido.");
      return;
    }
    if (!profileUniversity.trim()) {
      setProfileErrorMsg("Por favor, ingresa tu facultad/universidad.");
      return;
    }

    // Uniqueness of DNI check: search in saved registered users
    const savedUsersRaw = localStorage.getItem("registered_students");
    const savedUsers: UserProfile[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

    const dniAlreadyExists = savedUsers.some(
      u => u.dni === profileDni.trim() && u.email.toLowerCase() !== user.email.toLowerCase()
    );

    if (dniAlreadyExists) {
      setProfileErrorMsg("Error: El número de DNI ingresado ya está asociado a otra cuenta registrada.");
      return;
    }

    const finalAvatar = showCustomAvatarInput && customAvatarUrl.trim() 
      ? customAvatarUrl.trim() 
      : selectedAvatar;

    const updated: UserProfile = {
      ...user,
      firstName: profileFirstName.trim(),
      lastName: profileLastName.trim(),
      name: `${profileFirstName.trim()} ${profileLastName.trim()}`,
      dni: profileDni.trim(),
      email: profileEmail,
      university: profileUniversity,
      avatar: finalAvatar,
    };

    onUpdateProfile(updated);
    setProfileSuccessMsg("¡Tu perfil de estudiante se ha actualizado con éxito!");
    setTimeout(() => setProfileSuccessMsg(""), 4000);
  };

  // File upload drag-and-drop & FileReader helpers
  const handleDniFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDniFrontFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDniBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDniBackFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropFront = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDniFrontFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDropBack = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDniBackFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyDni = () => {
    setDniErrorMsg("");
    setDniSuccessMsg("");

    if (!profileDni || profileDni.trim().length !== 8) {
      setDniErrorMsg("Por favor ingresa primero un número de DNI válido de 8 dígitos en la sección de perfil.");
      return;
    }

    if (!dniFrontFile || !dniBackFile) {
      setDniErrorMsg("Debes subir tanto la foto frontal como la de reverso de tu DNI.");
      return;
    }

    setIsDniVerifying(true);
    setDniVerifyingStep("Subiendo archivos de imagen encriptados...");

    setTimeout(() => {
      setDniVerifyingStep("Analizando consistencia del DNI con Inteligencia Artificial...");
      setTimeout(() => {
        setDniVerifyingStep("Validando número de DNI " + profileDni.trim() + " con el padrón electoral de RENIEC...");
        setTimeout(() => {
          setIsDniVerifying(false);
          // Set user to verified
          const updated: UserProfile = {
            ...user,
            isDniVerified: true,
            dniFrontUrl: dniFrontFile,
            dniBackUrl: dniBackFile,
            dni: profileDni.trim(),
          };
          onUpdateProfile(updated);
          setDniSuccessMsg("¡Felicidades! Tu identidad ha sido verificada satisfactoriamente. Ahora puedes publicar artículos.");
        }, 1500);
      }, 1500);
    }, 1500);
  };

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 16);
    const parts = val.match(/.{1,4}/g) || [];
    setCardNumber(parts.join(" "));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length > 2) {
      setCardExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
      setCardExpiry(val);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3));
  };

  // Handler: Deposit wallet funds
  const handleDepositFunds = (e: React.FormEvent) => {
    e.preventDefault();
    setRechargeError("");
    setRechargeSuccess(false);

    const amountToDeposit = isCustomAmount ? parseFloat(customAmountText) : rechargeAmount;
    
    if (isNaN(amountToDeposit) || amountToDeposit <= 0) {
      setRechargeError("Por favor ingresa un monto válido de recarga mayor a S/. 0.");
      return;
    }

    if (rechargeMethod === "yape_plin") {
      const cleanPhone = rechargeYapePhone.replace(/\s/g, "");
      if (!cleanPhone) {
        setRechargeError("Por favor, ingresa tu número de celular para la recarga.");
        return;
      }
      if (cleanPhone.length < 9) {
        setRechargeError("Por favor, ingresa un número de celular de Yape/Plin válido de 9 dígitos.");
        return;
      }
      if (!rechargeYapeHolder.trim()) {
        setRechargeError("Por favor, ingresa el nombre del titular de la cuenta móvil.");
        return;
      }
    } else {
      if (cardNumber.replace(/\s/g, "").length < 16) {
        setRechargeError("Ingresa un número de tarjeta Visa/Mastercard válido de 16 dígitos.");
        return;
      }

      if (!cardName.trim()) {
        setRechargeError("Por favor, ingresa el nombre impreso en la tarjeta.");
        return;
      }

      if (cardExpiry.length < 5) {
        setRechargeError("Ingresa una fecha de vencimiento válida (MM/YY).");
        return;
      }

      if (cardCvv.length < 3) {
        setRechargeError("Ingresa el código CVV de 3 dígitos de seguridad.");
        return;
      }
    }

    // Start checkout processing animation
    setIsProcessing(true);
    setProcessingStep(
      rechargeMethod === "yape_plin"
        ? `Estableciendo comunicación con la pasarela móvil de ${rechargeYapeOrPlin === "yape" ? "Yape" : "Plin"}...`
        : "Estableciendo comunicación encriptada con la red UNSCH Pay..."
    );

    setTimeout(() => {
      setProcessingStep(
        rechargeMethod === "yape_plin"
          ? `Verificando transferencia móvil y validando código de operación...`
          : "Procesando cobro mediante pasarela de pago seguro bancaria..."
      );
    }, 1200);

    setTimeout(() => {
      setProcessingStep("Verificando transacción y acreditando saldo instantáneo...");
    }, 2400);

    setTimeout(() => {
      const updatedUser: UserProfile = {
        ...user,
        balance: user.balance + amountToDeposit,
      };
      onUpdateProfile(updatedUser);
      setIsProcessing(false);
      setRechargeSuccess(true);
      // Clear forms
      setCardNumber("");
      setCardName("");
      setCardExpiry("");
      setCardCvv("");
      setCustomAmountText("");
      setRechargeYapePhone("");
      setRechargeYapeHolder("");
    }, 3600);
  };

  const selectPredefinedAmount = (amt: number) => {
    setIsCustomAmount(false);
    setRechargeAmount(amt);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 animate-fadeIn" id="student-profile-view">
      
      {/* View Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-secondary text-white rounded-3xl p-6 md:p-8 shadow-ambient relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 z-10 text-center md:text-left">
          <span className="bg-primary-container text-blue-700 text-[10px] font-black tracking-widest px-2.5 py-1 rounded uppercase font-mono shadow-xs">
            Portal del Estudiante UNSCH
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans leading-tight mt-2">
            Tu Cuenta y Monedero Virtual
          </h2>
          <p className="text-sm text-slate-200 font-sans leading-relaxed max-w-xl">
            Gestiona la información de tu perfil universitario para inspirar confianza al vender y recarga tu monedero estudiantil para comprar apuntes y tecnología al instante.
          </p>
        </div>
        
        {/* Quick balance overview widget */}
        <div className="bg-white/10 border border-white/20 p-5 rounded-2xl flex flex-col items-center justify-center text-center z-10 w-full md:w-56 shrink-0 shadow-inner">
          <Wallet className="w-8 h-8 text-blue-300 mb-1" />
          <span className="text-[10px] text-blue-200 font-black tracking-wider uppercase font-mono">SALDO ACTUAL</span>
          <span className="text-3xl font-black font-mono text-white mt-0.5">S/. {user.balance.toFixed(2)}</span>
          <span className="text-[9px] text-blue-100 bg-blue-900/50 px-2 py-0.5 rounded-full mt-2 border border-blue-500/30">
            Acreditación al Instante
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: UNSCH Pay Recharge Hub */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-ambient space-y-6 relative overflow-hidden">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-sans font-black text-slate-800 text-base flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                <Wallet className="w-4.5 h-4.5 stroke-[2.5]" />
              </span>
              Recargar Monedero UNSCH Pay
            </h3>
            <p className="text-xs text-slate-450 mt-1">
              Agrega fondos de manera segura usando cualquier tarjeta de débito o crédito bancaria.
            </p>
          </div>

          {/* Simulated loading screen */}
          {isProcessing && (
            <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
              <div className="relative mb-5">
                <div className="w-14 h-14 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center font-bold text-xs text-blue-600 font-mono">
                  S/.
                </span>
              </div>
              <h4 className="font-sans font-black text-slate-800 text-sm">
                {rechargeMethod === "yape_plin" ? "Procesando Billetera Móvil..." : "Validando Transacción Bancaria..."}
              </h4>
              <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed font-mono">
                {processingStep}
              </p>
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-[10px] text-slate-400 max-w-xs mt-6 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Encriptación segura SSL de 256 bits activa. Tus credenciales bancarias no se guardarán.</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleDepositFunds} className="space-y-5">
            {rechargeSuccess && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-700 text-xs p-4 rounded-2xl flex items-start gap-3 animate-fadeIn">
                <CheckCircle className="w-5 h-5 shrink-0 text-green-600 mt-0.5" />
                <div>
                  <span className="font-bold block">¡Recarga Exitosa!</span>
                  <span>Los fondos han sido agregados a tu monedero estudiantil. ¡Ya puedes realizar ofertas y adquirir artículos en el mercado!</span>
                </div>
              </div>
            )}

            {rechargeError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-700 text-xs p-4 rounded-2xl flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <span>{rechargeError}</span>
              </div>
            )}

            {/* Select Amount */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest">
                1. Selecciona el Monto a Depositar
              </label>
              
              {/* Preset buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => selectPredefinedAmount(amt)}
                    className={`py-2 px-3 text-xs rounded-xl border font-bold font-mono transition-all ${
                      !isCustomAmount && rechargeAmount === amt
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-350 text-slate-600"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Custom amount switch */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsCustomAmount(true)}
                  className={`text-[11px] font-bold underline transition-colors ${
                    isCustomAmount ? "text-blue-600" : "text-slate-450 hover:text-slate-600"
                  }`}
                >
                  ¿Deseas recargar otro monto personalizado?
                </button>
                
                {isCustomAmount && (
                  <div className="mt-2 relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-bold text-slate-500">
                      S/.
                    </span>
                    <input
                      type="number"
                      placeholder="Monto personalizado (ej: 15.50)"
                      value={customAmountText}
                      onChange={(e) => setCustomAmountText(e.target.value)}
                      className="w-full h-10 pl-8 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-blue-500 text-slate-700"
                      min="1"
                      step="any"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Select Recharge Method */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest">
                2. Selecciona tu Método de Pago
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Option 1: Yape / Plin */}
                <button
                  type="button"
                  onClick={() => setRechargeMethod("yape_plin")}
                  className={`py-3 px-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    rechargeMethod === "yape_plin"
                      ? "border-purple-600 bg-purple-50/20 text-purple-950"
                      : "border-slate-200 bg-white hover:border-slate-350 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-5 h-5 text-purple-600 shrink-0" />
                    <div>
                      <span className="font-bold text-xs block">Yape / Plin</span>
                      <span className="text-[9px] text-slate-400 block leading-tight">Móvil al Instante</span>
                    </div>
                  </div>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    rechargeMethod === "yape_plin" ? "border-purple-600 bg-purple-600 text-white" : "border-slate-300"
                  }`}>
                    {rechargeMethod === "yape_plin" && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </span>
                </button>

                {/* Option 2: Credit/Debit Card */}
                <button
                  type="button"
                  onClick={() => setRechargeMethod("card")}
                  className={`py-3 px-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    rechargeMethod === "card"
                      ? "border-blue-500 bg-blue-50/30 text-blue-700"
                      : "border-slate-200 bg-white hover:border-slate-350 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                      <span className="font-bold text-xs block">Tarjeta de Banco</span>
                      <span className="text-[9px] text-slate-400 block leading-tight">Crédito o Débito</span>
                    </div>
                  </div>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    rechargeMethod === "card" ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300"
                  }`}>
                    {rechargeMethod === "card" && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </span>
                </button>
              </div>
            </div>

            {/* Conditionally Render Fields based on method */}
            {rechargeMethod === "yape_plin" ? (
              <div className="space-y-4 border-t border-slate-100 pt-4 animate-fadeIn">
                {/* Selector Yape vs Plin */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                    Selecciona tu billetera móvil peruana
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRechargeYapeOrPlin("yape")}
                      className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        rechargeYapeOrPlin === "yape"
                          ? "bg-purple-800 text-white border-purple-900 shadow-md"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      Yape
                    </button>
                    <button
                      type="button"
                      onClick={() => setRechargeYapeOrPlin("plin")}
                      className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        rechargeYapeOrPlin === "plin"
                          ? "bg-teal-600 text-white border-teal-700 shadow-md"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-300" />
                      Plin
                    </button>
                  </div>
                </div>

                {/* QR Code and Instructions */}
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-24 bg-white border-2 border-slate-200 rounded-xl p-1.5 shrink-0 flex flex-col items-center justify-center relative shadow-inner">
                    <QrCode className={`w-16 h-16 ${rechargeYapeOrPlin === "yape" ? "text-purple-800" : "text-teal-600"}`} />
                    <span className="absolute bottom-1 text-[7px] font-black tracking-widest uppercase font-mono bg-slate-100 text-slate-500 px-1 rounded">
                      UNSCH PAY
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <span className="font-extrabold text-slate-700 block uppercase text-[10px] tracking-wider font-mono">
                      Instrucciones de transferencia:
                    </span>
                    <p className="leading-relaxed text-[11px]">
                      Escanea el QR o envía tu recarga de <span className="font-extrabold text-secondary">S/. {(isCustomAmount ? parseFloat(customAmountText) || 0 : rechargeAmount).toFixed(2)}</span> al número de tesorería UNSCH <b>966 283 123</b>.
                    </p>
                    <span className="text-[10px] text-slate-450 italic block font-mono">
                      * El saldo se acreditará inmediatamente a tu cuenta de estudiante.
                    </span>
                  </div>
                </div>

                {/* Phone & Holder inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Celular Registrado
                    </label>
                    <div className="relative text-slate-400">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Smartphone className="w-4 h-4 text-slate-500" />
                      </span>
                      <input
                        type="tel"
                        maxLength={9}
                        placeholder="Ej: 987654321"
                        value={rechargeYapePhone}
                        onChange={(e) => setRechargeYapePhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-blue-500 text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Titular de la Cuenta
                    </label>
                    <div className="relative text-slate-400">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <User className="w-4 h-4 text-slate-500" />
                      </span>
                      <input
                        type="text"
                        placeholder="Ej: Diego Llamocca"
                        value={rechargeYapeHolder}
                        onChange={(e) => setRechargeYapeHolder(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 border-t border-slate-100 pt-4 animate-fadeIn">
                <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                  Detalles de tu Tarjeta Bancaria
                </label>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Nombre del Titular
                  </label>
                  <div className="relative text-slate-400">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Ej: Diego Llamocca"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Número de Tarjeta
                  </label>
                  <div className="relative text-slate-400">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <CreditCard className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-blue-500 text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Vencimiento (MM/YY)
                    </label>
                    <div className="relative text-slate-400">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Calendar className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-blue-500 text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      CVV (Seguridad)
                    </label>
                    <div className="relative text-slate-400">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Hash className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        placeholder="123"
                        value={cardCvv}
                        onChange={handleCvvChange}
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-blue-500 text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shield and Guarantee */}
            <div className="bg-slate-55 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/60 space-y-1.5 text-[10px] leading-relaxed text-blue-700">
              <div className="flex items-center gap-1 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>GARANTÍA DE SEGURIDAD ACADÉMICA</span>
              </div>
              <p>
                Los fondos depositados se gestionan de forma transparente y segura. Puedes retirarlos o usarlos para negociar apuntes con transacciones cifradas SSL.
              </p>
            </div>

            {/* Submit btn */}
            <button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-blue-500/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              id="wallet-recharge-submit"
            >
              <ArrowUpRight className="w-4.5 h-4.5" />
              <span>Realizar Depósito Seguro y Recargar</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Profile details and avatar customization */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-ambient space-y-6">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-sans font-black text-slate-800 text-base flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                <User className="w-4.5 h-4.5 stroke-[2.5]" />
              </span>
              Modificar Perfil Estudiantil
            </h3>
            <p className="text-xs text-slate-450 mt-1">
              Personaliza tu identidad del campus para que otros estudiantes y profesores te identifiquen fácilmente.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {profileSuccessMsg && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-700 text-xs p-4 rounded-2xl flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle className="w-5 h-5 shrink-0 text-green-600" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-700 text-xs p-4 rounded-2xl flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            {/* Fields input */}
            <div className="space-y-4">
              
              {/* FirstName & LastName */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Nombre
                  </label>
                  <div className="relative text-slate-400">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <User className="w-4 h-4 text-slate-400" />
                    </span>
                    <input
                      type="text"
                      value={profileFirstName}
                      onChange={(e) => setProfileFirstName(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-700"
                      placeholder="Ej: Diego"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Apellido
                  </label>
                  <div className="relative text-slate-400">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <User className="w-4 h-4 text-slate-400" />
                    </span>
                    <input
                      type="text"
                      value={profileLastName}
                      onChange={(e) => setProfileLastName(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-700"
                      placeholder="Ej: Llamocca"
                    />
                  </div>
                </div>
              </div>

              {/* DNI Field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Número de DNI
                </label>
                <div className="relative text-slate-400">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 font-bold text-xs">
                    🪪
                  </span>
                  <input
                    type="text"
                    maxLength={8}
                    value={profileDni}
                    onChange={(e) => setProfileDni(e.target.value.replace(/\D/g, ""))}
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-blue-500 text-slate-700"
                    placeholder="Ej: 70245678"
                  />
                </div>
              </div>

              {/* Institutional Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Correo Institucional (@unsch.edu.pe)
                </label>
                <div className="relative text-slate-400">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-700"
                    placeholder="Ej: usuario@unsch.edu.pe"
                  />
                </div>
              </div>

              {/* University Faculty / Program */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Facultad / Escuela Profesional
                </label>
                <div className="relative text-slate-400">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    value={profileUniversity}
                    onChange={(e) => setProfileUniversity(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-700"
                    placeholder="Ej: Ingeniería de Sistemas - UNSCH"
                  />
                </div>
              </div>
            </div>

            {/* Avatar Selector Section */}
            <div className="space-y-3.5 border-t border-slate-100 pt-4">
              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Elige tu Avatar Estudiantil
              </label>

              {/* Avatar Grid selection */}
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((av, index) => {
                  const isSelected = selectedAvatar === av.url && !showCustomAvatarInput;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(av.url);
                        setShowCustomAvatarInput(false);
                      }}
                      className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                        isSelected ? "border-blue-500 bg-blue-50 scale-105 shadow-sm" : "border-slate-150 hover:border-slate-300"
                      }`}
                      title={av.label}
                    >
                      <img 
                        src={av.url} 
                        alt={av.label} 
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center rounded-full">
                          <CheckCircle className="w-4 h-4 text-blue-600 bg-white rounded-full p-0.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Option: custom URL */}
              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={() => setShowCustomAvatarInput(!showCustomAvatarInput)}
                  className={`text-[11px] font-bold underline transition-colors ${
                    showCustomAvatarInput ? "text-blue-600" : "text-slate-450 hover:text-slate-600"
                  }`}
                >
                  ¿Usar un enlace de imagen personalizado?
                </button>

                {showCustomAvatarInput && (
                  <div className="mt-2 space-y-2">
                    <input
                      type="url"
                      placeholder="Pega la dirección URL de tu avatar"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-700"
                    />
                    <p className="text-[10px] text-slate-400">
                      Copia el enlace directo de tu foto de perfil de Facebook, LinkedIn o cualquier imagen pública de internet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit profile save */}
            <button
              type="submit"
              className="w-full h-12 bg-secondary hover:bg-secondary-light text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              id="profile-save-submit"
            >
              <Save className="w-4.5 h-4.5 text-blue-300" />
              <span>Guardar Configuración de Perfil</span>
            </button>
          </form>

          {/* DNI Verification Box */}
          <div className="bg-slate-55 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 mt-6 relative overflow-hidden" id="dni-verification-box">
            
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.03),transparent)] pointer-events-none" />

            <div className="border-b border-slate-150 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-black text-slate-800 text-base flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                    <ShieldCheck className="w-4.5 h-4.5 stroke-[2.5]" />
                  </span>
                  Verificación de DNI UNSCH
                </h3>
                {user.isDniVerified ? (
                  <span className="bg-green-100 text-green-800 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border border-green-200/60 shadow-xs flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    VERIFICADO
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border border-red-200/60 shadow-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                    PENDIENTE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-450 mt-1">
                La verificación del Documento Nacional de Identidad es un paso obligatorio por seguridad para habilitar la publicación y venta de artículos en el mercado universitario.
              </p>
            </div>

            {isDniVerifying && (
              <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
                <div className="relative mb-5">
                  <div className="w-14 h-14 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
                  <span className="absolute inset-0 flex items-center justify-center font-bold text-xs text-blue-600 font-mono">
                    🪪
                  </span>
                </div>
                <h4 className="font-sans font-black text-slate-800 text-sm">Procesando Identidad...</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed font-mono font-bold">
                  {dniVerifyingStep}
                </p>
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-[10px] text-slate-450 max-w-xs mt-6">
                  Estamos analizando los metadatos y verificando la correspondencia biométrica en RENIEC para autorizar tu cuenta.
                </div>
              </div>
            )}

            {dniSuccessMsg && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-700 text-xs p-4 rounded-2xl flex items-start gap-3 animate-fadeIn">
                <CheckCircle className="w-5 h-5 shrink-0 text-green-600 mt-0.5" />
                <div>
                  <span className="font-bold block">¡Verificación Exitosa!</span>
                  <span>{dniSuccessMsg}</span>
                </div>
              </div>
            )}

            {dniErrorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-700 text-xs p-4 rounded-2xl flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <span>{dniErrorMsg}</span>
              </div>
            )}

            {user.isDniVerified ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-xs text-green-800 space-y-1.5">
                  <span className="font-bold block text-green-900">Tu DNI ha sido aprobado y enlazado</span>
                  <p>
                    Tu número de DNI (<span className="font-bold font-mono text-sm">{user.dni}</span>) se encuentra verificado con el padrón de la UNSCH. Ahora cuentas con permisos completos de vendedor en la plataforma.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider font-mono">FRENTE DEL DNI</span>
                    <div className="aspect-video bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative shadow-inner">
                      <img 
                        src={dniFrontFile || "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&auto=format&fit=crop&q=80"} 
                        alt="DNI Frente" 
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white/90 drop-shadow-sm" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider font-mono">REVERSO DEL DNI</span>
                    <div className="aspect-video bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative shadow-inner">
                      <img 
                        src={dniBackFile || "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&auto=format&fit=crop&q=80"} 
                        alt="DNI Reverso" 
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white/90 drop-shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Front Upload */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      1. Frente de tu DNI
                    </span>
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={handleDropFront}
                      className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-4 transition-all relative overflow-hidden group cursor-pointer ${
                        dniFrontFile 
                          ? "border-blue-500 bg-blue-50/20" 
                          : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/10"
                      }`}
                      onClick={() => document.getElementById("dni-front-input")?.click()}
                    >
                      <input 
                        type="file" 
                        id="dni-front-input" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleDniFrontUpload}
                      />
                      {dniFrontFile ? (
                        <>
                          <img 
                            src={dniFrontFile} 
                            alt="Frente DNI" 
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                            <span className="text-[10px] font-bold text-white bg-blue-600 px-2.5 py-1 rounded-lg">Cambiar Foto</span>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-xl text-center block">📷</span>
                          <span className="text-xs font-bold text-slate-600 block">Sube foto de Frente</span>
                          <span className="text-[9px] text-slate-400 block font-mono">Arrastra o haz click</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back Upload */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                      2. Reverso de tu DNI
                    </span>
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={handleDropBack}
                      className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-4 transition-all relative overflow-hidden group cursor-pointer ${
                        dniBackFile 
                          ? "border-blue-500 bg-blue-50/20" 
                          : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/10"
                      }`}
                      onClick={() => document.getElementById("dni-back-input")?.click()}
                    >
                      <input 
                        type="file" 
                        id="dni-back-input" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleDniBackUpload}
                      />
                      {dniBackFile ? (
                        <>
                          <img 
                            src={dniBackFile} 
                            alt="Reverso DNI" 
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                            <span className="text-[10px] font-bold text-white bg-blue-600 px-2.5 py-1 rounded-lg">Cambiar Foto</span>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-xl text-center block">📷</span>
                          <span className="text-xs font-bold text-slate-600 block">Sube foto de Reverso</span>
                          <span className="text-[9px] text-slate-400 block font-mono">Arrastra o haz click</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Simulated Verification Trigger button */}
                <button
                  type="button"
                  onClick={handleVerifyDni}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <ShieldCheck className="w-4.5 h-4.5 text-blue-200" />
                  <span>Procesar y Verificar DNI con RENIEC</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
