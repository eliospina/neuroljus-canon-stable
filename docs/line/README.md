# La línea de voz

La voz vive en ElevenLabs Agents (agente `agent_8701m5aah553evdr2vkbaqp4rctq`). Desde la fase 4, **el razonamiento vive aquí**: ElevenLabs hace voz a texto y texto a voz, y en cada turno llama a nuestro **cerebro** (`/api/line/brain`) como Custom LLM. No hay herramientas webhook: el cerebro tiene dentro los protocolos, la biblioteca y la web. No hay voz en este repo.

## El cerebro (Custom LLM)

| Qué | Dónde |
| --- | --- |
| Endpoint | `POST /api/line/brain/chat/completions` (también `/api/line/brain` y `/api/line/brain/v1/chat/completions`). Formato OpenAI Chat Completions, respuesta SSE `chat.completion.chunk` terminada en `data: [DONE]`. |
| Keep-warm | `GET /api/line/brain` con el secreto (o `Authorization: Bearer $CRON_SECRET`) responde `{ok, warm}` y mantiene el índice en memoria. |
| Código | `src/lib/line/brain.ts` (prompt, Claude, respaldo), `state.ts` (hechos derivados del historial), `triage.ts` (señales graves, solo informan), `guard.ts` (frases para la voz), `retrieval.ts` (BM25 precargado, presupuesto 800 ms), `resources.ts` (líneas por país), `brainHttp.ts` (auth, SSE). |

### El principio: el modelo decide, el código garantiza

La primera llamada real lo dejó claro: una persona describió a su hijo tirándose a un lago y la línea respondió «apaga la música y las luces». No fue el modelo: fue la caja que lo rodeaba. Una lista de palabras había elegido el protocolo de sobrecarga en el turno anterior, un cronómetro apagó al modelo, y un texto de respaldo recitó el siguiente paso del protocolo sin leer el turno. Parchar palabra por palabra no termina nunca, porque la vida está llena de improvisaciones: un niño echándose gasolina junto a una estufa necesita «agárralo y sácalo de ahí», aunque el protocolo diga «no sujetar».

Por eso el cerebro ya no obedece protocolos. Los **lee como conocimiento**: los 10 protocolos completos van en el prompt como el mejor punto de partida para las crisis comunes, piso y no techo, con permiso explícito para romper cualquiera de sus «nunca» cuando un riesgo mayor lo exige. El principio por encima de todo, en el prompt: *la seguridad física inmediata de la persona gana a cualquier regla*. Medicamentos, salud y diagnóstico: preferible que lo decida su médico, y el modelo lo dice una vez; pero nunca prohibido, porque no todo el mundo puede ir al médico y una respuesta clara puede ser lo que mantiene a alguien a salvo. El modelo responde con lo que sabe, dice lo que no sabe, y usa la biblioteca y la web.

### Qué recibe el modelo en cada turno

1. **Bloque estático, cacheado por Anthropic** (unos 23 000 tokens, idéntico para cada idioma): el principio, cómo hablar por teléfono, y **los 10 protocolos completos** como conocimiento.
2. **Hechos derivados del transcript por código** (`state.ts`): idioma, país y **su número de emergencias**, quién parece llamar (cuidador o persona autista), si acaba de preguntar a quién llamar, señales graves que el código encontró (como información, para pesar), **documentos de la biblioteca** para este turno (BM25, en cada turno), fuente web del turno anterior, recursos del país al cierre. Nada de protocolo elegido, fase ni «pasos ya dados»: eso lo decide el modelo leyendo la conversación.
3. El historial de la llamada, tal como lo manda ElevenLabs.

No hay estado en el servidor: el mismo historial produce siempre los mismos hechos.

### Qué garantiza el código (lo que no admite criterio)

- **«¿A quién llamo?»**: si la persona pregunta a quién llamar o qué número, la primera frase es el número del país, antes de que el modelo hable (`asksWhomToCall`, `codeFirstSentence`). El número sigue al **último** país nombrado (Colombia → «no, estoy en el Perú» → 106). Si el país no se sabe, la primera frase es «¿En qué país estás? Así te doy el número exacto».
- **Reintento y respaldo honesto**: si Claude tarda más de 6 s en empezar o falla, se intenta una segunda vez (5 s de presupuesto); no se reintenta un rechazo ni una llamada que ya empezó a hablar. Si la segunda también falla, la línea dice una sola frase: «Te escucho. Dime dónde está ahora y qué está pasando». Nunca un paso de protocolo elegido a ciegas. Cada respaldo se registra (`event: line_fallback`, con motivo y tiempo; nunca lo que dijo quien llama) para saber cuántas veces el modelo no llega.
- **Voz limpia**: markdown, corchetes de cita, etiquetas `[slow]` y razonamiento filtrado se quitan antes de hablar. No se borra ninguna frase.
- **Búsqueda web** en segundo plano cuando la biblioteca no tiene nada **o la pregunta es de medicamentos o salud**, sin bloqueo por riesgo (modo `open` de `search.ts`); la fuente llega en el turno siguiente.
- **Registro de necesidades** (`needs.ts`): después de cada turno, cuando la voz ya tiene su respuesta, un modelo pequeño (Haiku, `LINE_NEEDS_MODEL`) lee el turno y registra **solo etiquetas**: temas que la persona necesitó, de dónde salió la respuesta (biblioteca, protocolo, memoria del modelo, web), qué documentos de la biblioteca se ofrecieron y cuáles se usaron, y qué conocimiento le faltó al modelo. Nunca palabras de la llamada, nombres ni cifras (`event: line_needs`). `npm run line:needs -- <exportación de logs de Vercel>` convierte esas líneas en un informe: temas más frecuentes, cuánto aporta la biblioteca, y la lista de saberes que faltan, que es el plan para ampliar biblioteca y protocolos. `LINE_NEEDS_LOG=0` lo apaga. Medio centavo por turno.
- **Casos fuera de los 10** (por palabras clave, solo para el registro): `event: line_uncovered` (idioma, turno, documentos; nunca lo que dijo quien llama), para que biblioteca y protocolos crezcan donde la gente llama. `LINE_LOG_UNCOVERED=0` lo apaga.

