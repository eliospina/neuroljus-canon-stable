# La línea de voz — endpoints para ElevenLabs

La voz vive en ElevenLabs Agents (agente `agent_8701m5aah553evdr2vkbaqp4rctq`, LLM Claude Sonnet). Este repo solo expone las tres herramientas que el agente llama como webhooks. No hay voz aquí.

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
