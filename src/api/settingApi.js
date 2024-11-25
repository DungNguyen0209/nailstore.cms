import api from './api'
import BaseMasterData from '@/types/BaseMasterData'

export async function getSettingByName(name) {
  return await api.get(`api/settings`, {
    params: { name: name }
  })
}

export async function updateSetting(item) {
  return await api.patch(`api/settings`, item)
}
