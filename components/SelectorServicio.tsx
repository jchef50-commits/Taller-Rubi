"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function SelectorServicio({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [servicios, setServicios] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "servicios"), (snap) => {
      setServicios(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });
    return () => unsub();
  }, []);

  return (
    <select value={value} onChange={e => onChange(e.target.value)} required className="input">
      <option value="">Selecciona un servicio</option>
      {servicios.map(s => (
        <option key={s.id} value={s.nombre}>{s.nombre}</option>
      ))}
    </select>
  );
}
