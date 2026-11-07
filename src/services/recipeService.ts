import { api } from './api'
import type { Recipe, ListFilters, RecipesResponse } from '../types'

export const PAGE_SIZE = 8

export const recipeService = {
  // TODO 2.1: GET /auth/recipes o /auth/recipes/search
  list: async ({ page, q }: ListFilters): Promise<RecipesResponse> => {
    if (q) {
      const { data } = await api.get<RecipesResponse>('/auth/recipes/search', {
        params: { q },
      })
      return data
    }
    const { data } = await api.get<RecipesResponse>('/auth/recipes', {
      params: { limit: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE },
    })
    return data
  },

  // TODO 3.1: GET /auth/recipes/{id}
  getById: async (id: number): Promise<Recipe> => {
    const { data } = await api.get<Recipe>(`/auth/recipes/${id}`)
    return data
  },

  // TODO 4.3: POST /recipes/add
  create: async (body: FormData): Promise<Recipe> => {
    const { data } = await api.post<Recipe>('/recipes/add', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  // TODO 4.4: DELETE /recipes/{id}
  remove: async (id: number): Promise<Recipe> => {
    const { data } = await api.delete<Recipe>(`/recipes/${id}`)
    return data
  },
}