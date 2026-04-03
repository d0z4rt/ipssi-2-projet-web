import { UserResponse } from '../types/users'
import { api, authService, loadCatalog } from './api'

export const adminService = {
  getUsers: async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>('/v1/users', {
      headers: authService.getAuthHeaders()
    })
    return response.data
  },
  getStats: async () => {
    const [catalog, users] = await Promise.all([
      loadCatalog(),
      adminService.getUsers().catch(() => [])
    ])

    return {
      totalUsers: users.length,
      totalGames: catalog.games.length,
      totalReviews: catalog.reviews.length,
      reportedReviews: null
    }
  }
}
