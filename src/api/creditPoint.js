import api from './api'

export async function getTierSetting() {
  return await api.get('api/tiers/getAll')
}
