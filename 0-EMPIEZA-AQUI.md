# ✅ ESTA ES LA CARPETA CORRECTA DE NEUROLJUS

> Si estás viendo este archivo, **estás en la carpeta buena**.
> Ábrela aquí en Cursor, Codex o Claude Code. Las otras copias son viejas.

---

## ¿Por qué esta y no las otras?

Tienes varias carpetas `neuroljus` en tu Mac. Solo **una** es la oficial:

- **Nombre:** `neuroljus-canon-stable`
- **Conectada a GitHub:** `eliospina/neuroljus-canon-stable`
- **Ruta en tu Mac:** `/Users/elizabethospina/neuroljus-canon-stable`

`canon` = la versión canónica (la de verdad).
`stable` = la estable (la que no está a medias).

Cualquier otra carpeta `neuroljus` que **no** tenga este archivo `0-EMPIEZA-AQUI.md`
en la raíz es una copia vieja: no trabajes en ella.

---

## Cómo confirmarlo en 5 segundos

Abre la Terminal **dentro** de la carpeta y pega esto:

```bash
git remote get-url origin
```

Si responde algo que termina en `eliospina/neuroljus-canon-stable`, es la correcta. ✅

---

## Cómo abrir esta carpeta en cada herramienta

- **Claude Code:** en la Terminal, entra a la carpeta y escribe `claude`
  ```bash
  cd /Users/elizabethospina/neuroljus-canon-stable && claude
  ```
- **Cursor:** menú `File → Open Folder…` y elige `neuroljus-canon-stable`.
  O desde la Terminal: `cursor /Users/elizabethospina/neuroljus-canon-stable`
- **Codex:** ábrelo apuntando a esta misma carpeta
  `/Users/elizabethospina/neuroljus-canon-stable`.

---

## ¿No sabes cuál de todas las carpetas es esta?

Corre el script que encuentra todas tus carpetas `neuroljus` y te dice cuál es la buena:

```bash
bash /Users/elizabethospina/neuroljus-canon-stable/scripts/cual-neuroljus.sh
```

(Ver `scripts/cual-neuroljus.sh` en este mismo repositorio.)
