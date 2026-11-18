import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const SYSTEM_INSTRUCTION = `# NOMBRE DEL ASISTENTE: PlanetaBot - Asistente de Reclutamiento Elite

## ROL Y OBJETIVO
Eres el Asistente Virtual Estratégico de Reclutamiento para Agencia Planeta. Tu objetivo es ayudar a nuestro equipo de reclutadores a responder objeciones y dudas de creadores de contenido de forma instantánea, empática, persuasiva y transparente.
Tu meta es transmitir confianza, eliminar el miedo del creador y cerrar su registro en la agencia.

## BASE DE CONOCIMIENTO CENTRAL (POLÍTICAS DE AGENCIA PLANETA)
Utiliza SIEMPRE estas políticas como la verdad absoluta y nunca inventes porcentajes ni condiciones fuera de ellas:

1. GANANCIAS Y COMISIONES (Cero cobros al creador):
   - Agencia Planeta NO le quita ningún porcentaje de sus diamantes, regalos o ganancias al creador. El 100% de lo que genera el creador es suyo.
   - A la agencia le paga directamente la plataforma (ej. TikTok) por bonos de rendimiento y metas alcanzadas como equipo. Unirse a la agencia es 100% GRATIS.

2. HORARIOS Y LIBERTAD:
   - NO hay horarios obligatorios ni jefes. El creador maneja su tiempo con total libertad.
   - Se recomienda constancia (mínimo 10-15 horas al mes para ver resultados), pero la decisión final es siempre del creador.

3. PROPIEDAD DE LA CUENTA:
   - La cuenta es 100% del creador. La agencia NUNCA pide contraseñas, accesos privados ni se adueña del perfil.
   - Si el creador decide irse en el futuro, conserva su cuenta sin penalizaciones.

4. BENEFICIOS DE AGENCIA PLANETA:
   - Soporte Técnico 24/7: Ayuda con baneos injustos, sombras (shadowban) o problemas de cobro.
   - Academia y Capacitación: Asesoría personalizada para mejorar iluminación, contenido y retención de audiencias.
   - Eventos y Retos de Graduación: Acceso a batallas oficiales, eventos globales de la plataforma y bonos extra de dinero/tráfico por cumplir retos internos de la agencia.

## REGLAS ESTRICTAS DE SALIDA
1. detectedObjection: Resumen exacto de la duda del creador en máximo 3 palabras claras en español (ej. "Desconfianza por comisiones", "Miedo a horarios", "Control de cuenta").
2. policyPillar: Clasifica en una de estas opciones exactas: "Ganancias y Comisiones", "Horarios y Libertad", "Propiedad de la Cuenta", "Beneficios y Soporte", "Consulta General".
3. textMessage (Opción 1 - Mensaje de Texto Corto para WhatsApp / Instagram DM / TikTok):
   - Máximo 3 o 4 párrafos muy breves separados por doble salto de línea.
   - Tuteo respetuoso, lenguaje directo, cercano, profesional y entusiasta.
   - Incluye emoticonos estratégicos (3 a 5 en todo el mensaje) para que se sienta humano, nunca robótico.
   - Aplica obligatoriamente esta secuencia: Empatía (validar la duda) + Verdad/Aclaración según Agencia Planeta + Beneficio concreto de la agencia + Pregunta de cierre para continuar la conversación.
   - No incluyas comillas envolventes ni encabezados dentro de textMessage.
4. voiceScript (Opción 2 - Guion para Nota de Voz de WhatsApp):
   - Texto súper natural y conversacional, redactado exactamente como se habla en la vida real (con pausas naturales "..." y conectores humanos como "mira", "o sea", "te cuento", "quédate tranquilo/a").
   - Diseñado para leerse en voz alta en 20 a 30 segundos (entre 55 y 85 palabras).
   - No incluyas acotaciones entre corchetes ni comillas envolventes.
5. recruiterTip: Un consejo estratégico de 1 sola línea (máximo 25 palabras) sobre cómo continuar el seguimiento o qué enviar después.`;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_GEMINI_API_KEY");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

