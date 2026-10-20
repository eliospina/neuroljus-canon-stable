# La línea de voz

La voz vive en ElevenLabs Agents (agente `agent_8701m5aah553evdr2vkbaqp4rctq`). Desde la fase 4, **el razonamiento vive aquí**: ElevenLabs hace voz a texto y texto a voz, y en cada turno llama a nuestro **cerebro** (`/api/line/brain`) como Custom LLM. Las tres herramientas webhook de la fase 3 (`protocol`, `ask`, `search`) siguen expuestas para depurar y son las funciones internas que el cerebro usa. No hay voz en este repo.

## El cerebro (Custom LLM) — fase 4

| Qué | Dónde |
| --- | --- |
| Endpoint | `POST /api/line/brain/chat/completions` (también `/api/line/brain` y `/api/line/brain/v1/chat/completions`). Formato OpenAI Chat Completions, respuesta SSE `chat.completion.chunk` terminada en `data: [DONE]`. |
| Keep-warm | `GET /api/line/brain` con el secreto (o `Authorization: Bearer $CRON_SECRET`) responde `{ok, warm}` y mantiene el índice en memoria. |
| Código | `src/lib/line/brain.ts` (prompt, Claude, fallback), `state.ts` (estado derivado del historial), `triage.ts` (señales graves en código), `guard.ts` (reglas de salida frase a frase), `retrieval.ts` (BM25 precargado, presupuesto 800 ms), `resources.ts` (líneas por país), `brainHttp.ts` (auth, SSE). |

### Qué recibe el modelo en cada turno

1. **Bloque estático, cacheado por Anthropic** (unos 23 000 tokens, idéntico para cada idioma): las reglas clínicas y **los 10 protocolos completos** (todas las fases, pasos, `never`, escalada y evidencia). Sin `STEP_LIMIT` ni `SAY_LIMIT`.
2. **Bloque dinámico, derivado del transcript por código** (`state.ts`): quién llama (cuidador o persona autista), país, idioma, protocolo y fase, **pasos ya dados** (por solapamiento de palabras con los turnos anteriores), si el triaje se hizo y qué respondió, señales graves, primeros auxilios en casa que aplican, **documentos de la biblioteca** recuperados para este turno (BM25 sobre el turno actual más contexto, en cada turno, también en crisis), fuente web pendiente del turno anterior, y recursos del país.
3. El historial de la llamada, tal como lo manda ElevenLabs.

No hay estado en el servidor: el mismo historial produce siempre el mismo estado. ElevenLabs reenvía la conversación completa en cada turno, así que una instancia perdida no pierde nada (salvo una fuente web pendiente, que se busca de nuevo).

### Reglas clínicas en código, no solo en el prompt

- **Triaje** (`triage.ts`): `severeSignals` solo reconoce señales graves reales: pérdida de conciencia, sangre que no para, vómitos o confusión tras un golpe en la cabeza, dificultad para respirar, lesión en un ojo, algo tragado, convulsión, un arma en la mano, ideación suicida. «Se sigue golpeando» o «hay sangre» a secas **no** son graves: se dan primeros auxilios en casa. Las tres funciones de la fase 3 usan ahora este triaje; `localRiskScreen` (más sensible) queda para Ask y el Care Agent.
- **Emergencias** (`guard.ts`): sin señal grave, cualquier frase con «emergencias», «ambulancia» o un número de emergencias se descarta antes de hablarse. Con señal grave, la frase de emergencias del país (`dangerSentence`) se dice y nunca la corta el tope de frases.
- **Nunca** medicación ni veredictos de diagnóstico (con intención suicida, «retira las pastillas de su alcance» sí se permite: es seguridad). Nunca relleno emocional («lo siento», «te entiendo», «estoy contigo»…), nunca etiquetas `[slow]`, nunca markdown.
- **Sin repetir**: una frase ya dicha en la llamada se descarta; la de emergencias puede repetirse mientras la señal grave siga.
- **2 a 4 frases** por turno (2 si llama la persona autista). Lo que sobra se corta antes de hablar.
- **Fuentes** solo de la biblioteca o de la evidencia del protocolo; el eval falla si se nombra un estudio sin nada que citar.
- **Protocolo pegajoso**: se elige en el primer turno que coincide y no cambia a mitad de la crisis salvo que un turno apunte con fuerza a otro. La ideación suicida va siempre al protocolo 4. En empate gana la urgencia clínica (peligro físico, autolesión, agresión a personas, a objetos…). Las frases `sayToPerson` de los protocolos son para decirle a la persona autista, nunca del agente a quien llama.
- **Casos fuera de los 10**: no se fuerza un protocolo; se responde con biblioteca, escalera general de desescalada y, si la biblioteca no tiene nada, búsqueda web en segundo plano (la fuente llega en el turno siguiente). Cada caso se registra anonimizado (`event: line_uncovered`, sin nombres, cifras ni correos) en los logs de Vercel; `LINE_LOG_UNCOVERED=0` lo apaga.
- **Fallback**: si Claude tarda más de 4 s en empezar, falla o rechaza, habla el protocolo: siguiente paso no dado, o la escalera general.

