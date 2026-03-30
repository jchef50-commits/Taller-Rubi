"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

interface Registro {
  id: string;
  mecanico: string;
  servicio: string;
  fecha: string;
}

export default function TablaReportes() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [fechaHoy] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const q = query(collection(db, "registros"), where("fecha", ">=", fechaHoy));
    const unsub = onSnapshot(q, (snap) => {
      setRegistros(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });
    return () => unsub();
  }, [fechaHoy]);

  // Agrupar por mecánico y contar servicios
  const resumen = registros.reduce((acc, reg) => {
    acc[reg.mecanico] = acc[reg.mecanico] || { servicios: 0 };
    acc[reg.mecanico].servicios++;
    return acc;
  }, {} as Record<string, { servicios: number }>);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">Reporte del Día</h2>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="py-2">Mecánico</th>
            <th className="py-2">Servicios Realizados</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(resumen).map(([mecanico, data]) => (
            <tr key={mecanico}>
              <td className="py-2">{mecanico}</td>
              <td className="py-2">{data.servicios}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
