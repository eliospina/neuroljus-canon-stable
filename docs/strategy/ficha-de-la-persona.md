# La ficha de la persona: diseño

**Fecha:** 21 de octubre de 2026
**Estado:** propuesta para leer antes de programar nada.
**Punto de partida:** tres personas reales y lo que les pasa. No lo que ya tenemos.

---

## 1. Tres personas, tres situaciones

**Ana, Bogotá, 3 de la mañana.** Su hijo Mateo tiene 9 años y no habla. Lleva dos horas golpeándose la cabeza contra la pared. Ana tiene el teléfono en la mano y a nadie a quien llamar. Lo que necesita: que alguien le diga qué hacer ahora, y que ese alguien sepa que Mateo odia que lo toquen cuando está así, que el ruido marrón lo calma y que la última vez funcionó apagar todas las luces menos la del pasillo. Ana sabe todo eso. Nadie más lo sabe. Y cada vez que pide ayuda, empieza de cero.

**Jonas, Uppsala, turno de noche.** Trabaja en un boende con seis residentes autistas. Hoy cubre a una compañera y le toca Linnea, 24 años, a quien ha visto tres veces. A las 22:00 Linnea empieza a balancearse y a tararear cada vez más fuerte. Jonas no sabe si eso es que está bien o que viene algo. Lo que necesita: en treinta segundos, lo que la compañera habría sabido. Qué significa ese tarareo en Linnea, qué hacer, qué no hacer.

**Sara, Malmö, 31 años.** Autista, habla cuando está tranquila, se bloquea del todo en sobrecarga. Cambia de asistente personal cada pocos meses y cada vez tiene que explicarse desde cero, en el peor momento posible, cuando ya no puede hablar. Lo que necesita: que lo que ella sabe de sí misma exista fuera de ella, escrito por ella, y que quien llegue lo lea antes de tocarla.

Las tres necesitan lo mismo: **que lo que se sabe de una persona exista en un sitio, crezca con el tiempo y llegue a quien está delante de ella.** Eso es la ficha. Todo lo demás son formas de escribir en ella o de leerla.

---

## 2. La experiencia, paso a paso

### Primera vez

Ana entra a neuroljus.com desde el teléfono. Ve una cosa: "Hablar ahora". Puede llamar sin registrarse, hoy mismo, y la Línea la ayuda como ahora. Al terminar, la Línea le dice una frase: "Si quieres que la próxima vez sepa quién es Mateo, crea su ficha. Tarda dos minutos."

Crear la ficha: correo, enlace de acceso (sin contraseña), y cinco preguntas. No más.

1. ¿Cómo se llama o cómo lo llamamos? (un nombre o un apodo)
2. ¿Qué edad tiene, más o menos?
3. ¿Habla? (sí / algunas palabras / no)
4. ¿Qué tres cosas lo calman?
5. ¿Qué tres cosas lo disparan?

Con eso la ficha ya existe y ya sirve. Lo demás lo va a ir poniendo la vida.

### El día a día

Al abrir Neuroljus con la ficha de Mateo, Ana ve una sola pantalla: **"Mateo, hoy."** Debajo, cuatro verbos:

- **Hablar**: la Línea, que ya sabe quién es Mateo.
- **Mirar**: la cámara, que compara lo que ve con lo normal en Mateo.
- **Hacer**: una rutina para ahora (lo que hoy es Companion), ordenada por lo que ya funcionó con él.
- **Anotar**: lo que acaba de pasar, en tres toques: qué señal, qué contexto, qué ayudó.

Nada de módulos, labs, protocolos ni adaptadores. Eso existe por debajo. Ana ve verbos.

### La ficha crece sola

Cada vez que Ana usa uno de los verbos, la ficha aprende sin que ella rellene nada:

- Llamó a la Línea por golpes en la cabeza a las 3:00; la Línea propuso apagar luces y ruido marrón; Ana dijo al final "sí, se calmó". La ficha anota: *golpes en la cabeza · noche · ayudó: luces fuera + ruido marrón*.
- Ejecutó la rutina "transición nocturna" y la valoró "ayudó". La ficha anota una vez más que eso funciona.
- La cámara vio que Mateo lleva veinte minutos con las manos cerca de la cara, algo que en él viene antes de una crisis. La ficha anota la señal y la hora.
- Anotó a mano: "cuando tararea bajito está bien; cuando sube, viene algo".

Al cabo de un mes, la ficha de Mateo dice cosas que ninguna ficha de autismo genérica puede decir, porque son de Mateo.

### Entregar la ficha

Jonas no tiene que buscar nada. Al entrar en su turno, en la ficha de Linnea (creada por el boende, mantenida por los compañeros y por Linnea misma) ve una tarjeta de una pantalla: **"Linnea en 30 segundos."** Qué significa cada señal, qué hacer, qué no hacer nunca, a quién llamar. Es lo primero que ve. El resto, si quiere, debajo.

La tarjeta se puede entregar: un enlace de solo lectura, con caducidad, para la suplente, la abuela, la profesora nueva. Quien la recibe no edita nada y la ficha registra que la vio.

