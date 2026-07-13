import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(req: any, res: any) {
  // Solo permitimos que nuestra página le envíe datos
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // 1. Inicializa Mercado Pago con la clave secreta de Vercel
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN as string });
    const { title, price, quantity } = req.body;

    // 2. Crea la preferencia (el carrito de compras seguro)
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            title: title,
            quantity: Number(quantity),
            unit_price: Number(price),
            currency_id: 'PEN', // Moneda: Soles Peruanos
          }
        ],
        // A dónde volverá el estudiante tras pagar (luego cambiaremos esto por tu URL real de Vercel)
        back_urls: {
          success: "https://tu-proyecto.vercel.app/exito", 
          failure: "https://tu-proyecto.vercel.app/fallo",
          pending: "https://tu-proyecto.vercel.app/pendiente",
        },
        auto_return: "approved",
      }
    });

    // 3. Devuelve el ID de la transacción a tu página web
    res.status(200).json({ id: result.id });
    
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    res.status(500).json({ error: 'Error al generar el cobro' });
  }
}
