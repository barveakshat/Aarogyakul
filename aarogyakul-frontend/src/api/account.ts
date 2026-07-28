import { api } from './client'

export async function changePassword(currentPassword: string, newPassword: string) {
  await api.post('/api/account/password', { currentPassword, newPassword })
}
