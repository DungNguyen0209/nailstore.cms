import api from './api'

export async function getTierSetting(id) {
  return await api.get('api/tiers/getAll')
}