### La persona habla de sí misma

Sara crea su propia ficha. Es suya: ella decide quién la ve y qué dice. Tiene una sección que solo ella escribe: **"Lo que quiero que sepas de mí antes de hablarme."** Y una regla: cuando Sara comparte su ficha con un asistente nuevo, lo primero que ese asistente ve es esa sección, en sus palabras.

Para quien no puede escribir, como Mateo, la misma sección existe y la va llenando quien lo conoce, con lo que Mateo muestra. Y las tarjetas visuales de Companion dejan de ser solo salida: Mateo puede tocar una para decir algo, y eso también queda en la ficha, como suyo.

### La Línea con la ficha

Ana llama. La Línea empieza: "¿Es por Mateo?" Si dice que sí, el modelo ya tiene delante, en una tarjeta corta, lo que la ficha sabe: no tocar, luces fuera, ruido marrón, lo que funcionó las últimas tres veces, lo que no. Responde para Mateo, no para "un niño autista". Al colgar, pregunta una sola cosa: "¿Sirvió?" Y la ficha aprende.

Quien llama sin ficha recibe exactamente lo de hoy. La Línea nunca exige registro.

---

## 3. Qué contiene la ficha

Dicho en palabras, no en campos de base de datos:

- **Quién es.** Nombre o apodo, edad aproximada, si habla, idioma. Nada más obligatorio. Nunca diagnóstico formal, documento ni dirección.
- **En sus palabras.** Lo que la persona quiere que se sepa de ella, escrito por ella o recogido por quien la conoce. Siempre lo primero que se muestra.
- **Cómo se comunica.** La lista de señales y lo que significan en esta persona: *tararea más fuerte = viene sobrecarga*, *manos en la cara = dolor o miedo*, *se va a su cuarto = necesita silencio, no está castigándose*. Cada entrada dice quién la escribió y cuántas veces se ha confirmado.
- **Qué ayuda y qué empeora.** No una lista fija: una lista con cuentas. *Ruido marrón: probado 11 veces, ayudó 9. Tocarle el hombro: probado 4, empeoró 4.* Esto es lo que ninguna guía general puede dar.
- **Qué hacer en crisis.** Tres líneas que Jonas lee en treinta segundos, más a quién llamar y, si quien cuida quiere ponerlo, medicación y médico. Opcional, nunca pedido.
- **La historia.** Todo lo que ha pasado, en orden: llamadas (solo etiquetas, nunca la conversación), rutinas ejecutadas y valoradas, señales de la cámara, notas a mano. Es la materia prima de todo lo anterior y lo que un clínico o un investigador, con permiso, podría leer.
- **Quién puede verla.** Quién la creó, con quién está compartida, hasta cuándo, y si la persona ha dado permiso para que su historia, sin nombre, ayude a entrenar sistemas.

---

## 4. Qué aprenden los sistemas

Esta es la segunda experiencia, la de la máquina, y hay que diseñarla con el mismo cuidado.

### Lo que aprende sobre una persona

- **La Línea** recibe la ficha al empezar la llamada y responde para esa persona. Lo que la Línea propone y si sirvió vuelve a la ficha. En diez llamadas, la Línea sabe de Mateo más que un médico que lo ve dos veces al año.
- **Las rutinas** (Companion) se ordenan por lo que funcionó con esta persona, no por una lista general. El perfil deja de ser un formulario de ocho casillas y pasa a ser la ficha entera.
- **La cámara** aprende qué es normal en esta persona. Lo que hoy es una fila de números por segundo pasa a ser "Mateo lleva más movimiento de manos del habitual a esta hora". Sin eso, la cámara ve, pero no entiende.
- **Pregunta** responde con la ficha delante: "para Mateo, que no tolera el tacto, esto no; esto otro sí se probó y ayudó".

### Lo que aprende sobre muchas personas

Con permiso explícito, y solo con permiso, la historia de cada ficha sale **sin nombre y sin texto libre**: edad aproximada, si habla, el perfil sensorial, la señal, el contexto, la acción y el resultado. Miles de esas filas son el conjunto de datos que hoy no existe en ningún sitio: *qué funcionó, con quién, en qué situación.* Es lo que un sistema robótico de cuidado necesita para no tratar a todas las personas autistas como la misma. Es también lo que la evaluación de la Línea necesita para dejar de ser 42 escenarios inventados y pasar a ser cientos de casos reales.

Lo que nunca sale: nombres, conversaciones, notas en texto libre, caras, vídeo. Lo individual se queda en la ficha. Lo que viaja es el patrón.

### Lo que no se puede aprender sin esto

Sin ficha, cada herramienta ve una foto; con ficha, ven una película. Un modelo que solo ve fotos responde con el promedio. Un modelo que ve la película de Mateo responde a Mateo. Esa es toda la diferencia, y no se consigue con más prompts ni con más protocolos.

---

## 5. Confianza

