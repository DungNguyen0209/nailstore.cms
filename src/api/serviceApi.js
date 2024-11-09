
import api from './api'

export async function getListService(query) {
    return await api.post('api/services/getAll', query)
  }

export async function createServiceByAdmin(item) {
  await api.post('api/services/create', item)
}

export async function getAllCategories(item) {
  return await api.get('api/services/categories', item)
}

export async function getServiceForDropDown() {
  return await api.get('api/services/getServiceForDropdown')
}