import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'
import { recipeService } from '../services/recipeService'
import { toast } from 'sonner'
import type { Recipe, ListFilters, RecipesResponse } from '../types'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Error desconocido'
}

// TODO 2.2: useRecipes con useQuery
export function useRecipes(filters: ListFilters) {
  return useQuery<RecipesResponse, unknown>({
    queryKey: ['recipes', filters],
    queryFn: () => recipeService.list(filters),
    placeholderData: keepPreviousData,
  })
}

// TODO 3.1: useRecipe con useQuery sin reintentos
export function useRecipe(id: number) {
  return useQuery<Recipe, unknown>({
    queryKey: ['recipe', id],
    queryFn: () => recipeService.getById(id),
    retry: false,
  })
}

// TODO 4.3: useCreateRecipe con useMutation
export function useCreateRecipe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: FormData) => recipeService.create(body),
    onSuccess: () => {
      toast.success('Receta creada correctamente')
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

// TODO 4.4: useDeleteRecipe con useMutation
export function useDeleteRecipe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => recipeService.remove(id),
    onSuccess: () => {
      toast.success('Receta eliminada correctamente')
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}