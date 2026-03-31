"use client";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function SelectorMecanico({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [mecanicos, setMecanicos] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "mecanicos"), (snap) => {
      setMecanicos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });
    return () => unsub();
  }, []);

  return (
    <select value={value} onChange={e => onChange(e.target.value)} required className="input">
      <option value="">Selecciona un mecánico</option>
      {mecanicos.map(m => (
        <option key={m.id} value={m.nombre}>{m.nombre}</option>
      ))}
    </select>
  );
}