### Latencia (medida)

| Pieza | Medido |
| --- | --- |
| Cargar `docs.json` + `index.json` (11 MB) | 1,2 s, solo en arranque en frío |
| Construir el índice BM25 | 213 ms, una vez por instancia (en el arranque del módulo, no en la petición) |
| Consulta BM25 en caliente | 3–6 ms (presupuesto 800 ms; si vence, se responde sin biblioteca) |
| Claude Sonnet 5.5, primer token, prompt cacheado, sin razonamiento | 0,97–1,17 s (1,75 s cuando escribe la caché) |
| **Primera frase hablada, en caliente, en proceso** | **1,2–2,2 s** (la frase debe terminar para pasar el filtro; por eso el prompt pide frases de 12 palabras) |
| Turno completo | ~2 s |

Desde ElevenLabs hay que sumar su salto de red a Vercel y la propia síntesis de voz. **Condiciones para acercarse a 1,5 s:** Fluid Compute activado en el proyecto de Vercel (instancias calientes y reutilizadas), región cercana a ElevenLabs y a Anthropic (`iad1`), y un keep-warm cada 5 minutos a `GET /api/line/brain`. El proyecto está en el plan Hobby de Vercel, que solo admite crons diarios (un cron de 5 minutos en `vercel.json` hace fallar el despliegue), así que el keep-warm va fuera: un pinger externo (por ejemplo cron-job.org) cada 5 minutos con la cabecera `x-line-secret`. Con plan Pro, añade a `vercel.json` `{"crons":[{"path":"/api/line/brain","schedule":"*/5 * * * *"}]}` y crea `CRON_SECRET`. En frío, la primera llamada tarda unos 3 s más. Si en la prueba real no se alcanza, la alternativa es un servicio siempre encendido (Fly.io o Railway) con el mismo código: el cerebro no depende de Next más que por la ruta.

### Conectar ElevenLabs al cerebro

1. En el agente, **LLM → Custom LLM**. Server URL: `https://neuroljus.com/api/line/brain` (ElevenLabs añade `/chat/completions`; si tu versión pide la base con `/v1`, usa `https://neuroljus.com/api/line/brain/v1`). Model ID: cualquiera, por ejemplo `neuroljus-line`.
2. Clave: el valor de `LINE_API_SECRET`. El cerebro la acepta como `Authorization: Bearer` (lo que ElevenLabs manda como API key) y como cabecera `x-line-secret`.
3. Prompt del sistema del agente: corto, solo voz y turno (`agent-prompt.md`, versión fase 4). Las reglas viven en el cerebro; el cerebro ignora el `system` que manda ElevenLabs.
4. Quita las herramientas webhook del agente (el cerebro ya tiene protocolos, biblioteca y web). Déjalas si quieres depurar.
5. Variables en Vercel: `LINE_API_SECRET` y `ANTHROPIC_API_KEY` (ya existen); opcionales `CRON_SECRET` (solo si el keep-warm es un cron de Vercel en plan Pro), `LINE_BRAIN_RATE_LIMIT_PER_MIN` (240), `LINE_BRAIN_THINKING=adaptive` (razonamiento previo; más lento), `LINE_LOG_UNCOVERED=0`.
6. Retención de audio y transcripciones del agente: desactivada, como en la fase 3.

### Probar sin voz

