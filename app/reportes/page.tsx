"use client";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Calendar, Car, DollarSign, Wrench, RefreshCcw, Activity } from "lucide-react";

interface Reporte {
  id: string;
  fecha: string;
  servicio: string;
  mecanico: string;
  costo: number;
  auto: string;
  estado: string;
}

const kpiIcons = {
  servicios: <Wrench className="w-6 h-6 text-orange-500" />,
  ingresos: <DollarSign className="w-6 h-6 text-orange-500" />,
  autos: <Car className="w-6 h-6 text-orange-500" />,
  activos: <Activity className="w-6 h-6 text-orange-500" />,
};

export default function ReportesPage() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportes = async () => {
      const querySnapshot = await getDocs(collection(db, "reportes"));
      const data: Reporte[] = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Reporte[];
      setReportes(data);
      setLoading(false);
    };
    fetchReportes();
  }, []);

  // KPIs
  const totalServicios = reportes.length;
  const totalIngresos = reportes.reduce((acc, r) => acc + (r.costo || 0), 0);
  const autosUnicos = new Set(reportes.map((r) => r.auto)).size;
  const activos = reportes.filter((r) => r.estado === "En proceso").length;

  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Reportes</h1>

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Servicios" value={totalServicios} icon={kpiIcons.servicios} />
        <KpiCard label="Ingresos" value={`$${totalIngresos}`} icon={kpiIcons.ingresos} />
        <KpiCard label="Autos únicos" value={autosUnicos} icon={kpiIcons.autos} />
        <KpiCard label="Activos" value={activos} icon={kpiIcons.activos} />
      </section>

      {/* Tabla de reportes */}
      <section className="bg-slate-900 rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full text-sm text-slate-200">
          <thead>
            <tr className="bg-slate-800">
              <th className="px-4 py-3 text-left font-semibold">Fecha</th>
              <th className="px-4 py-3 text-left font-semibold">Servicio</th>
              <th className="px-4 py-3 text-left font-semibold">Mecánico</th>
              <th className="px-4 py-3 text-left font-semibold">Auto</th>
              <th className="px-4 py-3 text-left font-semibold">Costo</th>
              <th className="px-4 py-3 text-left font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">
                  <RefreshCcw className="mx-auto animate-spin mb-2" />
                  Cargando reportes...
                </td>
              </tr>
            ) : reportes.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">
                  No hay reportes registrados.
                </td>
              </tr>
            ) : (
              reportes.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800 transition-colors">
                  <td className="px-4 py-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    {r.fecha}
                  </td>
                  <td className="px-4 py-2">{r.servicio}</td>
                  <td className="px-4 py-2">{r.mecanico}</td>
                  <td className="px-4 py-2">{r.auto}</td>
                  <td className="px-4 py-2">${r.costo}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${r.estado === "En proceso" ? "bg-orange-500/20 text-orange-400" : "bg-green-500/20 text-green-400"}`}>
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function KpiCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-slate-900 rounded-xl p-4 flex flex-col items-start gap-2 shadow-md border border-slate-800">
      <div className="flex items-center gap-2">{icon}<span className="text-lg font-bold text-white">{value}</span></div>
      <span className="text-slate-400 text-xs uppercase tracking-wide">{label}</span>
    </div>
  );
}
