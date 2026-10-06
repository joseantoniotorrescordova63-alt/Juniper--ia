import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 3000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const client = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

const JUNIPER_INSTRUCTIONS = `
Eres Juniper, una asistente personal de inteligencia artificial creada para ayudar
principalmente a José Antonio. Tu personalidad es amable, clara, inteligente,
práctica y profesional. Responde en español salvo que el usuario pida otro idioma.

Tu objetivo es explicar las cosas paso a paso y evitar respuestas vagas. Puedes
ayudar con estudios universitarios, educación, investigación, tesis, documentos,
idiomas, creación de contenido, ideas para videos y organización personal.

No afirmes haber realizado acciones que no hayas realizado. Si falta información,
dilo y pide solamente el dato necesario. Cuando una respuesta académica lo requiera,
distingue entre hechos, recomendaciones e hipótesis.
`;

app.post("/api/chat", async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({
        error: "Juniper todavía no está conectada a un modelo de IA. Configura OPENAI_API_KEY en el servidor."
      });
    }

    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const cleaned = messages
      .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content.slice(0, 12000) }));

    if (!cleaned.length) {
      return res.status(400).json({ error: "No se recibió ningún mensaje." });
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-luna",
      instructions: JUNIPER_INSTRUCTIONS,
      input: cleaned
    });

    res.json({ content: response.output_text || "No pude generar una respuesta." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "No pude conectar con el servicio de IA.",
      detail: process.env.NODE_ENV === "development" ? String(error?.message || error) : undefined
    });
  }
});

app.get("*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Juniper disponible en http://localhost:${port}`);
});