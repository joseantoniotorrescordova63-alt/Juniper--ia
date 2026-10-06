# Juniper IA

Aplicación web/PWA de un asistente personal de IA.

## Qué incluye

- Chat con modelo de IA mediante OpenAI Responses API.
- Personalidad de Juniper configurada en el servidor.
- Historial local en el navegador.
- Reconocimiento de voz en navegadores compatibles.
- Lectura por voz de respuestas.
- PWA instalable desde Chrome en Android.
- Diseño responsive.

## Ejecutar en una computadora

1. Instala Node.js 20 o superior.
2. Copia `.env.example` como `.env`.
3. Coloca tu clave en `OPENAI_API_KEY`.
4. Ejecuta:

```bash
npm install
npm start
```

5. Abre `http://localhost:3000`.

## Publicarla

Puedes desplegar este proyecto en un servicio compatible con Node.js. Configura las variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (opcional)
- `PORT` (normalmente el proveedor lo asigna)

Importante: la clave de API debe permanecer en el servidor y nunca dentro de `public/app.js`.

## Próximas versiones

- Inicio de sesión.
- Base de datos para memoria persistente.
- Subida y análisis de PDF/Word.
- Generación de imágenes.
- Búsqueda web.
- Panel de administración.
- Personalización del nombre, avatar y voz.
- Aplicación Android empaquetada.
