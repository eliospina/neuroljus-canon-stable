# La cuenta de la ficha: cómo se activa

La ficha funciona sin cuenta (vive en el navegador). Con cuenta, viaja: el teléfono de quien cuida, el ordenador del boende, cualquier navegador. La cuenta vive en Supabase, en la Unión Europea, y cada fila solo la ve quien la creó.

El código ya está listo. Activarla son cuatro pasos de la dueña del proyecto, unos quince minutos, y ninguno necesita programar.

## 1. Crear el proyecto en Supabase

1. Entra en [supabase.com](https://supabase.com) y crea una cuenta (gratis).
2. **New project.** Nombre: `neuroljus`. Región: **Stockholm (eu-north-1)** o Frankfurt (eu-central-1). Guarda la contraseña de la base de datos en tu gestor de contraseñas; no hace falta en Vercel.
3. Espera a que el proyecto termine de arrancar (un par de minutos).

## 2. Crear la tabla

1. En el menú de la izquierda, **SQL Editor** → **New query**.
2. Pega el contenido de `supabase/migrations/0001_fichas.sql` de este repositorio y pulsa **Run**.
3. Debe decir "Success". Eso crea la tabla `fichas` con la regla de que cada persona solo ve lo suyo.

## 3. Permitir entrar con un enlace por correo

1. **Authentication → Providers → Email**: deja **Email** activado. Puedes desactivar "Confirm email" si no quieres un doble paso; el enlace de entrada ya confirma el correo.
2. **Authentication → URL Configuration**:
   - Site URL: `https://neuroljus.com`
   - Redirect URLs: añade `https://neuroljus.com/ficha` y `https://*.vercel.app/ficha` (para las vistas previas).
3. Opcional, **Authentication → Email Templates → Magic Link**: cambia el texto al tono de Neuroljus. El asunto puede ser "Tu enlace para entrar en Neuroljus".

## 4. Pegar dos valores en Vercel

En Supabase, **Project Settings → API**, copia:

- **Project URL** → en Vercel, variable `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → en Vercel, variable `NEXT_PUBLIC_SUPABASE_ANON_KEY`

En Vercel: el proyecto → **Settings → Environment Variables**, para Production y Preview. Luego **Redeploy**.

La clave `anon` es pública por diseño: va en el navegador. Lo que protege los datos es la regla por fila de la tabla, no la clave. La clave `service_role` **nunca** va en Vercel ni en el repositorio.

## Cómo saber que funciona

En `/ficha` aparece la caja **"Tu cuenta"**. Escribe tu correo, abre el enlace que llega, y vuelves a `/ficha` ya dentro. Crea una ficha en el teléfono, entra con el mismo correo en el ordenador, y la ficha está ahí.

Sin las dos variables, la caja no aparece y todo sigue funcionando solo en el navegador.

## Qué guarda el servidor

Una fila por ficha: su id, el usuario dueño, la ficha entera como JSON y la fecha de cambio. Nada más. Las tarjetas (`/tarjeta#…`) siguen viajando dentro del enlace y no pasan por el servidor.

## Borrar

Desde la página de la ficha, **Borrar esta ficha** la borra del navegador y de la cuenta. Para borrar la cuenta entera, hoy hay que hacerlo desde Supabase (**Authentication → Users**); borrar al usuario borra sus fichas en cascada. Un botón en el sitio para esto es un pendiente.
