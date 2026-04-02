"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Calendar, Car, DollarSign, Wrench, RefreshCcw, Activity } from "lucide-react";

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return [start.toISOString(), end.toISOString()];
}

export default function ReportesPage() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ vehiculos: 0, ingresos: 0, mecanico: "-" });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cargarDatos = async () => {
    setIsRefreshing(true);
    setLoading(true);
    const [start, end] = getTodayRange();
    const q = query(collection(db, "registros"), where("fecha", ">=", start), where("fecha", "<=", end));
    const snap = await getDocs(q);
    const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    setRegistros(docs);

    const vehiculos = docs.length;
    let ingresos = 0;
    const productividad: Record<string, number> = {};
    let mecanicoMasActivo = "-";
    let maxAtendidos = 0;
    
    docs.forEach(r => {
      if (r.precio) ingresos += Number(r.precio);
      if (r.mecanico) {
        productividad[r.mecanico] = (productividad[r.mecanico] || 0) + 1;
        if (productividad[r.mecanico] > maxAtendidos) {
          maxAtendidos = productividad[r.mecanico];
          mecanicoMasActivo = r.mecanico;
        }
      }
    });
    setKpis({ vehiculos, ingresos, mecanico: mecanicoMasActivo });
    setLoading(false);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => { cargarDatos(); }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10 font-sans text-slate-200">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Reportes del <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Día</span>
              </h1>
            </div>
          </div>
          
          <button
            onClick={cargarDatos}
            disabled={isRefreshing}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3.5 rounded-full font-bold shadow-lg transition-transform active:scale-95"
          >
            <RefreshCcw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar Datos</span>
          </button>
        </div>

        {/* Tarjetas de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 relative shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full -z-0"></div>
            <p className="text-slate-400 font-medium mb-1 relative z-10">Vehículos Hoy</p>
            <h3 className="text-5xl font-black text-white tracking-tight relative z-10">{kpis.vehiculos}</h3>
            <Car className="w-10 h-10 text-orange-500 absolute bottom-6 right-6 z-10" />
          </div>
          <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 relative shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full -z-0"></div>
            <p className="text-slate-400 font-medium mb-1 relative z-10">Ingresos del Día</p>
            <h3 className="text-4xl font-black text-white tracking-tight relative z-10"><span className="text-orange-500">$</span>{kpis.ingresos}</h3>
            <DollarSign className="w-10 h-10 text-orange-500 absolute bottom-6 right-6 z-10" />
          </div>
          <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-6 relative shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -z-0"></div>
            <p className="text-slate-400 font-medium mb-1 relative z-10">Mecánico Estrella</p>
            <h3 className="text-3xl font-bold text-white mt-2 relative z-10">{kpis.mecanico}</h3>
            <Wrench className="w-10 h-10 text-orange-500 absolute bottom-6 right-6 z-10" />
          </div>
        </div>

        {/* Tabla de Actividad */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
            <Activity className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-white">Actividad en Tiempo Real</h2>
          </div>
          <div className="p-6">
            <p className="text-slate-400">Tus registros aparecerán aquí una vez que el motor conecte con Firebase.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
