import mprApi from './mprbot-client'

export interface CategoriesResponse {
  categories: string[]
}

export const categoriesApi = {
  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await mprApi.get<CategoriesResponse>('/categories')
    return response.data
  }
}
