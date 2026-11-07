import { Link, useParams } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import axios from 'axios'
import { useRecipe } from '../hooks/useRecipes'
import { getErrorMessage } from '../utils/errorHandler'
import { fichaText } from '../utils/ficha'
import type { Recipe } from '../types'

// TODO 3.2: descarga la imagen como blob
async function downloadImage(item: Recipe) {
  try {
    const response = await axios.get(item.image, { responseType: 'blob' })
    const blob: Blob = response.data
    const ext = blob.type.split('/')[1] ?? 'webp'
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receta-${item.id}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    toast.error(getErrorMessage(err))
  }
}

// TODO 3.3: descarga la ficha de texto
function downloadFicha(item: Recipe) {
  const text = fichaText(item)
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `receta-${item.id}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

function RecipeDetailPage() {
  const { id } = useParams()
  const { data, isLoading, isError, error } = useRecipe(Number(id))

  return (
    <main className="mx-auto max-w-3xl p-4">
      <Link to="/recetas" className="text-sm font-medium text-brand-700 hover:underline">
        ← Volver al catálogo
      </Link>

      {isLoading && <p className="mt-8 text-center text-slate-500">Cargando…</p>}

      {isError && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      {data && (
        <article className="mt-4 space-y-4">
          <img src={data.image} alt={data.name} className="w-full rounded-xl object-cover max-h-64" />
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <p className="text-sm text-slate-500">
            {data.cuisine} · {data.difficulty} · ⭐ {data.rating}
          </p>
          <p className="text-sm text-slate-500">
            Preparación: {data.prepTimeMinutes} min · Cocción: {data.cookTimeMinutes} min · Porciones: {data.servings}
          </p>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => downloadImage(data)}>Descargar imagen</Button>
            <Button variant="outline" onClick={() => downloadFicha(data)}>Descargar ficha</Button>
          </div>

          <section>
            <h2 className="font-semibold">Ingredientes</h2>
            <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
              {data.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>
          </section>

          <section>
            <h2 className="font-semibold">Instrucciones</h2>
            <ol className="mt-1 list-decimal pl-5 text-sm space-y-1">
              {data.instructions.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </section>
        </article>
      )}
    </main>
  )
}

export default RecipeDetailPage