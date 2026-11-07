import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useCreateRecipe } from '../hooks/useRecipes'

const MAX_IMAGE_BYTES = 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png']

const schema = z.object({
  name: z.string().min(3, 'El nombre necesita al menos 3 caracteres'),
  cuisine: z.string().min(3, 'La cocina necesita al menos 3 caracteres'),
  prepTimeMinutes: z.coerce
    .number({ message: 'Escriba un número' })
    .int('Debe ser un entero')
    .positive('Debe ser mayor que 0'),
})
type FormData = z.infer<typeof schema>

interface Props {
  onClose: () => void
}

function RecipeForm({ onClose }: Props) {
  const create = useCreateRecipe()
  const [fileError, setFileError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Libera URL previa al cambiar
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const elegirArchivo = (f: File | undefined) => {
    if (!f) return
    if (!IMAGE_TYPES.includes(f.type)) {
      setFileError('Solo se permiten imágenes JPG o PNG.')
      setPreview(null)
      setFile(null)
      return
    }
    if (f.size > MAX_IMAGE_BYTES) {
      setFileError('La imagen no debe superar 1 MB.')
      setPreview(null)
      setFile(null)
      return
    }
    setFileError(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const onSubmit = (values: FormData) => {
    const body = new FormData()
    body.append('name', values.name)
    body.append('cuisine', values.cuisine)
    body.append('prepTimeMinutes', String(values.prepTimeMinutes))
    if (file) body.append('image', file)
    create.mutate(body, { onSuccess: onClose })
  }

  const field = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-brand-600'

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="form-title" className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="max-h-full w-full max-w-lg space-y-3 overflow-y-auto rounded-xl bg-white p-5">
        <h2 id="form-title" className="text-lg font-bold">Nueva receta</h2>

        <div>
          <label htmlFor="name" className="text-sm font-medium">Nombre</label>
          <input id="name" type="text" className={field} {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="cuisine" className="text-sm font-medium">Cocina</label>
          <input id="cuisine" type="text" className={field} {...register('cuisine')} />
          {errors.cuisine && <p className="mt-1 text-xs text-red-600">{errors.cuisine.message}</p>}
        </div>

        <div>
          <label htmlFor="prepTimeMinutes" className="text-sm font-medium">Tiempo de preparación (min)</label>
          <input id="prepTimeMinutes" type="number" className={field} {...register('prepTimeMinutes')} />
          {errors.prepTimeMinutes && <p className="mt-1 text-xs text-red-600">{errors.prepTimeMinutes.message}</p>}
        </div>

        <div>
          <label htmlFor="image" className="text-sm font-medium">Imagen (JPG o PNG, máx. 1 MB)</label>
          <input id="image" type="file" accept="image/jpeg,image/png" className="mt-1 block w-full text-sm" onChange={(e) => elegirArchivo(e.target.files?.[0])} />
          {fileError && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          )}
          {preview && <img src={preview} alt="Vista previa de la imagen elegida" className="mt-2 h-24 rounded-lg object-contain" />}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={create.isPending}>Cancelar</Button>
          <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Guardando…' : 'Guardar'}</Button>
        </div>
      </form>
    </div>
  )
}

export default RecipeForm