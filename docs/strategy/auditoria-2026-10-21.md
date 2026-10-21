# Auditoría de Neuroljus contra el objetivo

**Fecha:** 21 de octubre de 2026
**Objetivo con el que se mide todo:** que las personas autistas sean entendidas, que esa comprensión llegue a quien las cuida, y que llegue también a los sistemas robóticos. Todo lo que no acerque a eso es ruido.

Recorrí las 22 páginas, las 8 rutas de servidor, todo lo que se guarda en el navegador y cómo se conectan entre sí. Lo que sigue está verificado en el código, no de memoria.

---

## 1. El diagnóstico en cinco líneas

1. **Hay cinco herramientas y ninguna persona.** Cada herramienta guarda lo suyo en su rincón del navegador. Nada sabe quién es la persona cuidada. La Línea empieza de cero en cada llamada.
2. **Tienes razón en lo del registro.** Sin una persona en el centro, el modelo responde al "autista promedio", que no existe. Hace falta un registro, pero de la persona cuidada, no del usuario.
3. **Hay tres cosas que el sitio promete y el código no cumple.** Hay que corregirlas antes que cualquier otra cosa.
4. **Un tercio de lo que hay sobra:** prototipos archivados, páginas que nadie enlaza, dos o tres versiones de la misma idea.
5. **El orden correcto es:** honestidad y limpieza (una semana), luego la persona en el centro (el trabajo de verdad), luego conectar las herramientas a ella. No más portada, no más herramientas nuevas.

---

## 2. Qué hay hoy, medido contra el objetivo

| Herramienta | Qué hace | Qué guarda | ¿Acerca al objetivo? |
|---|---|---|---|
| **La Línea** (`/linea`) | Voz 24 horas, en tres idiomas, con los protocolos de crisis, la biblioteca y la web | Nada en el navegador. En el servidor, etiquetas anónimas de qué hizo falta | **Sí, a medias.** Ayuda a quien cuida ahora. No entiende a nadie en particular: no recibe nada de las otras herramientas |
| **NL-VISION** (`/labs/nl-vision`) | Cámara local: señales de cara y manos, una fila por segundo | 30 minutos de métricas en el navegador, sin forma de borrarlas desde la app | **Sí.** Percibir señales es entender. Pero las señales no se asocian a nadie ni significan nada todavía |
| **Companion** (`/companion`) | Perfil sensorial de 8 campos, rutina ejecutada por el teléfono, valoración de cada ejecución, exportación a Home Assistant | Perfil, hasta 200 ejecuciones, entidades de la casa | **A medias.** La valoración ("esto ayudó") es la única señal de aprendizaje del proyecto. El resto es un reproductor con temporizador |
| **Pregunta** (`/ask`) | Preguntas con respuesta citada por tipo (ciencia, práctica, esta persona, idea, seguridad). Ideas guardadas y probadas en Companion | Hasta 100 ideas | **Sí.** Es la única herramienta que ya lee lo que otra escribió (las valoraciones de Companion) |
| **Biblioteca** (`/library`) | Estudios verificados con fichas prácticas | Nada | **Sí**, como base de evidencia |
| **Care Agent** (`/care-agent`) | Lo mismo que Companion sin perfil ni ejecución, con un robot animado y un paquete para adaptadores | Nada | **No.** Es Companion sin la parte útil |
| **Care Room** y **Robot Lab** (labs) | Dos constructores de protocolos con simulación y exportación JSON | Nada | **Uno sí** (el contrato de protocolo es el camino al robot). Dos, no |
| **Cuaderno de patrones**, **Memoria de cuidado**, **Incidente grave** (labs) | Tres formularios de notas locales con el mismo código | Tres almacenes separados | **El cuaderno sí.** Los otros dos nadie los enlaza ni los lee |
| **Método de observación** | Explica una plantilla. No tiene formulario, no guarda nada | Nada | **No** como está |
| Portada, Sobre, Contacto, Privacidad, Accesibilidad | Páginas de sitio | — | Necesarias, pero Privacidad está desactualizada (julio) y no menciona la Línea, Companion, Pregunta ni ElevenLabs |

**Cómo se conectan hoy:** NL-VISION pasa su última lectura a Companion, Care Agent, los labs y el chat de la cámara (sin mirar de cuándo es). Companion y Pregunta se leen mutuamente (ideas y valoraciones). Companion escribe en el cuaderno de patrones. **La Línea no recibe nada de ninguna.** El perfil de la persona solo lo lee Companion.

---

## 3. Urgente: lo que el sitio promete y no cumple

Esto va antes que cualquier mejora, porque es la confianza de quien llama a las 3 de la mañana.

