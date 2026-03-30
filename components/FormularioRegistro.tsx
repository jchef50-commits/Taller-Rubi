"use client";

import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { Send, Car, User, Phone, Wrench, Camera, AlertCircle, CheckCircle2 } from 'lucide-react';
import GaleriaFotos from './GaleriaFotos';

export default function FormularioRegistro() {
  // Estados del Formulario
  const [formData, setFormData] = useState({
    cliente: '', telefono: '', placa: '', modelo: '', servicio: '', mecanico: '', observaciones: ''
  });
  
  // Estados de Carga y Datos de Firebase
  const [servicios, setServicios] = useState<any[]>([]);
  const [mecanicos, setMecanicos] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fotosUrls, setFotosUrls] = useState<string[]>([]);
  const [status, setStatus] = useState<{ type: 'error' | 'success' | null, msg: string }>({ type: null, msg: '' });

  // Cargar datos iniciales de Admin
  useEffect(() => {
    const cargarDatos = async () => {
      const servSnap = await getDocs(collection(db, 'servicios'));
      const mecSnap = await getDocs(collection(db, 'mecanicos'));
      setServicios(servSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setMecanicos(mecSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    cargarDatos();
  }, []);

  // Lógica de borrado de foto
  const eliminarFoto = (index: number) => {
    setFotosUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Lógica de Compresión y Subida
  const manejarSeleccionImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const archivos = Array.from(e.target.files);
    
    setIsUploading(true);
    const nuevasUrls: string[] = [];

    const opcionesCompresion = {
      maxSizeMB: 0.8, // Máximo 800KB para ahorrar espacio
      maxWidthOrHeight: 1280,
      useWebWorker: true
    };

    try {
      for (const archivo of archivos) {
        // 1. Comprimir
        const archivoComprimido = await imageCompression(archivo, opcionesCompresion);
        
        // 2. Subir a Storage
        const storageRef = ref(storage, `taller-rubi/placas/${formData.placa || 'sin-placa'}/${Date.now()}-${archivo.name}`);
        const uploadTask = uploadBytesResumable(storageRef, archivoComprimido);

        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
            (error) => reject(error),
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              nuevasUrls.push(url);
              resolve(true);
            }
          );
        });
      }
      setFotosUrls([...fotosUrls, ...nuevasUrls]);
      setStatus({ type: 'success', msg: 'Fotos optimizadas y listas' });
    } catch (error) {
      setStatus({ type: 'error', msg: 'Error al procesar imágenes' });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const enviarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente || !formData.placa || !formData.servicio) {
      setStatus({ type: 'error', msg: 'Por favor completa los campos obligatorios' });
      return;
    }

    try {
      // Guardar en Firestore
      await addDoc(collection(db, 'registros'), {
        ...formData,
        fotos: fotosUrls,
        fecha: new Date().toISOString(),
        estado: 'ingresado'
      });

      // Generar link de WhatsApp
      const mensaje = `*Taller-Rubi: Ingreso Confirmado*%0A%0AHola ${formData.cliente}, hemos recibido tu ${formData.modelo} (Placa: ${formData.placa}) para el servicio de *${formData.servicio}*.%0AMecánico asignado: ${formData.mecanico}.`;
      window.open(`https://wa.me/${formData.telefono.replace(/\D/g, '')}?text=${mensaje}`, '_blank');

      setStatus({ type: 'success', msg: '¡Vehículo registrado con éxito!' });
    } catch (error) {
      setStatus({ type: 'error', msg: 'Error al guardar en la base de datos' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-xl rounded-2xl border-t-8 border-[#9b111e]">
      <div className="flex items-center gap-3 mb-8">
        <Car className="text-[#9b111e]" size={32} />
        <h1 className="text-2xl font-bold text-gray-800">Recepción Taller-Rubi</h1>
      </div>

      {status.msg && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {status.msg}
        </div>
      )}

      <form onSubmit={enviarRegistro} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datos del Cliente */}
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              required className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-[#9b111e] outline-none"
              placeholder="Nombre del Cliente"
              onChange={(e) => setFormData({...formData, cliente: e.target.value})}
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              required className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-[#9b111e] outline-none"
              placeholder="WhatsApp (ej. 521...)"
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
            />
          </div>
          <div className="flex gap-2">
            <input 
              required className="w-1/2 p-2 border rounded-lg uppercase"
              placeholder="Placa"
              onChange={(e) => setFormData({...formData, placa: e.target.value.toUpperCase()})}
            />
            <input 
              className="w-1/2 p-2 border rounded-lg"
              placeholder="Modelo/Marca"
              onChange={(e) => setFormData({...formData, modelo: e.target.value})}
            />
          </div>
        </div>

        {/* Asignación y Fotos */}
        <div className="space-y-4">
          <select 
            required className="w-full p-2 border rounded-lg bg-gray-50"
            onChange={(e) => setFormData({...formData, servicio: e.target.value})}
          >
            <option value="">Seleccionar Servicio...</option>
            {servicios.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
          </select>

          <select 
            className="w-full p-2 border rounded-lg bg-gray-50"
            onChange={(e) => setFormData({...formData, mecanico: e.target.value})}
          >
            <option value="">Asignar Mecánico...</option>
            {mecanicos.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
          </select>

          <GaleriaFotos 
            imagenes={fotosUrls} 
            onFileSelect={manejarSeleccionImagen} 
            isUploading={isUploading}
            progress={uploadProgress}
            onDelete={eliminarFoto}
          />
        </div>

        <div className="md:col-span-2">
          <textarea 
            className="w-full p-3 border rounded-lg h-24"
            placeholder="Observaciones iniciales del vehículo..."
            onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
          />
        </div>

        <button 
          type="submit"
          disabled={isUploading}
          className={`md:col-span-2 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 
            ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#9b111e] hover:bg-[#7a0d18] shadow-lg hover:shadow-red-200'}`}
        >
          <Send size={20} /> Registrar Entrada y Notificar Cliente
        </button>
      </form>
    </div>
  );
}
