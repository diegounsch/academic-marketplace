import { useState } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

// Inicializamos Mercado Pago con la llave PÚBLICA que guardaste en Vercel
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY);

export default function CheckoutButton({ bookTitle, bookPrice }) {
  const [preferenceId, setPreferenceId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      // 1. Llamamos a tu nuevo mini-servidor en Vercel
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: bookTitle,
          price: bookPrice,
          quantity: 1,
        }),
      });

      const data = await response.json();
      
      // 2. Si todo sale bien, guardamos el ID seguro que nos devolvió
      if (data.id) {
        setPreferenceId(data.id);
      }
    } catch (error) {
      console.error("Error al procesar el pago", error);
      alert("Hubo un error al conectar con la pasarela de pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Botón inicial que el usuario presiona para generar el cobro */}
      {!preferenceId && (
        <button 
          onClick={handleBuy} 
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {loading ? 'Preparando pago...' : `Pagar S/ ${bookPrice}`}
        </button>
      )}
      
      {/* Si ya tenemos el ID, mostramos la interfaz oficial de Mercado Pago */}
      {preferenceId && (
        <div className="w-full max-w-sm">
          <Wallet initialization={{ preferenceId: preferenceId }} />
        </div>
      )}
    </div>
  );
}