`npm run line:eval` corre `scripts/line-eval/scenarios.ts` (tres niños en crisis, autolesión diaria, cuidador que no puede acercarse, golpe en la cabeza con vómito, ideación suicida, persona autista en bloqueo, caso fuera de los 10, pregunta tranquila, sueño; es/en/sv) contra el cerebro **con un modelo guionizado** que rompe reglas a propósito, y verifica: número de frases, sin palabras prohibidas, sin emergencias sin señal grave, sin pasos repetidos, sin fuentes inventadas, fuente nombrada cuando hubo biblioteca, y latencia de la primera frase. Corre en CI (`.github/workflows/test.yml`) y falla el PR si algo se rompe.

`npm run line:eval -- --live` con `LINE_BRAIN_URL=https://neuroljus.com/api/line/brain` y `LINE_API_SECRET` corre las mismas conversaciones contra el cerebro desplegado con Claude, mide la primera frase de verdad y aplica las mismas reglas (presupuesto 1,5 s; `LINE_EVAL_FIRST_MS` lo cambia).

---

## Fase 3 — las herramientas webhook

| Herramienta | Endpoint | Para qué | Código |
| --- | --- | --- | --- |
| `protocol` | `POST /api/line/protocol` | Crisis: protocolo determinista, fase por fase | `src/lib/line/protocol.ts` |
| `ask` | `POST /api/line/ask` | Calma: biblioteca (BM25) + Claude con citas | `src/lib/line/ask.ts` |
| `search` | `POST /api/line/search` | Solo si la biblioteca no responde: web sobre autismo | `src/lib/line/search.ts` |

Plomería común (auth, límite, errores): `src/lib/line/http.ts`.

## Contrato

Todas: `POST`, JSON, cabecera `x-line-secret: <LINE_API_SECRET>`. Respuestas `200` con `ok: true`; `400` entrada inválida; `401` secreto incorrecto; `405` método; `429` límite; `503` secreto no configurado (falla cerrado).

- `protocol` recibe `{situation, lang, country}` y, opcionales, `phase` (`agitation|peak|descent|recovery`) y `protocol` (id del protocolo, para mantenerlo entre fases). Devuelve `{risk, protocol, number, title, phase, next_phase, matched, emergency, speech, evidence_ids}`. Con `risk: true`, la primera frase de `speech` es la línea de emergencias del país (`emergency.ts`). Elección: palabras clave es/en/sv, gana la mayor coincidencia, empate al protocolo de número menor; sin coincidencia, protocolo 5 (o 1 con riesgo) y `matched: false`.
- `ask` recibe `{question, lang, country}`. Devuelve `{mode, risk, use_tool, speech, sources[{title, year}], library_empty}`: máximo tres frases y dos fuentes. Con riesgo no busca y devuelve `use_tool: "protocol"`. Con preguntas sobre medicación responde que lo decide el médico, sin red.
- `search` recibe `{query, lang, country}`. Devuelve `{mode, risk, use_tool, speech, sources[{title, site}]}`. Usa la búsqueda web de Anthropic con `max_uses: 3` y `allowed_domains`. Se bloquea con riesgo.

`country` es opcional y sale solo del cuerpo. Nunca se usa `x-vercel-ip-country`: las llamadas vienen de los servidores de ElevenLabs y ese país no es el de la persona. Sin `country`, la frase de emergencias es la genérica («el número de emergencias de tu país»).

## Dominios permitidos en `search`

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
- Tiempos: `protocol` es local (milisegundos). `ask` corta a 2,8 s y responde con la biblioteca. `search` corta a 9 s: la búsqueda web no cabe en 3 s, así que el agente debe avisar antes («déjame buscarlo»). `tools.json` ajusta el tiempo de espera por herramienta.

## Conectar en ElevenLabs

1. Crea el secreto del workspace con el valor de `LINE_API_SECRET`.
2. Añade las tres herramientas webhook de `tools.json` al agente (sustituye `secret_id`).
3. Pega `agent-prompt.md` en el prompt del sistema.
4. Desactiva la retención de audio y transcripciones del agente (ver «Privacidad y límites»). Sin este paso no llama ninguna familia real.
5. Prueba con una llamada de test: una crisis (solo `protocol`), una pregunta tranquila (`ask`) y una pregunta fuera de biblioteca (`search`).
