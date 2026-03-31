"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";

export default function AdminPage() {
  // Servicios
  const [servicios, setServicios] = useState<any[]>([]);
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: "", precio: "" });
  // Mecánicos
  const [mecanicos, setMecanicos] = useState<any[]>([]);
  const [nuevoMecanico, setNuevoMecanico] = useState("");

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      const servSnap = await getDocs(collection(db, "servicios"));
      setServicios(servSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      const mecSnap = await getDocs(collection(db, "mecanicos"));
      setMecanicos(mecSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    cargarDatos();
  }, []);

  // Agregar servicio
  const agregarServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoServicio.nombre || !nuevoServicio.precio) return;
    await addDoc(collection(db, "servicios"), {
      nombre: nuevoServicio.nombre,
      precio: nuevoServicio.precio,
    });
    setNuevoServicio({ nombre: "", precio: "" });
    // Refrescar lista
    const servSnap = await getDocs(collection(db, "servicios"));
    setServicios(servSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // Eliminar servicio
  const eliminarServicio = async (id: string) => {
    await deleteDoc(doc(db, "servicios", id));
    setServicios((prev) => prev.filter((s) => s.id !== id));
  };

  // Agregar mecánico
  const agregarMecanico = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMecanico) return;
    await addDoc(collection(db, "mecanicos"), { nombre: nuevoMecanico });
    setNuevoMecanico("");
    // Refrescar lista
    const mecSnap = await getDocs(collection(db, "mecanicos"));
    setMecanicos(mecSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // Eliminar mecánico
  const eliminarMecanico = async (id: string) => {
    await deleteDoc(doc(db, "mecanicos", id));
    setMecanicos((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#9b111e]">Panel de Administración</h1>
          <Link href="/" className="px-4 py-2 rounded-lg bg-[#9b111e] text-white font-semibold shadow hover:bg-[#7a0d18] transition">Regresar a Recepción</Link>
        </div>

        {/* Gestión de Servicios */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4 border-t-4 border-[#9b111e]">
          <h2 className="text-xl font-semibold text-[#9b111e] mb-2">Servicios</h2>
          <form onSubmit={agregarServicio} className="flex flex-col md:flex-row gap-3">
            <input
              className="flex-1 p-2 border rounded-lg"
              placeholder="Nombre del Servicio"
              value={nuevoServicio.nombre}
              onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
              required
            />
            <input
              className="w-32 p-2 border rounded-lg"
              placeholder="Precio"
              type="number"
              min="0"
              value={nuevoServicio.precio}
              onChange={(e) => setNuevoServicio({ ...nuevoServicio, precio: e.target.value })}
              required
            />
            <button type="submit" className="bg-[#9b111e] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#7a0d18] transition">Agregar</button>
          </form>
          <ul className="divide-y divide-gray-100 mt-4">
            {servicios.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2">
                <span className="font-medium text-gray-700">{s.nombre} <span className="text-xs text-gray-400 ml-2">${s.precio}</span></span>
                <button onClick={() => eliminarServicio(s.id)} className="text-[#9b111e] hover:underline text-sm">Eliminar</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Gestión de Mecánicos */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4 border-t-4 border-[#9b111e]">
          <h2 className="text-xl font-semibold text-[#9b111e] mb-2">Mecánicos</h2>
          <form onSubmit={agregarMecanico} className="flex gap-3">
            <input
              className="flex-1 p-2 border rounded-lg"
              placeholder="Nombre del Mecánico"
              value={nuevoMecanico}
              onChange={(e) => setNuevoMecanico(e.target.value)}
              required
            />
            <button type="submit" className="bg-[#9b111e] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#7a0d18] transition">Agregar</button>
          </form>
          <ul className="divide-y divide-gray-100 mt-4">
            {mecanicos.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2">
                <span className="font-medium text-gray-700">{m.nombre}</span>
                <button onClick={() => eliminarMecanico(m.id)} className="text-[#9b111e] hover:underline text-sm">Eliminar</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
