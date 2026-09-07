import { api } from './client'
import * as demo from '../demo/demoApi'

export async function changePassword(currentPassword: string, newPassword: string) {
  if (demo.isDemoMode()) throw new demo.DemoWriteError()
  await api.post('/api/account/password', { currentPassword, newPassword })
}