Lo que ya no existe en código: protocolo pegajoso, fase, pasos ya dados, pregunta de triaje obligatoria, tope de frases, filtro de relleno, de repetición, de medicación, de diagnóstico, de palabras de emergencia. Todo eso es criterio del modelo, y se evalúa con llamadas reales y con el juez.

### Números verificados (2026-10-20)

Todos los números de `emergency.ts` y `resources.ts` se contrastaron con la página oficial que cada entrada nombra en `verify`. Cambios tras la verificación: la línea de ayuda de la National Autistic Society (0808 800 4104) cerró en 2021 y se quitó el número; la Línea 192 de Colombia no aparece ya en el directorio de MinSalud de 2025 y se retiró, y la 106 pasó a nacional; se añadieron LICA (601 357 5260) y el Centro Autismo Teletón (55 5699 2122, lunes a sábado); la 113 de Perú se nombra sin opción de menú porque el menú ha cambiado. Volver a verificar una vez al año.

### Latencia (medida)

| Pieza | Medido |
| --- | --- |
| Cargar `docs.json` + `index.json` (11 MB) | 1,2 s, solo en arranque en frío |
| Construir el índice BM25 | 213 ms, una vez por instancia (en el arranque del módulo, no en la petición) |
| Consulta BM25 en caliente | 3–6 ms (presupuesto 800 ms; si vence, se responde sin biblioteca) |
| Claude Sonnet 5.5, primer token, prompt cacheado, sin razonamiento | 0,97–1,17 s (1,75 s cuando escribe la caché) |
| **Primera frase hablada, en caliente, en proceso** | **1,2–2,2 s** (la frase debe terminar para pasar a la voz; por eso el prompt pide frases cortas) |

Desde ElevenLabs hay que sumar su salto de red a Vercel y la propia síntesis de voz. **Condiciones para acercarse a 1,5 s:** Fluid Compute activado en el proyecto de Vercel, región cercana a ElevenLabs y a Anthropic (`iad1`), y un keep-warm cada 5 minutos a `GET /api/line/brain`. El plan Hobby de Vercel solo admite crons diarios, así que el keep-warm va fuera: un pinger externo (por ejemplo cron-job.org) cada 5 minutos con la cabecera `x-line-secret`. Con plan Pro, añade a `vercel.json` `{"crons":[{"path":"/api/line/brain","schedule":"*/5 * * * *"}]}` y crea `CRON_SECRET`. En frío, la primera llamada tarda unos 3 s más. El registro `line_fallback` dice cuántas veces el modelo no llegó a tiempo; si pasa a menudo, la alternativa es un servicio siempre encendido (Fly.io o Railway) con el mismo código.

### Conectar ElevenLabs al cerebro

1. En el agente, **LLM → Custom LLM**. Server URL: `https://neuroljus.com/api/line/brain` (ElevenLabs añade `/chat/completions`; si tu versión pide la base con `/v1`, usa `https://neuroljus.com/api/line/brain/v1`). Model ID: cualquiera, por ejemplo `neuroljus-line`.
2. Clave: el valor de `LINE_API_SECRET`. El cerebro la acepta como `Authorization: Bearer` (lo que ElevenLabs manda como API key) y como cabecera `x-line-secret`.
3. Prompt del sistema del agente: corto, solo voz y turno (`agent-prompt.md`). El cerebro ignora el `system` que manda ElevenLabs.
4. El agente no lleva herramientas webhook: el cerebro ya tiene protocolos, biblioteca y web.
5. Variables en Vercel: `LINE_API_SECRET` y `ANTHROPIC_API_KEY`; opcionales `CRON_SECRET`, `LINE_BRAIN_RATE_LIMIT_PER_MIN` (240), `LINE_BRAIN_THINKING=adaptive` (razonamiento previo; más lento), `LINE_LOG_UNCOVERED=0`.
6. **Idioma desde la página (obligatorio):** en el agente, *Security → Overrides*, el idioma (`agent.language`) debe poder cambiarse desde el cliente. `/linea` pide `es`, `en` o `sv` según el idioma del sitio; si el override está apagado, ElevenLabs corta la llamada en el primer segundo con «Override for field 'language' is not allowed by config» en cualquier idioma que no sea el por defecto (español). Pasó el 2026-10-21 y se arregló activándolo; los saludos en inglés y sueco viven en `language_presets`.
7. Privacidad del agente (2026-10-21): `record_voice=false`, `delete_audio=true`, `delete_transcript_and_pii=true`, `retention_days=0`, aplicado a conversaciones existentes. La «retención cero» de ElevenLabs no se puede activar con un Custom LLM. Los términos del widget dicen que nada se guarda; el agente se llama «NeuroLjus Línea».