- **Cuenta** de quien cuida: correo y enlace de acceso. Sin contraseñas. Dentro, una o varias personas.
- **La persona autista es dueña de su propia ficha desde el día uno** (decidido por la dueña, 21 de octubre). Sara existe, y un sistema que solo entiende "cuidador y cuidado" la deja fuera. Quien no puede crearla hoy la recibe de quien cuida y la toma cuando pueda.
- **Consentimiento en dos niveles**, separados y claros: (1) guardar la ficha y compartirla con quien yo elija; (2) que mi historia sin nombre ayude a entrenar. El segundo apagado por defecto.
- **Exportar y borrar** todo, de una persona o de la cuenta entera, con un botón. Lo que ya salió anonimizado no se puede recuperar y se dice así.
- **Dónde vive**: cifrado, en la Unión Europea, con reglas de acceso por fila (nadie ve una ficha que no es suya o que no le compartieron). Supabase en Estocolmo o Fráncfort cumple esto y empieza gratis.
- **La Línea** no cambia su promesa: sin registro, sin guardar conversaciones. Con ficha, recibe una tarjeta y devuelve etiquetas. La conversación sigue sin guardarse.
- **Datos de salud** de personas identificables: consentimiento explícito, página de privacidad escrita para esto, y nada de esto se enciende para familias reales sin la revisión que ya prometimos en Privacidad.

---

## 6. Qué cambia en cada herramienta

| Hoy | Mañana |
|---|---|
| Portada con módulos y labs | Portada con "Hablar ahora" y "Entrar a tu ficha". Los labs siguen existiendo para quien construye, en su rincón. |
| Companion: formulario de 8 campos + reproductor | "Hacer": rutinas ordenadas por lo que funcionó con esta persona; cada ejecución y valoración va a la ficha. El motor (ejecución, Home Assistant) se queda igual. |
| Cuaderno de patrones: notas sueltas en el navegador | "Anotar": tres toques, y la nota va a "cómo se comunica" o "qué ayuda" de la ficha. |
| NL-VISION: filas por segundo en el navegador | "Mirar": compara con lo normal de esta persona y anota señales con hora en la ficha. La cámara y los puntos siguen sin salir del dispositivo. |
| La Línea empieza de cero | "¿Es por Mateo?" y responde con la tarjeta de la ficha. Al colgar, "¿sirvió?". |
| Pregunta responde en general | Responde con la ficha delante. |
| Nada se comparte | La tarjeta de 30 segundos, con enlace de solo lectura y caducidad. |
| Nada se agrega | Con permiso, la historia sin nombre alimenta el conjunto de datos y la evaluación. |

---

## 7. Por dónde empezar

Cada paso tiene que ser usable de verdad al terminarlo, por Ana, Jonas o Sara. Nada de infraestructura invisible durante semanas.

1. **La ficha mínima y la tarjeta.** Cuenta, persona, las cinco preguntas, "en sus palabras", y la tarjeta de 30 segundos con enlace de solo lectura. Al terminar esto, Jonas ya tiene lo que necesita en su turno y Sara ya puede entregarse a un asistente nuevo. Es lo más valioso por línea de código de todo el proyecto.
2. **Anotar y Hacer escriben en la ficha.** El cuaderno y Companion dejan de guardar en el navegador y pasan a la ficha, con las cuentas de "probado / ayudó". Aquí la ficha empieza a crecer sola.
3. **La Línea lee la ficha.** "¿Es por Mateo?" El cerebro ya acepta contexto desde ElevenLabs (idioma y país); se amplía a la tarjeta. "¿Sirvió?" al colgar.
4. **Mirar escribe en la ficha.** La cámara aprende lo normal de esta persona y anota señales.
5. **El permiso de entrenar y la salida sin nombre.** El interruptor de consentimiento, la exportación agregada y la evaluación con casos reales.

Antes del paso 1 hay que decidir tres cosas, y son tuyas:

- **Cómo se llama.** "Ficha" es lo que uso aquí porque es lo que dice una madre. Otras: "perfil", "diccionario", "libro de Mateo". El nombre que la gente diga en voz alta.
- **Decidido (21 de octubre): la persona autista es dueña de su propia ficha desde el día uno.** Puede crear su cuenta, escribir "en sus palabras", decidir quién la ve y revocarlo. Quien cuida puede crear una ficha para quien no puede hacerlo, y esa ficha pasa a la persona cuando pueda tomarla.
- **Si guardamos medicación y médico cuando quien cuida los pone.** Opcional y útil en crisis; también es el dato más sensible. Yo lo guardaría, opcional, marcado como tal.

---

## 8. Lo que este diseño no hace

- No pide a nadie que rellene un formulario largo. Cinco preguntas y la vida hace el resto.
- No mete la palabra "robot" delante de Ana. El robot es a quien le sirve la ficha mañana; hoy le sirve a Ana.
- No encaja lo que existe en algo imaginario. Reutiliza el motor de rutinas, la cámara, el cerebro de la Línea y la biblioteca, pero les cambia el centro: antes cada uno era un producto; ahora cada uno es un verbo sobre una persona.