interface GenerateRequestBody {
  objection?: string;
  creatorName?: string;
  channel?: string;
  refinement?: string;
  previousResponse?: {
    detectedObjection: string;
    textMessage: string;
    voiceScript: string;
    recruiterTip: string;
  };
}

async function generateWithRetry(prompt: string) {
  const ai = getAiClient();
  const maxAttempts = 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedObjection: {
                type: Type.STRING,
                description: "Resumen de la duda del creador en 3 palabras.",
              },
              policyPillar: {
                type: Type.STRING,
                description:
                  "Pilar principal de Agencia Planeta: Ganancias y Comisiones, Horarios y Libertad, Propiedad de la Cuenta, Beneficios y Soporte, o Consulta General.",
              },
              textMessage: {
                type: Type.STRING,
                description:
                  "Opción 1: Mensaje de texto corto listo para copiar y pegar (3-4 párrafos breves con emojis estratégicos).",
              },
              voiceScript: {
                type: Type.STRING,
                description:
                  "Opción 2: Guion conversacional natural para audio de WhatsApp de 20 a 30 segundos.",
              },
              recruiterTip: {
                type: Type.STRING,
                description:
                  "Consejo estratégico de 1 línea para que el reclutador continúe el seguimiento.",
              },
            },
            required: [
              "detectedObjection",
              "policyPillar",
              "textMessage",
              "voiceScript",
              "recruiterTip",
            ],
          },
        },
      });

      const raw = (response.text ?? "").trim();
      if (!raw) {
        throw new Error("La respuesta del modelo llegó vacía.");
      }

      const parsed = JSON.parse(raw);
      return parsed;
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg === "MISSING_GEMINI_API_KEY" ||
        msg.includes("403") ||
        msg.includes("400") ||
        msg.includes("API_KEY_INVALID") ||
        msg.includes("PERMISSION_DENIED")
      ) {
        throw err;
      }
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
      }
    }
  }

  throw lastError;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/objections/generate", async (req, res) => {
    try {
      const body = (req.body ?? {}) as GenerateRequestBody;
      const objection = typeof body.objection === "string" ? body.objection.trim() : "";

      if (!objection) {
        res.status(400).json({
          error: "Por favor escribe o pega la objeción o duda del creador.",
        });
        return;
      }

      const channel = body.channel?.trim() || "WhatsApp";
      const creatorName = body.creatorName?.trim();
      const refinement = body.refinement?.trim();

      const promptLines = [
        `Canal de conversación: ${channel}.`,
        creatorName
          ? `Nombre o usuario del creador (úsalo de forma natural si encaja): ${creatorName}.`
          : "No se proporcionó nombre del creador; usa un saludo cercano sin inventar un nombre.",
        `Mensaje o objeción del creador:\n"""\n${objection}\n"""`,
      ];

      if (refinement && body.previousResponse) {
        promptLines.push(
          `\nRespuesta anterior generada:\n- Texto: ${body.previousResponse.textMessage}\n- Audio: ${body.previousResponse.voiceScript}`,
          `\nInstrucción de ajuste solicitada por el reclutador: ${refinement}. Mantén intactas las políticas de Agencia Planeta y mejora ambas opciones aplicando este ajuste.`
        );
      }

      const result = await generateWithRetry(promptLines.join("\n"));
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[PlanetaBot API Error]", message);

      if (message === "MISSING_GEMINI_API_KEY") {
        res.status(503).json({
          error:
            "Falta configurar GEMINI_API_KEY en los secretos del entorno para conectar con el asistente.",
        });
        return;
      }

      if (
        message.includes("PERMISSION_DENIED") ||
        message.includes("API_KEY_INVALID") ||
        message.includes("403")
      ) {
        res.status(403).json({
          error:
            "La clave de Gemini API no es válida o no tiene permisos. Verifica la configuración en Settings > Secrets.",
        });
        return;
      }

      if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
        res.status(429).json({
          error:
            "Se alcanzó el límite temporal de solicitudes de la API. Espera unos segundos e intenta de nuevo.",
        });
        return;
      }

      res.status(500).json({
        error:
          "No se pudo generar la respuesta en este momento. Intenta nuevamente en unos segundos.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PlanetaBot server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start PlanetaBot server:", err);
  process.exit(1);
});
