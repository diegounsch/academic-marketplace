/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Users, 
  CheckCircle, 
  UserX, 
  AlertTriangle, 
  Flag, 
  ShieldAlert, 
  Trash2, 
  BarChart3, 
  Search, 
  UserCheck, 
  Eye, 
  RefreshCw,
  XCircle,
  Tag,
  ShieldCheck,
  User,
  Wallet
} from "lucide-react";
import { Product, UserProfile } from "../types";

interface AdminDashboardProps {
  products: Product[];
  onDeleteProduct: (productId: string) => void;
  reports: {
    id: string;
    productId: string;
    productTitle: string;
    reason: string;
    reporterName: string;
    date: string;
  }[];
  onDismissReport: (reportId: string) => void;
  onBlockProduct: (productId: string) => void;
}

export default function AdminDashboard({
  products,
  onDeleteProduct,
  reports: propReports,
  onDismissReport,
  onBlockProduct
}: AdminDashboardProps) {
  // --- Local states ---
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"stats" | "verifications" | "blocks" | "reports" | "listings">("stats");
  const [studentSearch, setStudentSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [viewingDni, setViewingDni] = useState<UserProfile | null>(null);

  // Initial Seeding & Loading
  useEffect(() => {
    loadStudents();
    loadReports();
  }, [propReports]);

  const loadStudents = () => {
    const saved = localStorage.getItem("registered_students");
    if (saved) {
      setStudents(JSON.parse(saved));
    } else {
      // Seed initial students to make the panel interactive
      const seed = [
        {
          name: "Juan Pérez García",
          firstName: "Juan",
          lastName: "Pérez García",
          email: "juan.perez.88@unsch.edu.pe",
          university: "Ingeniería de Minas",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          balance: 85.0,
          dni: "74895612",
          dniFrontUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&auto=format&fit=crop&q=80",
          dniBackUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&auto=format&fit=crop&q=80",
          isDniVerified: false,
          isBlocked: false
        },
        {
          name: "María Flores Rojas",
          firstName: "María",
          lastName: "Flores Rojas",
          email: "maria.flores@gmail.com",
          university: "Facultad de Obstetricia - UNSCH",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
          balance: 120.0,
          dni: "76123498",
          dniFrontUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&auto=format&fit=crop&q=80",
          dniBackUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&auto=format&fit=crop&q=80",
          isDniVerified: true,
          isBlocked: false
        },
        {
          name: "Carlos Huamán Quispe",
          firstName: "Carlos",
          lastName: "Huamán Quispe",
          email: "carlos.huaman.15@unsch.edu.pe",
          university: "Ingeniería de Sistemas",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
          balance: 45.0,
          dni: "75369841",
          isDniVerified: false,
          isBlocked: true
        }
      ];
      localStorage.setItem("registered_students", JSON.stringify(seed));
      setStudents(seed);
    }
  };

  const loadReports = () => {
    const saved = localStorage.getItem("academic_reports");
    if (saved) {
      setReports(JSON.parse(saved));
    } else {
      // Seed an initial report for live demonstration
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
      localStorage.setItem("academic_reports", JSON.stringify(seedReport));
      setReports(seedReport);
    }
  };

  // Toggle blocking of a student
  const handleToggleBlockStudent = (email: string) => {
    const updated = students.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, isBlocked: !u.isBlocked };
      }
      return u;
    });
    setStudents(updated);
    localStorage.setItem("registered_students", JSON.stringify(updated));
  };

  // Verify DNI approval
  const handleApproveDni = (email: string) => {
    const updated = students.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, isDniVerified: true };
      }
      return u;
    });
    setStudents(updated);
    localStorage.setItem("registered_students", JSON.stringify(updated));
    setViewingDni(null);
  };

  // Reject/Reset DNI
  const handleRejectDni = (email: string) => {
    const updated = students.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, isDniVerified: false, dniFrontUrl: undefined, dniBackUrl: undefined };
      }
      return u;
    });
    setStudents(updated);
    localStorage.setItem("registered_students", JSON.stringify(updated));
    setViewingDni(null);
  };

  // Action: Dismiss report
  const handleDismissReportLocal = (reportId: string) => {
    const filtered = reports.filter(r => r.id !== reportId);
    setReports(filtered);
    localStorage.setItem("academic_reports", JSON.stringify(filtered));
    onDismissReport(reportId);
  };

  // Action: Moderation deletion
  const handleModerateProductLocal = (productId: string, reportId?: string) => {
    if (reportId) {
      handleDismissReportLocal(reportId);
    }
    onBlockProduct(productId);
    // Reload local products list
    setTimeout(() => {
      loadReports();
    }, 200);
  };

  // Filters
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.dni && s.dni.includes(studentSearch))
  );

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.seller.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Stats calculation
  const totalStudentsCount = students.length + 1; // plus default mockUser
  const verifiedStudentsCount = students.filter(s => s.isDniVerified).length;
  const pendingDniCount = students.filter(s => !s.isDniVerified && s.dniFrontUrl).length;
  const blockedStudentsCount = students.filter(s => s.isBlocked).length;
  const totalVolume = products.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-fadeIn" id="admin-panel">
      
      {/* Admin Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(239,68,68,0.1),transparent)] pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-red-600 rounded-2xl shadow-lg border border-red-500/20">
            <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-red-400 font-black tracking-widest uppercase font-mono">PORTAL DE CONTROL INSTITUCIONAL</span>
            <h2 className="text-2xl font-black font-sans tracking-tight">Panel de Administración UNSCH</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Monitoreo de seguridad transaccional, verificación biométrica de DNI, bloqueo de usuarios infractores y moderación de contenido.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 font-mono text-xs self-start md:self-auto shadow-inner">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-slate-400 font-bold uppercase">SOPORTE ACTIVO • ADMIN</span>
        </div>
      </div>

      {/* Admin Subtabs navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2 pb-px font-sans">
        {[
          { id: "stats", label: "Estadísticas", icon: BarChart3, badge: null, colorClass: "text-blue-500" },
          { id: "verifications", label: "Verificaciones DNI", icon: UserCheck, badge: pendingDniCount, colorClass: "text-amber-500" },
          { id: "blocks", label: "Estudiantes y Bloqueos", icon: Users, badge: blockedStudentsCount, colorClass: "text-red-500" },
          { id: "reports", label: "Reportes Recibidos", icon: Flag, badge: reports.length, colorClass: "text-rose-500" },
          { id: "listings", label: "Listado de Artículos", icon: Tag, badge: products.length, colorClass: "text-indigo-500" },
        ].map((sub) => {
          const Icon = sub.icon;
          const isActive = activeSubTab === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => {
                setActiveSubTab(sub.id as any);
                setViewingDni(null);
              }}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive 
                  ? "border-red-600 text-slate-850" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
              id={`admin-subtab-${sub.id}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-red-650" : "text-slate-400"}`} />
              <span>{sub.label}</span>
              {sub.badge !== null && sub.badge > 0 && (
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                  sub.id === "verifications" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                }`}>
                  {sub.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUBTAB CONTENT: STATS */}
      {activeSubTab === "stats" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card: Total Students */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">ESTUDIANTES ACTIVOS</span>
                <h3 className="text-3xl font-extrabold text-slate-850 mt-1">{totalStudentsCount}</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 font-medium">
              Sincronizado con el registro institucional de cuentas UNSCH
            </p>
          </div>

          {/* Card: Verified DNIs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">DNI VERIFICADOS</span>
                <h3 className="text-3xl font-extrabold text-green-700 mt-1">{verifiedStudentsCount}</h3>
              </div>
              <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 font-medium">
              Alumnos habilitados para publicar sin restricciones
            </p>
          </div>

          {/* Card: Active Listings */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">ARTÍCULOS EN VENTA</span>
                <h3 className="text-3xl font-extrabold text-slate-850 mt-1">{products.length}</h3>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Tag className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 font-medium">
              Valor aproximado en catálogo: <span className="font-bold text-slate-700">S/. {totalVolume.toFixed(2)}</span>
            </p>
          </div>

          {/* Card: Open Reports */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">REPORTES ACTIVOS</span>
                <h3 className="text-3xl font-extrabold text-red-650 mt-1">{reports.length}</h3>
              </div>
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                <Flag className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 font-medium">
              {reports.length > 0 ? "⚠️ Se requiere revisión de moderación" : "✓ Todo limpio, sin infracciones pendientes"}
            </p>
          </div>

          {/* Security Overview & Action guidelines */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-md">
            <h4 className="font-sans font-extrabold text-base mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              Directivas del Buen Administrador
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300 mt-3 leading-relaxed">
              <p>
                1. <strong>Verificación de DNI:</strong> Verifique minuciosamente que la foto del carnet estudiantil corresponda al nombre y apellidos declarados por el alumno en su perfil antes de otorgar el sello de verificación.
              </p>
              <p>
                2. <strong>Contención de Infracciones:</strong> Si un artículo es reportado como "No académico" o "Sospecha de estafa", proceda de inmediato a darlo de baja temporal del catálogo y suspenda la cuenta asociada preventivamente.
              </p>
              <p>
                3. <strong>Soporte Estudiantil:</strong> La UNSCH fomenta la economía circular, por ende, los regateos deben ser monitoreados de manera neutral.
              </p>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 bg-slate-50 rounded-3xl p-6 border border-slate-200">
            <h4 className="font-sans font-bold text-slate-800 text-sm mb-3">Acceso Rápido a Tareas</h4>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setActiveSubTab("verifications")}
                className="p-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-250 rounded-xl transition-all cursor-pointer text-left"
              >
                <div className="w-7 h-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-1.5">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span>Verificar DNIs ({pendingDniCount})</span>
              </button>

              <button 
                onClick={() => setActiveSubTab("reports")}
                className="p-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-250 rounded-xl transition-all cursor-pointer text-left"
              >
                <div className="w-7 h-7 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-1.5">
                  <Flag className="w-4 h-4" />
                </div>
                <span>Moderar Reportes ({reports.length})</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB CONTENT: VERIFICATIONS */}
      {activeSubTab === "verifications" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
            <div>
              <h3 className="font-sans font-extrabold text-slate-800 text-base">Mesa de Verificación de Identidad (DNI)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Aprueba o rechaza solicitudes de verificación biométrica con carnet nacional de identidad.</p>
            </div>
            <button 
              onClick={loadStudents}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-50 transition-colors"
              title="Recargar solicitudes"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left list of applicants */}
            <div className="col-span-1 lg:col-span-5 space-y-3 max-h-[500px] overflow-y-auto pr-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">SOLICITANTES</span>
              
              {students.filter(s => s.dni).length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  No hay estudiantes registrados con documento DNI por verificar.
                </div>
              ) : (
                students.map((s) => {
                  const hasDniDocs = s.dniFrontUrl || s.dniBackUrl;
                  return (
                    <div 
                      key={s.email}
                      onClick={() => setViewingDni(s)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        viewingDni?.email === s.email
                          ? "bg-amber-50/50 border-amber-300 ring-1 ring-amber-300"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full object-cover border" />
                        <div>
                          <h5 className="font-bold text-slate-800 text-xs leading-snug">{s.name}</h5>
                          <span className="text-[10px] text-slate-400 block mt-0.5">DNI: <span className="font-mono font-bold">{s.dni}</span></span>
                          <span className="text-[9px] text-slate-500 block">{s.university}</span>
                        </div>
                      </div>

                      <div>
                        {s.isDniVerified ? (
                          <span className="bg-green-100 text-green-850 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-green-200">
                            VERIFICADO
                          </span>
                        ) : hasDniDocs ? (
                          <span className="bg-amber-100 text-amber-850 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                            PENDIENTE
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                            SIN ARCHIVOS
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right detailed review board */}
            <div className="col-span-1 lg:col-span-7 bg-slate-50 rounded-2xl p-6 border border-slate-200 min-h-[350px] flex flex-col justify-between">
              {viewingDni ? (
                <div className="space-y-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Applicant Profile info */}
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
                      <img src={viewingDni.avatar} alt={viewingDni.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-200" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{viewingDni.name}</h4>
                        <span className="text-xs text-slate-450 block mt-0.5 font-mono">{viewingDni.email}</span>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase mt-1">DNI N°: {viewingDni.dni}</span>
                      </div>
                    </div>

                    {/* DNI Document Photos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block mb-1">Cédula - Frente (Simulación)</span>
                        <div className="relative border-2 border-dashed border-slate-200 rounded-xl bg-white overflow-hidden flex items-center justify-center h-32">
                          {viewingDni.dniFrontUrl ? (
                            <img src={viewingDni.dniFrontUrl} alt="DNI frente" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-3 text-slate-400 text-[10px] font-mono font-medium">
                              [Imágen no cargada o demostrativa]
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block mb-1">Cédula - Reverso (Simulación)</span>
                        <div className="relative border-2 border-dashed border-slate-200 rounded-xl bg-white overflow-hidden flex items-center justify-center h-32">
                          {viewingDni.dniBackUrl ? (
                            <img src={viewingDni.dniBackUrl} alt="DNI reverso" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-3 text-slate-400 text-[10px] font-mono font-medium">
                              [Imágen no cargada o demostrativa]
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-[10px] text-amber-700 leading-normal flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        Al presionar <strong>"Aprobar"</strong>, el alumno recibirá una insignia en su avatar de perfil y quedará autorizado para publicar de manera inmediata en el Mercado.
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-3 border-t border-slate-200 pt-4 mt-4">
                    <button
                      onClick={() => handleRejectDni(viewingDni.email)}
                      className="flex-1 py-2.5 bg-white hover:bg-red-50 text-red-650 font-bold text-xs rounded-xl border border-red-200 hover:border-red-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4.5 h-4.5" />
                      Rechazar Solicitud
                    </button>
                    <button
                      onClick={() => handleApproveDni(viewingDni.email)}
                      className="flex-1 py-2.5 bg-green-650 hover:bg-green-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4.5 h-4.5" />
                      Aprobar Verificación
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                  <UserCheck className="w-12 h-12 text-slate-300 mb-2" />
                  <h4 className="font-sans font-bold text-slate-600 text-sm">Selecciona un postulante</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
                    Haz clic en cualquiera de las solicitudes en el panel izquierdo para revisar sus fotos de identidad y tomar una resolución.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SUBTAB CONTENT: BLOCKS */}
      {activeSubTab === "blocks" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4 mb-6">
            <div>
              <h3 className="font-sans font-extrabold text-slate-800 text-base">Directorio de Cuentas y Estado de Bloqueos</h3>
              <p className="text-xs text-slate-500 mt-0.5">Busca alumnos registrados y administra su permiso de acceso a la plataforma.</p>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre, correo, DNI..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-100">
              <thead className="bg-slate-50 text-[10px] text-slate-450 font-bold uppercase tracking-wider font-mono">
                <tr>
                  <th className="px-4 py-3">Estudiante</th>
                  <th className="px-4 py-3">Identidad</th>
                  <th className="px-4 py-3">Universidad / Facultad</th>
                  <th className="px-4 py-3">Verificación</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s.email} className="hover:bg-slate-50/55 transition-colors">
                    {/* Profile detail */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover border" />
                        <div>
                          <span className="font-bold text-slate-800 block">{s.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{s.email}</span>
                        </div>
                      </div>
                    </td>
                    {/* Identity (DNI) */}
                    <td className="px-4 py-3.5 font-mono text-slate-500 font-bold">
                      {s.dni || "No ingresado"}
                    </td>
                    {/* Faculty */}
                    <td className="px-4 py-3.5 text-slate-600">
                      {s.university}
                    </td>
                    {/* Verification status */}
                    <td className="px-4 py-3.5">
                      {s.isDniVerified ? (
                        <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-green-200 inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          Verificado
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-[10px] px-2.5 py-0.5 rounded-full inline-block">
                          Sin Verificar
                        </span>
                      )}
                    </td>
                    {/* Account Status */}
                    <td className="px-4 py-3.5">
                      {s.isBlocked ? (
                        <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-200 inline-block animate-pulse">
                          ⚠️ BLOQUEADO
                        </span>
                      ) : (
                        <span className="bg-green-50 text-green-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-green-200 inline-block">
                          Activo
                        </span>
                      )}
                    </td>
                    {/* Toggle Lock Button */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleBlockStudent(s.email)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                          s.isBlocked
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        }`}
                      >
                        {s.isBlocked ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Desbloquear</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Bloquear</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-450 text-xs">
                      No se encontraron estudiantes para la búsqueda actual.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT: REPORTS */}
      {activeSubTab === "reports" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
            <div>
              <h3 className="font-sans font-extrabold text-slate-800 text-base">Bandeja de Reportes y Moderación de Publicaciones</h3>
              <p className="text-xs text-slate-500 mt-0.5">Revisa las quejas enviadas por estudiantes acerca de listados en infracción.</p>
            </div>
            <button 
              onClick={loadReports}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-50 transition-colors"
              title="Sincronizar reportes"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500/80 mb-3" />
              <h4 className="font-sans font-bold text-slate-700 text-sm">No hay reportes pendientes</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                ¡Excelente! El mercado está operando bajo estricto cumplimiento académico sin quejas activas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((rep) => {
                const product = products.find(p => p.id === rep.productId);
                return (
                  <div key={rep.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start justify-between gap-4 transition-all hover:bg-slate-100/50">
                    <div className="space-y-2 w-full md:max-w-2xl">
                      {/* Alert header details */}
                      <div className="flex items-center gap-2">
                        <span className="bg-red-100 text-red-800 text-[10px] font-black px-2.5 py-0.5 rounded font-mono uppercase tracking-wider border border-red-200">
                          {rep.reason}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Enviado por {rep.reporterName} • {rep.date}</span>
                      </div>

                      {/* Product detail */}
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{rep.productTitle}</h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">ID de artículo: {rep.productId}</span>
                      </div>

                      {product ? (
                        <div className="bg-white p-3 rounded-xl border border-slate-150 text-xs text-slate-600 flex gap-3.5 items-center">
                          <img src={product.image} alt={product.title} className="w-10 h-10 rounded object-cover border" referrerPolicy="no-referrer" />
                          <div>
                            <span className="font-bold text-slate-700 block text-[11px] leading-tight">{product.title}</span>
                            <span className="font-semibold text-secondary text-xs block mt-0.5">S/. {product.price.toFixed(2)}</span>
                            <span className="text-[10px] text-slate-450 block mt-0.5">Vendedor: {product.seller.name} ({product.seller.role})</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-[10px] text-red-650 font-medium">
                          ⚠️ El artículo ya no existe en el catálogo activo (puede haber sido vendido o removido).
                        </div>
                      )}
                    </div>

                    {/* Moderation actions */}
                    <div className="flex gap-2 self-stretch md:self-auto justify-end border-t border-slate-200 pt-3.5 md:border-t-0 md:pt-0 shrink-0">
                      <button
                        onClick={() => handleDismissReportLocal(rep.id)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 text-[11px] font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
                        title="Descartar reporte por considerarlo falso o irrelevante"
                      >
                        Descartar Reporte
                      </button>
                      
                      {product && (
                        <button
                          onClick={() => handleModerateProductLocal(product.id, rep.id)}
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[11px] font-black rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1 border border-red-700"
                          title="Eliminar publicación permanentemente de la plataforma"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar Publicación
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB CONTENT: CATALOG LISTINGS */}
      {activeSubTab === "listings" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4 mb-6">
            <div>
              <h3 className="font-sans font-extrabold text-slate-800 text-base">Directorio Completo del Catálogo Académico</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monitorea y regula todos los artículos publicados en tiempo real.</p>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar por título, categoría, vendedor..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((p) => (
              <div key={p.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex gap-4 hover:bg-slate-100/30 transition-all justify-between items-start">
                <div className="flex gap-3.5 items-start">
                  <img src={p.image} alt={p.title} className="w-16 h-16 rounded-xl object-cover border shrink-0 bg-white" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1">{p.title}</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block mt-0.5">{p.category}</span>
                    <span className="font-bold text-secondary text-xs mt-1 block">S/. {p.price.toFixed(2)}</span>
                    
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                      <img src={p.seller.avatar} alt={p.seller.name} className="w-4 h-4 rounded-full object-cover" />
                      <span>{p.seller.name} • {p.seller.role}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleModerateProductLocal(p.id)}
                  className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all cursor-pointer shrink-0 border border-red-200"
                  title="Eliminar publicación por moderación directa"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-2 text-center py-12 text-slate-450 text-xs">
                No hay publicaciones registradas para el criterio de búsqueda.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
