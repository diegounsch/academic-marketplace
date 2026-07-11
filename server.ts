/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables in development
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google Gen AI client server-side only
const geminiApiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI capabilities will be simulated.");
}

// ==========================================
// API ROUTES FIRST
// ==========================================

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiConfigured: !!ai });
});

// AI Valuador de Artículos Académicos (Textbooks & notes pricing evaluation)
app.post("/api/gemini/evaluate", async (req, res) => {
  try {
    const { title, category, condition, description } = req.body;

    if (!title || !category || !condition) {
      return res.status(400).json({ error: "Faltan campos requeridos (título, categoría, estado)." });
    }

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is missing
      const mockPrices: Record<string, number> = {
        "Libros de Texto": 35.0,
        "Apuntes y Guías": 12.0,
        "Tecnología y Electrónica": 60.0,
        "Material de Laboratorio y Estudio": 20.0,
        "Tutorías y Asesorías": 15.0,
      };
      const basePrice = mockPrices[category] || 25.0;
      const conditionMultiplier = condition === "Nuevo" ? 1.2 : condition === "Como Nuevo" ? 1.0 : condition === "Buen Estado" ? 0.8 : 0.5;
      const calculatedPrice = Math.round(basePrice * conditionMultiplier);

      return res.json({
        recommendedPrice: calculatedPrice,
        demandLevel: "Media",
        demandReason: "Demanda regular basada en los semestres introductorios.",
        courseCodes: ["GEN-101", "EST-201"],
        optimizedDescription: `${title} en estado ${condition}. Ideal para complementar las clases y preparar tus exámenes. ¡Aprovecha este precio estudiantil!`,
        tagSuggestions: [category, condition, "Estudio", "Ahorro"],
        isSimulated: true,
      });
    }

    const systemPrompt = `Eres un Tasador Experto para un Mercado Universitario Académico llamado "Academic Marketplace". 
Tu tarea es evaluar un artículo académico de un estudiante (libro, apuntes, calculadora, etc.) y proponer un precio sugerido de venta justo, una descripción optimizada para convencer a otros estudiantes, el nivel de demanda estimado y tags sugeridos.
Debes responder ESTRICTAMENTE en formato JSON plano sin bloques markdown. El JSON debe tener exactamente esta estructura:
{
  "recommendedPrice": un número decimal o entero en dólares,
  "demandLevel": "Alta" | "Media" | "Baja",
  "demandReason": "Breve explicación de por qué este artículo tiene este nivel de demanda (1 oración)",
  "courseCodes": ["ejemplo: MAT-101", "ejemplo: MAT-201"],
  "optimizedDescription": "Una descripción pulida y comercial adaptada a estudiantes universitarios, resaltando su utilidad académica, ahorro y beneficios.",
  "tagSuggestions": ["lista de hasta 4 palabras clave o tags cortos"]
}`;

    const userPrompt = `Evalúa el siguiente artículo:
- Título: "${title}"
- Categoría: "${category}"
- Estado físico: "${condition}"
- Detalles adicionales del usuario: "${description || "Ninguno"}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const responseText = response.text || "{}";
    try {
      const parsedData = JSON.parse(responseText.trim());
      return res.json(parsedData);
    } catch (parseError) {
      console.error("Error parsing Gemini JSON:", responseText, parseError);
      return res.status(500).json({ error: "La respuesta de la IA no pudo ser procesada como JSON." });
    }
  } catch (err: any) {
    console.error("Error calling evaluate API:", err);
    res.status(500).json({ error: err.message || "Error interno del servidor en la tasación de la IA." });
  }
});

// AI Negotiation Live Chat with Simulated Sellers
app.post("/api/gemini/negotiate", async (req, res) => {
  try {
    const { messages, productTitle, productPrice, productCondition, sellerPersona } = req.body;

    if (!messages || !productTitle || !productPrice || !sellerPersona) {
      return res.status(400).json({ error: "Faltan campos de negociación necesarios." });
    }

    if (!ai) {
      // Fallback simple negotiation logic
      const lastMsg = messages[messages.length - 1]?.text || "";
      const priceOfferMatch = lastMsg.match(/\$?(\d+)/);
      const offerPrice = priceOfferMatch ? parseInt(priceOfferMatch[1], 10) : null;

      let reply = "¡Hola! Gracias por tu interés. El precio actual está bastante bien, pero dime, ¿cuál es tu propuesta?";
      let isAccepted = false;
      let agreedPrice = null;

      if (offerPrice) {
        const discountPercentage = ((productPrice - offerPrice) / productPrice) * 100;
        if (discountPercentage <= 0) {
          reply = "¡Excelente! Acepto tu oferta. Quedamos en ese precio.";
          isAccepted = true;
          agreedPrice = offerPrice;
        } else if (discountPercentage <= 20) {
          reply = `Está bien, entiendo tu situación. Cerremos el trato en $${offerPrice}. ¿Te parece bien si nos vemos en la biblioteca?`;
          isAccepted = true;
          agreedPrice = offerPrice;
        } else {
          const counterOffer = Math.round(productPrice * 0.9);
          reply = `Uff, $${offerPrice} es muy poco, me costó mucho conseguirlo. ¿Qué te parece si lo dejamos en $${counterOffer}? Es un término medio excelente.`;
        }
      }

      return res.json({
        reply,
        isAccepted,
        agreedPrice,
        isSimulated: true,
      });
    }

    const systemPrompt = `Eres un estudiante o profesor de universidad que vende un artículo en "Academic Marketplace". 
Debes chatear con el comprador simulando ser el personaje descrito en el siguiente perfil de vendedor:
--------------------------------------
PERFIL DEL VENDEDOR:
${sellerPersona}
--------------------------------------

INFORMACIÓN DEL ARTÍCULO QUE VENDES:
- Título: "${productTitle}"
- Precio original publicado: $${productPrice}
- Estado del producto: "${productCondition}"

REGLAS DE NEGOCIACIÓN:
1. Responde de manera sumamente natural, breve y convincente. Habla en español de Latinoamérica o España, con el tono estudiantil o formal que le corresponda a tu personaje.
2. Si la oferta del comprador es razonable según tus límites de descuento definidos en tu perfil, o si te convence con buenos argumentos emocionales/académicos, acepta la oferta y cierra el trato.
3. Si el comprador ofrece un precio aceptable o si tú decides aceptar su propuesta, debes establecer "isAccepted" como true y fijar "agreedPrice" con el número del precio acordado.
4. Si la propuesta aún es muy baja, propón un contraprecio razonable o niégate con humor o formalidad según tu personaje.
5. Devuelve la respuesta ESTRICTAMENTE en formato JSON plano con la siguiente estructura:
{
  "reply": "Tu mensaje de chat dirigido al estudiante comprador",
  "isAccepted": true o false (debe ser true SOLO si en este mensaje aceptas cerrar el trato por un precio final),
  "agreedPrice": el precio final acordado en dólares (un número entero o decimal, o null si todavía se sigue negociando)
}`;

    // Format chat history for context
    const conversationContext = messages.map((m: any) => {
      const senderName = m.sender === "user" ? "Comprador (Estudiante)" : "Tú (Vendedor)";
      return `${senderName}: ${m.text}`;
    }).join("\n");

    const userPrompt = `Historial actual de conversación:
${conversationContext}

Responde al comprador como tu personaje. Si el último mensaje es una oferta de precio, evalúala cuidadosamente de acuerdo con tus límites. Genera tu respuesta en formato JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const responseText = response.text || "{}";
    try {
      const parsedData = JSON.parse(responseText.trim());
      return res.json(parsedData);
    } catch (parseError) {
      console.error("Error parsing negotiation response:", responseText, parseError);
      return res.status(500).json({ error: "La IA generó una respuesta que no es JSON válido." });
    }
  } catch (err: any) {
    console.error("Error calling negotiate API:", err);
    res.status(500).json({ error: err.message || "Error interno del chat de negociación." });
  }
});


// ==========================================
// VITE OR STATIC SERVING MIDDLEWARE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Iniciando Vite en modo middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Iniciando en modo producción (sirviendo dist)...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor de Academic Marketplace ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fallo al iniciar el servidor:", err);
});
