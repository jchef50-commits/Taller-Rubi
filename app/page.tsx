"use client";
import Sidebar from "@/components/Sidebar";
import FormularioRegistro from "@/components/FormularioRegistro";
import { useState } from "react";

export default function Home() {
  const [registroExitoso, setRegistroExitoso] = useState(false);

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#1f2937] flex">
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-center p-4 ml-20">
        <h1 className="text-2xl font-bold mb-4">Recepción de Vehículos</h1>
        <FormularioRegistro onRegistroExitoso={() => setRegistroExitoso(true)} />
        {registroExitoso && (
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
          >
            Enviar WhatsApp
          </a>
        )}
      </main>
    </div>
  );
}
