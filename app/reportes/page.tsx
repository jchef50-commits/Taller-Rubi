"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return [start.toISOString(), end.toISOString()];
}

export default function ReportesPage() {
  interface Registro {
    id: string;
    precio?: number | string;
    mecanico?: string;
    cliente?: string;
    modelo?: string;
    placa?: string;
    servicio?: string;
    fecha?: string;
  }
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    vehiculos: 0,
    ingresos: 0,
    mecanico: "-"
  });

  const cargarDatos = async () => {
    setLoading(true);
    const [start, end] = getTodayRange();
    const q = query(collection(db, "registros"), where("fecha", ">=", start), where("fecha", "<=", end));
    const snap = await getDocs(q);
    const docs: Registro[] = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Registro, 'id'>) }));
    setRegistros(docs);

    // KPIs
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
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#9b111e]">Reportes del Día</h1>
        <button
          onClick={cargarDatos}
          className="bg-[#9b111e] text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-[#7a0d18] transition"
        >Actualizar</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-[#9b111e]">
          <span className="text-gray-500 text-sm mb-2">Vehículos Hoy</span>
          <span className="text-4xl font-bold text-[#9b111e]">{kpis.vehiculos}</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-[#9b111e]">
          <span className="text-gray-500 text-sm mb-2">Ingresos del Día</span>
          <span className="text-4xl font-bold text-[#9b111e]">${kpis.ingresos.toLocaleString()}</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-[#9b111e]">
          <span className="text-gray-500 text-sm mb-2">Mecánico más Activo</span>
          <span className="text-2xl font-bold text-[#9b111e]">{kpis.mecanico}</span>
        </div>
      </div>

      {/* Tabla de Actividad */}
      <div className="bg-white rounded-xl shadow p-6 border-t-4 border-[#9b111e]">
        <h2 className="text-xl font-semibold text-[#9b111e] mb-4">Actividad de Hoy</h2>
        {loading ? (
          <div className="text-center text-gray-400">Cargando...</div>
        ) : registros.length === 0 ? (
          <div className="text-center text-gray-400 py-8">Aún no hay actividad registrada para el día de hoy.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#9b111e] text-white">
                  <th className="px-4 py-2 text-left">Hora</th>
                  <th className="px-4 py-2 text-left">Cliente</th>
                  <th className="px-4 py-2 text-left">Vehículo</th>
                  <th className="px-4 py-2 text-left">Servicio</th>
                  <th className="px-4 py-2 text-left">Mecánico</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => {
                  const hora = r.fecha ? new Date(r.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-";
                  return (
                    <tr key={r.id} className="border-b hover:bg-red-50">
                      <td className="px-4 py-2">{hora}</td>
                      <td className="px-4 py-2">{r.cliente || '-'}</td>
                      <td className="px-4 py-2">{r.modelo || '-'} {r.placa ? `(${r.placa})` : ''}</td>
                      <td className="px-4 py-2">{r.servicio || '-'}</td>
                      <td className="px-4 py-2">{r.mecanico || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
