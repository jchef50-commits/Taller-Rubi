"use client";

import React from 'react';
import { Camera, X, Loader2 } from 'lucide-react';

// 1. Declaración de la Interfaz (El contrato de datos)
interface GaleriaProps {
  imagenes: string[];
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  progress: number;
  onDelete: (index: number) => void;
}

// 2. Función del Componente
export default function GaleriaFotos({ imagenes, onFileSelect, isUploading, progress, onDelete }: GaleriaProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Evidencia Fotográfica</label>

      {/* Botón de Captura / Input de Cámara */}
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={onFileSelect}
          disabled={isUploading}
          className="hidden"
          id="camera-input"
        />
        <label
          htmlFor="camera-input"
          className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all
            ${isUploading 
              ? 'bg-gray-50 border-gray-300 cursor-not-allowed' 
              : 'border-[#9b111e] bg-red-50 hover:bg-red-100 shadow-sm'}`}
        >
          {isUploading ? (
            <Loader2 className="animate-spin text-[#9b111e]" size={32} />
          ) : (
            <Camera className="text-[#9b111e]" size={32} />
          )}
          <div className="text-center">
            <span className="block font-bold text-[#9b111e]">
              {isUploading ? `Subiendo archivos...` : 'Capturar Fotos'}
            </span>
            <span className="text-xs text-gray-500">Usa la cámara trasera del dispositivo</span>
          </div>
        </label>
      </div>

      {/* Barra de Progreso Visual */}
      {isUploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-[#9b111e]">
            <span>Progreso de subida</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#9b111e] h-2 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(155,17,30,0.4)]" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {imagenes.length === 0 ? (
        <div className="text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg p-4">
          No hay fotos capturadas aún. El registro requiere evidencia visual.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {imagenes.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-100 shadow-sm group">
              <img 
                src={url} 
                alt={`Vehículo ${index}`} 
                className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105" 
              />
              <button
                type="button"
                onClick={() => onDelete(index)}
                className="absolute top-1 right-1 bg-white/80 hover:bg-white text-[#9b111e] rounded-full p-1 shadow transition-colors z-10"
                aria-label="Eliminar foto"
              >
                <X size={18} />
              </button>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}