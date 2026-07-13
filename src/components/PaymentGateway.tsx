/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  DollarSign, 
  MapPin, 
  Calendar, 
  Hash, 
  User, 
  ArrowLeft, 
  CheckCircle, 
  Receipt, 
  Wallet,
  AlertCircle,
  QrCode,
  Smartphone
} from "lucide-react";
import { Product, UserProfile } from "../types";
import CheckoutButton from "./CheckoutButton"; // <-- ESTA ES LA LÍNEA NUEVA QUE AGREGAS

// Delivery safe zones in UNSCH campus
const UNSCH_SAFE_ZONES = [
  "Biblioteca Central UNSCH (Entrada Principal)",
  "Pabellón de Ingeniería de Sistemas (Primer piso)",
  "Cafetería Central (Zona de Mesas)",
  "Plaza de la Autonomía (Frente a Administración)",
  "Pabellón de Medicina (Ingreso Principal)",
  "Facultad de Derecho y Ciencias Políticas (Patio Principal)",
];

interface PaymentGatewayProps {
  product: Product;
  agreedPrice: number;
  user: UserProfile;
  onPaymentSuccess: (finalPrice: number, deliverySpot: string, paymentMethod: string) => void;
  onCancel: () => void;
}

export default function PaymentGateway({
  product,
  agreedPrice,
  user,
  onPaymentSuccess,
  onCancel,
}: PaymentGatewayProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet" | "yape_plin">("yape_plin");
  
  // Card Form States
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");

  // Yape / Plin States
  const [yapeOrPlin, setYapeOrPlin] = useState<"yape" | "plin">("yape");
  const [yapePhone, setYapePhone] = useState<string>("");
  const [yapeHolder, setYapeHolder] = useState<string>("");
  
  // Logistics States
  const [selectedSpot, setSelectedSpot] = useState<string>(UNSCH_SAFE_ZONES[0]);
  
  // Status States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [processingPercent, setProcessingPercent] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Payment fees
  const academicFee = 0.99;
  const totalAmount = agreedPrice + academicFee;

  // Auto-format card number (adds space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(" "));
    } else {
      setCardNumber(value);
    }
  };

  // Auto-format expiry date (adds slash MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length > 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  // Auto-format CVV (limits to 3 digits)
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCardCvv(value);
  };

  // Process checkout sequence
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validation
    if (paymentMethod === "wallet") {
      if (user.balance < totalAmount) {
        setErrorMsg(`Tu saldo del Monedero UNSCH (S/. ${user.balance.toFixed(2)}) es insuficiente para cubrir el total de S/. ${totalAmount.toFixed(2)}.`);
        return;
      }
    } else if (paymentMethod === "yape_plin") {
      const cleanPhone = yapePhone.replace(/\s/g, "");
      if (!cleanPhone) {
        setErrorMsg("Por favor, ingresa tu número de celular para el pago.");
        return;
      }
      if (cleanPhone.length < 9) {
        setErrorMsg("Por favor, ingresa un número de celular válido de 9 dígitos.");
        return;
      }
      if (!yapeHolder) {
        setErrorMsg("Por favor, ingresa el nombre del titular de la cuenta.");
        return;
      }
    } else {
      // Validate card details
      if (cardNumber.replace(/\s/g, "").length < 16) {
        setErrorMsg("Por favor, ingresa un número de tarjeta Visa/Mastercard de 16 dígitos.");
        return;
      }
      if (!cardName) {
        setErrorMsg("Ingresa el nombre impreso en la tarjeta.");
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMsg("Ingresa una fecha de vencimiento válida (MM/YY).");
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMsg("Ingresa el código CVV de 3 dígitos de seguridad.");
        return;
      }
    }

    // Trigger loader steps
    setIsProcessing(true);
    setProcessingPercent(10);
    setProcessingStep("Estableciendo conexión encriptada de 256-bits SSL...");

    // Timed step simulator
    const timer1 = setTimeout(() => {
      setProcessingPercent(40);
      setProcessingStep(
        paymentMethod === "wallet" 
          ? "Verificando saldo disponible en el monedero UNSCH Pay..." 
          : paymentMethod === "yape_plin"
            ? `Verificando transferencia en la red de ${yapeOrPlin === "yape" ? "Yape" : "Plin"}...`
            : "Comunicando con la red bancaria (Visa/Mastercard)..."
      );
    }, 1000);

    const timer2 = setTimeout(() => {
      setProcessingPercent(75);
      setProcessingStep(
        paymentMethod === "yape_plin"
          ? `Confirmando transacción de ${yapeOrPlin === "yape" ? "Yape" : "Plin"} con token seguro...`
          : "Cifrando token de pago seguro y aprobando comisiones..."
      );
    }, 2200);

    const timer3 = setTimeout(() => {
      setProcessingPercent(95);
      setProcessingStep("Registrando punto de encuentro académico y emitiendo comprobante...");
    }, 3200);

    const timer4 = setTimeout(() => {
      setProcessingPercent(100);
      setProcessingStep("¡Transacción autorizada con éxito!");
      setIsDone(true);
    }, 4200);
  };

  const handleFinish = () => {
    onPaymentSuccess(
      agreedPrice, 
      selectedSpot, 
      paymentMethod === "wallet" 
        ? "UNSCH Pay" 
        : paymentMethod === "yape_plin"
          ? (yapeOrPlin === "yape" ? "Yape" : "Plin")
          : "Tarjeta bancaria"
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" id="payment-gateway">
      {/* Checkout Window */}
      <div className="bg-white text-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px] animate-fadeIn">
        
        {/* Left Side: Order summary & Safe guidelines */}
        <div className="col-span-1 md:col-span-5 bg-slate-50 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-6">
              <span className="p-1 bg-blue-100 text-blue-600 rounded-lg">
                <Receipt className="w-4 h-4 stroke-[2.5]" />
              </span>
              <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Resumen de Compra</span>
            </div>

            {/* Product card */}
            <div className="flex gap-3 bg-white p-3.5 rounded-2xl border border-slate-150 shadow-xs mb-5">
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100 shadow-inner" 
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-800 truncate leading-tight">{product.title}</h4>
                <span className="text-[9px] text-slate-450 block font-mono mt-0.5 uppercase">{product.category}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-medium text-slate-500">Vendido por:</span>
                  <span className="text-[10px] font-bold text-secondary">{product.seller.name}</span>
                </div>
              </div>
            </div>

            {/* Price lines */}
            <div className="space-y-2 border-b border-slate-150 pb-4 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Precio del Artículo:</span>
                <span className="font-bold text-slate-700">S/. {agreedPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Comisión de Garantía UNSCH:</span>
                <span className="font-bold text-slate-700">S/. {academicFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Monto Total:</span>
              <span className="text-2xl font-black font-sans text-secondary flex items-center gap-0.5">
                <span className="text-blue-650 font-black text-base mr-1">S/.</span>
                {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Secure guidelines badge */}
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/60 mt-6 space-y-2 text-[10px] leading-relaxed text-blue-700">
            <div className="flex items-center gap-1 font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>GARANTÍA ANTIFRAUDE UNSCH</span>
            </div>
            <p>
              El dinero es retenido de forma segura en la pasarela. Solo se liberará al vendedor una vez que se encuentren en el campus y confirmes la entrega física del artículo.
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Payment Forms */}
        <div className="col-span-1 md:col-span-7 p-6 sm:p-8 flex flex-col justify-center relative">
          
          {/* 1. Processing loading screen overlay */}
          {isProcessing && !isDone && (
            <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
              <div className="relative mb-6">
                {/* Circular spinner */}
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center font-bold text-xs text-blue-600">
                  {processingPercent}%
                </span>
              </div>
              <h4 className="font-sans font-extrabold text-slate-800 text-sm">Procesando Transacción Académica...</h4>
              <p className="text-xs text-slate-450 mt-1.5 max-w-xs leading-normal font-mono">
                {processingStep}
              </p>
              <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300 rounded-full" 
                  style={{ width: `${processingPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* 2. Success screen receipt view */}
          {isProcessing && isDone && (
            <div className="absolute inset-0 bg-white z-20 flex flex-col justify-between p-8 animate-fadeIn">
              <div className="text-center space-y-2 flex-grow flex flex-col justify-center items-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <CheckCircle className="w-7 h-7 stroke-[2.5]" />
                </div>
                <h4 className="font-sans font-black text-slate-800 text-lg">¡Pago Autorizado y Procesado!</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Se ha emitido tu comprobante digital de compra segura. Queda coordinada la entrega física.
                </p>

                {/* Simulated ticket */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 w-full max-w-sm text-left text-xs font-mono space-y-2 divide-y divide-dashed divide-slate-200 mt-4 shadow-sm relative">
                  {/* Decorative Ticket side bites */}
                  <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border-r border-slate-200" />
                  <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border-l border-slate-200" />
                  
                  <div className="pb-2 text-[10px] text-slate-400 flex justify-between">
                    <span>CÓDIGO: TXN-{Math.floor(100000 + Math.random() * 900000)}</span>
                    <span className="font-bold text-blue-600">UNSCH PAY®</span>
                  </div>

                  <div className="py-2.5 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ARTÍCULO:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[180px]">{product.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">PAGO TOTAL:</span>
                      <span className="font-black text-secondary">S/. {totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">VENDEDOR:</span>
                      <span className="font-bold text-slate-800">{product.seller.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">MÉTODO:</span>
                      <span className="font-bold text-slate-800 uppercase">
                        {paymentMethod === "wallet" 
                          ? "BILLETERA" 
                          : paymentMethod === "yape_plin"
                            ? (yapeOrPlin === "yape" ? "YAPE" : "PLIN")
                            : "TARJETA"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-slate-500 leading-snug flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 block">PUNTO DE ENCUENTRO SEGURO:</span>
                      <span>{selectedSpot}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full h-12 bg-secondary hover:bg-secondary-light text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                Volver al Mercado de Artículos
              </button>
            </div>
          )}

          {/* 3. Regular checkout inputs */}
          <div className="flex items-center justify-between mb-5">
            <button 
              onClick={onCancel}
              className="text-xs text-slate-450 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Lock className="w-3.5 h-3.5 text-blue-500" />
              <span>SECURE 256-BIT ENCRYPTION</span>
            </div>
          </div>

          <form onSubmit={handleSubmitPayment} className="space-y-4">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Point of encuentro campus select */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2">
              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                ¿Dónde se reunirán en el campus UNSCH?
              </label>
              <select
                value={selectedSpot}
                onChange={(e) => setSelectedSpot(e.target.value)}
                className="w-full h-10 px-3 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 font-bold text-slate-700"
              >
                {UNSCH_SAFE_ZONES.map((spot) => (
                  <option key={spot} value={spot}>{spot}</option>
                ))}
              </select>
            </div>

            {/* Payment Method Tabs */}
            <div>
              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5">
                Selecciona tu Método de Pago
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Option 1: Yape o Plin */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("yape_plin")}
                  className={`py-3 px-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    paymentMethod === "yape_plin"
                      ? "border-purple-600 bg-purple-50/20 text-purple-900"
                      : "border-slate-200 bg-white hover:border-slate-350 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-purple-600 shrink-0" />
                    <div>
                      <span className="font-bold text-xs block">Yape / Plin</span>
                      <span className="text-[9px] text-slate-400 block leading-tight">Móvil al Instante</span>
                    </div>
                  </div>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    paymentMethod === "yape_plin" ? "border-purple-600 bg-purple-600 text-white" : "border-slate-300"
                  }`}>
                    {paymentMethod === "yape_plin" && <span className="w-1 bg-white rounded-full h-1" />}
                  </span>
                </button>

                {/* Option 2: Credit Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`py-3 px-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-blue-500 bg-blue-50/30 text-blue-700"
                      : "border-slate-200 bg-white hover:border-slate-350 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                      <span className="font-bold text-xs block">Tarjeta de Banco</span>
                      <span className="text-[9px] text-slate-400 block leading-tight">Crédito o Débito</span>
                    </div>
                  </div>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    paymentMethod === "card" ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300"
                  }`}>
                    {paymentMethod === "card" && <span className="w-1 bg-white rounded-full h-1" />}
                  </span>
                </button>

                {/* Option 3: Student Wallet Balance */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("wallet")}
                  className={`py-3 px-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    paymentMethod === "wallet"
                      ? "border-emerald-500 bg-emerald-50/30 text-emerald-800"
                      : "border-slate-200 bg-white hover:border-slate-350 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-bold text-xs block">Monedero UNSCH</span>
                      <span className="text-[9px] text-slate-400 block leading-tight">Saldo: S/. {user.balance.toFixed(2)}</span>
                    </div>
                  </div>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    paymentMethod === "wallet" ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
                  }`}>
                    {paymentMethod === "wallet" && <span className="w-1 bg-white rounded-full h-1" />}
                  </span>
                </button>
              </div>
            </div>

            {/* Conditionally render form fields based on selected method */}
            {paymentMethod === "yape_plin" && (
              <div className="space-y-4 border-t border-slate-100 pt-3.5 animate-fadeIn">
                {/* Selector Yape vs Plin */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                    Selecciona tu billetera móvil peruana
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setYapeOrPlin("yape")}
                      className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        yapeOrPlin === "yape"
                          ? "bg-purple-800 text-white border-purple-900 shadow-md scale-98"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      Yape
                    </button>
                    <button
                      type="button"
                      onClick={() => setYapeOrPlin("plin")}
                      className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        yapeOrPlin === "plin"
                          ? "bg-teal-600 text-white border-teal-700 shadow-md scale-98"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-300" />
                      Plin
                    </button>
                  </div>
                </div>

                {/* Simulated QR Code Scan */}
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                  {/* Decorative QR code container */}
                  <div className="w-24 h-24 bg-white border-2 border-slate-200 rounded-xl p-1.5 shrink-0 flex flex-col items-center justify-center relative shadow-inner">
                    <QrCode className={`w-16 h-16 ${yapeOrPlin === "yape" ? "text-purple-800" : "text-teal-600"}`} />
                    <span className="absolute bottom-1 text-[7px] font-black tracking-widest uppercase font-mono bg-slate-100 text-slate-500 px-1 rounded">
                      UNSCH PAY
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <span className="font-extrabold text-slate-700 block uppercase text-[10px] tracking-wider font-mono">
                      Instrucción de transferencia rápida:
                    </span>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      Escanea el código QR o transfiere directamente el total de <span className="font-bold text-secondary">S/. {totalAmount.toFixed(2)}</span> al número oficial de tesorería UNSCH <b>966 283 123</b>.
                    </p>
                    <span className="text-[10px] text-slate-450 italic block font-mono">
                      * El dinero queda seguro en custodia estudiantil UNSCH.
                    </span>
                  </div>
                </div>

                {/* Celular y Nombre */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Celular Registrado (Yape o Plin)
                    </label>
                    <div className="relative text-slate-400">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Smartphone className="w-4 h-4 text-slate-500" />
                      </span>
                      <input
                        type="tel"
                        maxLength={9}
                        placeholder="Ej: 987654321"
                        value={yapePhone}
                        onChange={(e) => setYapePhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 font-bold text-slate-700 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Titular de la Cuenta Móvil
                    </label>
                    <div className="relative text-slate-400">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <User className="w-4 h-4 text-slate-500" />
                      </span>
                      <input
                        type="text"
                        placeholder="Ej: Diego Llamocca"
                        value={yapeHolder}
                        onChange={(e) => setYapeHolder(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 font-medium text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "card" && (
  <div className="space-y-4 border-t border-slate-100 pt-5 text-center">
    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center justify-center">
      {/* Mensaje amigable para el usuario */}
      <p className="text-xs text-slate-600 mb-4 px-2">
        Estás a un paso de completar tu compra de forma segura. 
        Haz clic en el botón de abajo para pagar a través de <strong>Mercado Pago</strong>.
      </p>
      
      {/* Aquí llamamos al botón de Mercado Pago */}
      <div className="w-full max-w-sm">
        <CheckoutButton 
          bookTitle={product.title} 
          bookPrice={totalAmount} 
        />
      </div>
    </div>
  </div>
)}

            {paymentMethod === "wallet" && (
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-2.5">
                <Wallet className="w-5 h-5 text-green-500 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-slate-700 block">Pago con Monedero Estudiantil</span>
                  <p className="text-slate-500 mt-0.5 leading-normal">
                    Se deducirán <span className="font-extrabold text-secondary">S/. {totalAmount.toFixed(2)}</span> directamente de tu saldo de monedero de la plataforma. Saldo restante estimado: <span className="font-bold text-green-600">S/. {(user.balance - totalAmount).toFixed(2)}</span>.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-12 bg-secondary hover:bg-secondary-light text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                id="submit-payment-btn"
              >
                <ShieldCheck className="w-4.5 h-4.5 text-blue-400" />
                <span>Pagar e Intercambiar de forma Segura</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
