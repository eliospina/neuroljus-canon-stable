# Revisión del PR #2 — "Care protocol engine, Robot Care Interface, and Future Care Room"

- **Fecha:** 2026-07-10
- **Revisado por:** Claude Code (revisión solicitada por Elizabeth)
- **PR:** https://github.com/eliospina/neuroljus-canon-stable/pull/2 (rama `lab/robot-interface` → `main`)
- **Estado del PR al revisar:** abierto, sin conflictos (ya tiene `main` integrado)
- **Decisión acordada:** revisar y corregir ANTES de fusionar

---

## Contexto: quién hizo qué

- **Codex** (ya fusionado en `main`, 4 de julio): afinó la narrativa pública del sitio
  (landing, about, privacy, observation-method) en tres pasadas de copy. Coherente con
  los documentos de estrategia (`docs/board/`, `docs/strategy/`).
- **Cursor** (PR #2, ~8.000 líneas): motor de protocolo de cuidado, dos labs nuevos,
  reencuadre de la landing en tres idiomas, white papers, propuesta de PhD, LICENSE,
  CITATION.cff, VALIDATION.md y AGENTS.md.

## Verificación técnica (hecha en copia limpia de la rama)

- ✅ `npm test` — 10/10 tests del planner pasan
- ✅ `npm run smoke` — TypeScript sin errores
- ✅ `npm run build` — 16 páginas generadas correctamente
- ✅ Sin llamadas a APIs externas en los labs; generación determinista
- ✅ Sin riesgos de hidratación SSR en ninguna de las dos páginas nuevas

## Lo que está muy bien

- **Motor (`src/lib/careProtocol/`)**: puro, determinista, bien tipado, con validación
  y banderas de atención sensatas (avisa si falta la excepción `rejection_signal`,
  si la distancia es < 1 m, etc.).
- **`VALIDATION.md`**: sobresaliente — define explícitamente lo que NO se puede afirmar
  científicamente. Documento que protege el proyecto.
- Ambas páginas limpian sus timers principales y tienen base de accesibilidad decente.

## Bugs confirmados (corregir antes de fusionar)

1. **"Replay" borra la configuración de la cuidadora** — `src/pages/labs/robot-interface.tsx:374`.
   `setCommands(plan.steps.map(...))` sobrescribe los checkboxes de acciones permitidas
   con una copia vieja del plan. Contradice el contrato del propio protocolo
   ("los adaptadores deben preservar los ajustes de la cuidadora"). **El más serio.**
2. **La escena invierte el sentido de los comandos en valores extremos** — mismo patrón
   en ambas páginas (`robot-interface.tsx:404-406`, `future-care-room.tsx:291-299`).
   Con luz objetivo > 82%, "Lower light" SUBE la luz mostrada (82% → 100%); con sonido
   > 78% igual; con distancia < 0,7 m, "Step back" ACERCA el robot (0,7 → 0,5 m).
   Solo visual, pero contradice la bitácora en pantalla.
3. **La bitácora registra pasos que no ocurrieron** — `future-care-room.tsx:265-287`.
   Cambiar la tarjeta visual en plena reproducción acorta `steps` y marca como ejecutado
   un paso que nunca corrió. Grave para una página cuyo tema es auditoría confiable.
4. **Eventos inyectados sobre rutinas que no corren** — `robot-interface.tsx:268-297`.
   `injectEvent` no verifica `status`: se puede "pausar" una rutina en reposo (y el botón
   Resume la arranca desde cero sin registro de inicio) o "rechazar" una ya completada,
   reescribiendo su estado terminal.
5. **Mover un slider durante la reproducción congela la rutina** — `future-care-room.tsx:124-138,265-282`.
   `plan` se rememoiza con cada `input` del slider; `steps` es dependencia del efecto de
   reproducción, así que cada ajuste reinicia el temporizador del paso actual.
6. **El `seoTitle` sueco quedó en inglés** — `src/pages/index.tsx`, sección `sv`:
   "NeuroLjus - care intelligence for future health and care".

### Menores

- Sello "Generated at" queda obsoleto si se cambia la configuración después de generar
  (`future-care-room.tsx:679-723`): el JSON exportado cambia en vivo pero el sello no.
- Timeouts de "Copied" sin limpiar al desmontar (ambas páginas).
- `prefers-reduced-motion` incompleto: falta cubrir la animación `settle` del panel de
  protocolo y `scrollIntoView smooth` (`future-care-room.tsx:1241-1247`).
- `aria-live` demasiado parlanchín: anuncia cada movimiento de slider y cada paso (2,2 s).
- Campo de duración no se puede vaciar para reescribir (`robot-interface.tsx:697`).
- `<time>ready</time>` sin `dateTime` — HTML inválido (ambas páginas).
- `aria-label` en `<div>` sin `role` (`robot-interface.tsx:554,870`).
- Dos JSON de "protocolo" divergentes en robot-interface (panel 05 vs. export del planner).
- "Play routine" habilitado en estado `escalated` sin Reset explícito de la cuidadora.

## Hallazgo principal: el copy cruza los límites del board

El PR cambia sistemáticamente los límites de afirmaciones fijados en la **Decisión 001**
(`docs/board/decision-001-pause-active-product.md`) y el claim audit:

- Aparece **"apoyo diagnóstico validado"** como horizonte en los tres idiomas
  ("validated diagnostic support" / "diagnostiskt stöd") — la Decisión 001 dice:
  "No claims of medical, diagnostic, or health-signal interpretation".
- Se **eliminan descargos explícitos**: la bio de Neuroljus AI pierde "No diagnostico.
  No afirmo certeza sobre estados internos"; Care Chat pierde "(no diagnóstico)";
  observation-method pierde "non-diagnostic"; la sección "Marco actual" (límites) se
  reemplaza por "Principios de diseño" (aspiraciones).
- El **system prompt del chat** (`src/pages/api/chat.ts`) ahora instruye "Lead with
  useful structure, not disclaimers" y describe el proyecto como "research-ready care
  intelligence platform".
- El sitio diría "plataforma preparada para investigación" mientras el README de `main`
  sigue diciendo "producto pausado" — contradicción pública.
- El planner describe señales de cámara como "elevated arousal" (estado interno inferido);
  el registro correcto es "movimiento elevado / manos cerca de la cara", que el propio
  código usa en las banderas de atención.
- El protocolo declara `sensitive_personal_data: false` — discutible para rutinas de
  cuidado de una persona concreta.

**Esto no es un error técnico: es una decisión estratégica de Elizabeth.** Opciones:
(a) mantener los límites de la Decisión 001 → restaurar descargos y quitar "apoyo
diagnóstico"; o (b) actualizar formalmente la decisión del board Y el README para que
todo cuente la misma historia.

## Veredicto

**Solicitar cambios, no fusionar todavía.** Código de buena calidad, cerca de estar
listo. Los bugs 1-3 y el título sueco son arreglos pequeños y concretos. El copy
requiere decisión explícita de Elizabeth (opciones a/b arriba).

## Plan acordado / siguiente paso propuesto

1. Claude aplica las correcciones de código (bugs 1-6) sobre `lab/robot-interface`
   — **pendiente de autorización de Elizabeth para empujar a esa rama**.
2. Claude prepara propuesta de copy en los tres idiomas que mantenga el tono confiado
   sin cruzar los límites del board, para decisión frase por frase de Elizabeth.
3. Elizabeth decide opción (a) o (b) sobre los límites de afirmaciones.
4. Fusionar cuando 1-3 estén resueltos.
