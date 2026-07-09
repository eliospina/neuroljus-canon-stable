#!/usr/bin/env bash
#
# cual-neuroljus.sh
# -----------------
# Busca TODAS las carpetas llamadas "neuroljus" en tu Mac y te dice cuál es
# la correcta: la que está conectada al repositorio oficial en GitHub
# (eliospina/neuroljus-canon-stable).
#
# Uso:
#   bash scripts/cual-neuroljus.sh
#
# Puedes cambiar dónde busca pasando una ruta como argumento:
#   bash scripts/cual-neuroljus.sh /Users/elizabethospina/Documents

set -u

# Dónde buscar (por defecto: tu carpeta de usuario)
BASE="${1:-$HOME}"

# El repositorio oficial. Cualquier carpeta conectada a esto es la correcta.
CANON="eliospina/neuroljus-canon-stable"

echo ""
echo "🔎 Buscando carpetas 'neuroljus' dentro de: $BASE"
echo "   (esto puede tardar unos segundos...)"
echo ""

encontradas=0
correcta=""

# Busca carpetas cuyo nombre contenga "neuroljus" (sin importar mayúsculas),
# hasta 4 niveles de profundidad para que sea rápido.
while IFS= read -r dir; do
  encontradas=$((encontradas + 1))
  remote="$(git -C "$dir" remote get-url origin 2>/dev/null)"

  if [ -z "$remote" ]; then
    echo "📁 $dir"
    echo "   ⚪️  No es un repositorio git (copia suelta o descarga). Ignorar."
  elif printf '%s' "$remote" | grep -qi "$CANON"; then
    echo "📁 $dir"
    echo "   ✅  ¡ESTA ES LA CORRECTA!  → $remote"
    correcta="$dir"
  else
    echo "📁 $dir"
    echo "   ❌  Conectada a otro repositorio: $remote  → no usar."
  fi
  echo ""
done < <(find "$BASE" -maxdepth 4 -type d -iname "*neuroljus*" 2>/dev/null)

echo "──────────────────────────────────────────────"
if [ "$encontradas" -eq 0 ]; then
  echo "No se encontró ninguna carpeta 'neuroljus' dentro de $BASE."
  echo "Prueba buscando en otra ruta, por ejemplo:"
  echo "   bash scripts/cual-neuroljus.sh /Users/elizabethospina/Documents"
elif [ -n "$correcta" ]; then
  echo "👉 Trabaja SIEMPRE en esta carpeta:"
  echo "   $correcta"
  echo ""
  echo "Ábrela en Claude Code con:"
  echo "   cd \"$correcta\" && claude"
else
  echo "⚠️  Se encontraron carpetas 'neuroljus', pero ninguna está conectada"
  echo "   al repositorio oficial ($CANON)."
  echo "   La correcta puede no estar clonada todavía en este Mac."
fi
echo ""