### Probar sin voz

Cómo se sabe que la Línea es buena siendo anónima (estándares, señales anónimas, estudio formal) y cómo usar la hoja de revisión humana (`--review`): `calidad.md`.

`npm run line:eval` corre `scripts/line-eval/scenarios.ts` contra el cerebro **con un modelo guionizado** (no razona; prueba la plomería) y verifica solo lo que el código garantiza: respuesta no vacía, voz limpia, el número o la pregunta del país primero cuando preguntan a quién llamar, sin fuentes inventadas, latencia de la primera frase, y que el respaldo nunca recite pasos. Corre en CI.

`npm run line:eval -- --live` con `LINE_BRAIN_URL` y `LINE_API_SECRET` corre las mismas conversaciones contra el cerebro desplegado con Claude; `--claude` corre el mismo cerebro en proceso con el Claude real (solo `ANTHROPIC_API_KEY`, sin despliegue ni secreto). **`--judge`** (con `--live` o `--claude`) (con `ANTHROPIC_API_KEY`) añade lo que importa: un segundo modelo lee cada llamada completa y la juzga como juzgaría a un colega, contra el `must` de cada escenario: ¿respondió a la escena real, con la seguridad por delante, rompiendo la regla cuando la vida lo pedía, dando el número cuando importaba? Los escenarios incluyen situaciones improvisadas donde regla y vida chocan: gasolina junto a la estufa, el lago con corriente, «¿a quién llamo?» sin país, una sobredosis de risperidona a tres horas del pueblo.

---

## Dominios permitidos en la búsqueda web

who.int, paho.org, nice.org.uk, cdc.gov, nih.gov, pubmed.ncbi.nlm.nih.gov, pmc.ncbi.nlm.nih.gov, europepmc.org, cochranelibrary.com, nhs.uk, autistica.org.uk, autism.org.uk, aacap.org, healthychildren.org, 1177.se, socialstyrelsen.se, sbu.se. La lista está en `ALLOWED_DOMAINS` (`src/lib/line/search.ts`) y los subdominios cuentan. Fuera a propósito: foros, redes, tiendas y organizaciones con enfoque de «cura».

## Variables de entorno en Vercel

| Variable | Obligatoria | Qué es |
| --- | --- | --- |
| `LINE_API_SECRET` | Sí | Secreto compartido. Genera uno largo (`openssl rand -hex 32`). El mismo valor va en ElevenLabs como secreto del workspace y se usa en la cabecera `x-line-secret`. Sin ella, los tres endpoints responden 503. |
| `ANTHROPIC_API_KEY` | Sí para `ask` con Claude y para `search` | Ya la usa Ask. Sin ella `ask` responde solo con la biblioteca y `search` devuelve `mode: "none"`. |
| `ANTHROPIC_MODEL` | No | Por defecto `claude-sonnet-5-5`. |
| `LINE_RATE_LIMIT_PER_MIN` | No | Peticiones por minuto a `protocol` (por defecto 60) y a `ask` (por defecto 30), contadas por endpoint. |
| `LINE_SEARCH_RATE_LIMIT_PER_MIN` | No | Peticiones por minuto a `search` (por defecto 10). |
| `LINE_UNAUTH_LIMIT_PER_MIN` | No | Intentos fallidos de secreto por minuto y endpoint antes de responder 429 (por defecto 20). Cuentan aparte, no gastan el cupo del agente. |

Además, la búsqueda web debe estar activada para la organización en la consola de Anthropic (Privacy / Web search).

## Privacidad y límites

- **ElevenLabs sí guarda por defecto.** Nuestros endpoints no guardan nada, pero ElevenLabs conserva por defecto el audio y la transcripción de cada llamada. Antes de que llame una familia real, desactiva esa retención en la configuración de privacidad del agente (retención de audio y de transcripciones). Comprueba después, con una llamada de prueba, que la conversación no queda en el historial del agente.
- Nada de la llamada se guarda ni se escribe en logs en neuroljus.com: los errores registran solo una etiqueta (`timeout`, `upstream`, código HTTP), nunca el texto. Respuestas con `Cache-Control: no-store`.
- El límite de peticiones es en memoria, por instancia serverless: frena abusos accidentales, no ataques. Para algo más fuerte, añade una regla en Vercel Firewall sobre `/api/line/*`.


