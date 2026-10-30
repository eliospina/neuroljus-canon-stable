# Calidad de la Línea: cómo se sabe que es buena

## El problema

La Línea es abierta y anónima: cualquiera puede llamar y no guardamos quién llama ni qué dice. Eso crea una paradoja si la describimos por su estado de un día. «No se ha probado con personas» deja de ser verdad la primera vez que alguien llama, y nunca sabríamos cuándo pasó. «Nadie sabe cuántos la usan» tampoco es exacto: contamos las llamadas, solo que no sabemos quién las hace.

La salida es describir **cómo funciona**, no un estado que caduca, y separar dos públicos:

- **Quien llama** quiere una respuesta para la persona que tiene delante. La Línea no habla de sí misma salvo que se lo pregunten; entonces lo dice en una o dos frases y vuelve a la persona (`brain.ts`, «IF ASKED ABOUT NEUROLJUS ITSELF»).
- **El proyecto** sí necesita saber cuántas llamadas llegan, qué hizo falta y qué le faltó a la Línea. Eso se mide sin identificar a nadie.

## Qué es formal y qué no

- **Formal:** los más de 1.700 estudios de la biblioteca. Son investigación publicada sobre autismo, verificada por código: el DOI resuelve, acceso abierto, sin retractación, indexada en Europe PMC o PubMed (`docs/library/SOURCES.md`).
- **No es un estudio:** las fichas prácticas. Son resúmenes de esos estudios escritos por Claude.
- **Todavía no existe:** un estudio formal de la propia Línea, que mida si ayuda a quien llama.

La frase pública: *se apoya en más de 1.700 estudios publicados; aún no existe un estudio formal de la propia línea.*

## Tres niveles

### 1. Estándares, sin personas reales (ahora)

Como un control de calidad: la Línea se prueba con llamadas simuladas antes de cambiar.

- `npm run line:eval -- --claude --judge`: 42 llamadas de crisis simuladas, y un segundo modelo juzga cada una contra lo que una buena llamada hace (`must`). Último resultado: 38 de 42 (`eval-2026-10-20.md`).
- **Regla:** todo cambio del prompt o del cerebro pasa el juez antes de fusionarse, y el resultado va en el PR.
- **Revisión humana:** `npm run line:eval -- --claude --judge --review revision.md` escribe cada llamada en una hoja legible, con la escena, lo que una buena llamada hace, la llamada completa, la nota del juez automático y espacios para la nota humana. Se la das a tres personas: un clínico, un cuidador con experiencia y una persona autista. Cada una puntúa de 1 a 10, marca lo peligroso o equivocado y escribe qué habría dicho. Lo que marquen se convierte en cambios del prompt o de los protocolos y en nuevos escenarios.

### 2. Señales anónimas de la vida real (pronto)

- **Conteo:** ElevenLabs guarda los metadatos de cada llamada (fecha, duración, idioma, origen), sin transcripción. Con eso sabemos cuántas llamadas hay y cuántas son conversaciones de verdad. A 30 de octubre de 2026: 24 conexiones, 7 conversaciones de 3 a 10 minutos (del 19 al 21 de octubre, casi todas pruebas de la dueña), 4 fallos del override de idioma ya corregido, y 13 aperturas de 10 segundos o menos.
- **Necesidades:** `npm run line:needs` ya convierte las etiquetas anónimas de cada turno en un informe de qué hizo falta y qué le faltó a la Línea.
- **Una pregunta al final:** «¿Te ayudó esta llamada?», con la valoración de ElevenLabs. Anónima.

### 3. Estudio formal (más adelante)

Con personas que aceptan participar, separado de la Línea abierta: familias que firman un consentimiento, usan la Línea unas semanas y responden un cuestionario antes y después. Con una universidad y, en Suecia, con aprobación de la Etikprövningsmyndigheten. Llevaría su propia política de privacidad, retención y revisión de riesgos, como dice `/privacy`. Tiene sentido cuando haya llamadas reales o financiación.