1. **La página de la Línea dice que "los protocolos que usa son los que puedes leer y ejecutar en Companion".** Es falso. La Línea usa 10 protocolos de crisis que ninguna página muestra; Companion usa otro sistema (6 escenarios, 7 comandos). Hay que cambiar la frase, o publicar los protocolos de crisis para que se puedan leer.
2. **La página de la Línea dice "solo registramos etiquetas anónimas".** El código también guarda un extracto anonimizado (hasta 200 caracteres) de lo que dijo quien llama cuando el modelo no llegó a tiempo o la biblioteca no tenía nada. Decisión tuya: o se deja de guardar el extracto, o la página lo dice. Yo quitaría el extracto: las etiquetas ya dicen qué faltó.
3. **El prototipo archivado tiene una puerta de acceso rota y los códigos a la vista.** `public/beta` y `public/labs/nl-vision-beta` intentan entrar por una ruta que no existe, y los hashes de los códigos de acceso (fundadora, equipo, familia) están en un archivo público. No es una fuga grave (son hashes), pero es una puerta falsa en una casa que promete privacidad. Borrar.
4. **La portada dice cosas que no son:** "5 presets de escenario" (hay 6), "1 servicio de IA externo: Care Chat" (lo usan también Pregunta, Care Agent, Companion y la Línea, más ElevenLabs), y "sin nube" en el botón de exportar, cuando Companion y Care Agent envían el texto a Claude.
5. **Privacidad desactualizada.** Fecha de julio; no menciona la Línea, ElevenLabs, Companion ni Pregunta. Con lo que guardamos hoy, esa página es la que una familia o un boende va a leer.
6. **El chat de la cámara registra errores completos** en dos sitios (`/api/chat`), que pueden incluir texto del usuario. Las demás rutas solo registran el nombre del error. Igualar.
7. **Companion, Pregunta, Biblioteca y Care Agent no aparecen en el menú compartido ni en el mapa del sitio.** Las herramientas principales son invisibles para quien entra por cualquier página que no sea la portada.

Todo esto son cambios de un día. Ninguno necesita decidir nada grande.

---

## 4. Qué borrar

Borrar no es perder: todo queda en el historial de git. Es dejar de mantener y de confundir.

- **Prototipos archivados:** `public/beta`, `public/labs/nl-vision-beta`, `public/app`, `public/labs/nl-vision/index.html` ("placeholder"), la carpeta `neuroljus_beta_bundle_v2` en la raíz, y las páginas `/nl-vision-beta` y `/chat-ai` (un iframe de la cámara).
- **Care Agent** como página. Lo útil (el paquete para adaptadores) cabe en Companion o en Robot Lab.
- **Uno de los dos labs de protocolo.** Yo dejaría Robot Lab (constructor, auditoría, exportación) y quitaría Care Room, que es la misma cosa con decorado.
- **Memoria de cuidado e Incidente grave.** Nadie los enlaza, nadie los lee, y "Incidente grave" (notas sobre maltrato con jurisdicción) es un tema que merece su propio proyecto con asesoría legal, no una página escondida.
- **Método de observación** como página aparte. Su plantilla es el cuaderno de patrones; fusionar.
- **Las tres herramientas webhook de la Línea** (`/api/line/protocol`, `/api/line/ask`, `/api/line/search`): el cerebro ya hace todo eso por dentro; el README dice que quedan para depurar. Son tres puertas más que proteger.
- **Código muerto:** `NeuroljusLanding.tsx` (no se usa), `middleware.js` (desactivado), la tira de métricas de la portada (números inventados a mano).
- **Cuatro copias del limitador de peticiones** y **cuatro cabeceras de página copiadas**: una sola de cada.

Resultado: de 22 páginas a unas 12. De siete sitios donde escribir una observación a uno.

---

## 5. Qué integrar: la persona en el centro

Lo que falta no es una herramienta, es el objeto principal. Lo llamo **la ficha de la persona** (el "diccionario"): quién es (un nombre o un apodo), sus sensibilidades, sus señales y qué significan, qué ayuda y qué no, y la historia de lo que se ha probado.

Cómo se conecta cada herramienta a la ficha:

| Herramienta | Escribe en la ficha | Lee de la ficha |
|---|---|---|
| NL-VISION | Señales observadas, con fecha, asociadas a la persona (hoy son filas sueltas sin dueño) | Qué señales son relevantes para esta persona |
| Companion | Qué rutina se ejecutó, qué señal la disparó, y si ayudó | El perfil y lo que ya se sabe que funciona |
| Cuaderno de patrones | Observaciones a mano: gesto, contexto, qué alivió | — |
| Pregunta | Ideas guardadas | Lo que se sabe de la persona, para responder "para esta persona" de verdad |
| **La Línea** | Qué hizo falta en la llamada (ya lo hace, anónimo) | **La ficha al empezar la llamada**, si quien llama la tiene. El cerebro ya acepta datos de contexto desde ElevenLabs (idioma y país); ampliar eso a la ficha es el mismo camino |
| Robot Lab / exportación | — | La ficha convertida en protocolo: lo que hoy hace `applyProfile`, pero con todo lo aprendido, no solo 8 campos |

Y una sola cabecera, un solo menú, un solo idioma guardado para todo el sitio. Hoy hay cuatro cabeceras distintas y el idioma se pierde entre páginas.

---

## 6. ¿Registro con perfil? Sí, y así

**Sí.** No para controlar a nadie, sino porque la ficha tiene que sobrevivir al navegador, viajar entre el teléfono de quien cuida y el ordenador del boende, y poder llegar a la Línea. Hoy todo vive en un navegador y muere con él.

**Qué forma le daría:**

- **Una cuenta de quien cuida**, con correo y enlace de acceso (sin contraseña). Es lo que la gente conoce. Dentro, **una o varias personas** a su cargo, cada una con su ficha.
- **La Línea sigue abierta sin cuenta.** Quien llama por primera vez en crisis no va a registrarse. Con cuenta, la Línea sabe con quién habla.
- **Lo individual nunca sale.** La ficha se guarda cifrada, en Europa, y solo la ve quien la creó y a quien ella se la comparta (otro cuidador, el boende).
- **Lo agregado, con permiso explícito,** es lo que va al entrenamiento: "perfil con hipersensibilidad auditiva + transición nocturna → esta rutina ayudó", sin saber quién. Eso es lo que le sirve al robot. Los nombres no le sirven de nada.

**Precio honesto:** pasamos a guardar datos de salud de personas identificables. Eso obliga a consentimiento claro, a poder exportar y borrar todo a petición, y a una página de privacidad escrita de verdad. Es asumible y es lo correcto si el objetivo es entender a cada persona.

**Con qué se construye:** el proyecto hoy no tiene base de datos ni sistema de cuentas (todo es navegador). Lo más simple que cumple lo anterior es un servicio de base de datos con cuentas incluido, alojado en la Unión Europea (Supabase en Estocolmo o Fráncfort, con nivel gratuito suficiente para empezar), con reglas de acceso por fila para que nadie vea la ficha de otro. No cambia el plan de Vercel.

**La alternativa que descarté:** cuentas con seudónimo (una llave sin correo). Más privada, pero las familias la pierden y nadie la entiende. Si algún día hace falta, se añade.

---

## 7. El orden que propongo

**Fase 0, honestidad y limpieza (una semana).** Los siete puntos de la sección 3 y los borrados de la sección 4. Nada de esto necesita decisiones grandes. Al final, un sitio más pequeño que dice la verdad.

**Fase 1, la persona en el centro.** Diseñar la ficha (qué campos, cómo crece, cómo se comparte), la cuenta, y reconstruir Companion alrededor de ella: en vez de un formulario de 8 campos, la ficha; cada ejecución anota qué señal la disparó y si sirvió. Esta es la fase que decide si el proyecto cumple su objetivo. Antes de programar, una página de diseño para que la leas.

**Fase 2, conectar.** NL-VISION escribe señales en la ficha. La Línea recibe la ficha al empezar la llamada. Pregunta responde con la ficha. Un solo menú y un solo idioma.

**Fase 3, lo que llega al robot.** Exportación agregada y anónima con permiso, en el contrato de protocolo, y el banco de pruebas de la Línea publicado como referencia abierta. Aquí es donde Neuroljus le aporta a cualquiera que construya la inteligencia que cuida.

**Lo que no haría:** tocar más la portada, añadir herramientas, o abrir otro lab. Cada idea nueva, a partir de ahora, tiene que responder a una pregunta: ¿escribe en la ficha, lee de la ficha, o la lleva al robot? Si no, no se construye.

---

## Anexo: qué guarda hoy el navegador (para saber qué se migra)

- Companion: perfil sensorial, hasta 200 ejecuciones con valoración, entidades de Home Assistant.
- NL-VISION: 30 minutos de métricas (una fila por segundo).
- Pregunta: hasta 100 ideas.
- Cuaderno de patrones, Memoria de cuidado, Incidente grave: sus notas, cada uno aparte.
- Idioma del sitio (solo en algunas páginas).
- La Línea: nada.
