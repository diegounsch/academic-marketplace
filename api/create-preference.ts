import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(req: any, res: any) {
  // Solo permitimos que nuestra página le envíe datos
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // 1. Inicializa Mercado Pago con la clave secreta de Vercel
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN as string });
    
    // Desestructuramos los datos. Agregamos soporte para 'items' (array) y 'metadata'
    const { title, price, quantity, items, metadata } = req.body;

    // 2. DETECCIÓN DINÁMICA DE URL (Evita configurar localhost vs Vercel a mano)
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Configuración por defecto para compras normales de la tienda
    let successUrl = `${baseUrl}/exito`;
    let failureUrl = `${baseUrl}/fallo`;
    let pendingUrl = `${baseUrl}/pendiente`;

    // Si la metadata nos dice que es una recarga, cambiamos el destino al panel de Perfil/Monedero
    if (metadata && metadata.tipo_operacion === 'recarga_monedero') {
      successUrl = `${baseUrl}/perfil?status=success_recarga`; 
      failureUrl = `${baseUrl}/perfil?status=error_recarga`;
      pendingUrl = `${baseUrl}/perfil?status=pending_recarga`;
    }

    // 3. Flexibilidad de Items (Acepta el formato anterior o listas completas de productos)
    const preferenceItems = items || [
      {
        title: title || "Recarga de Saldo iPay",
        quantity: Number(quantity) || 1,
        unit_price: Number(price),
        currency_id: 'PEN', // Soles Peruanos
      }
    ];

    // 4. Crea la preferencia en Mercado Pago
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: preferenceItems,
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl,
        },
        auto_return: "approved",
        // GUARDAMOS LA METADATA: Mercado Pago guardará estos datos invisibles dentro de la transacción
        metadata: metadata || {}, 
      }
    });

    // 5. Devuelve tanto el ID como el enlace directo (init_point) por si el frontend lo necesita
    res.status(200).json({ 
      id: result.id,
      init_point: result.init_point 
    });
    
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    res.status(500).json({ error: 'Error al generar el cobro' });
  }
}
