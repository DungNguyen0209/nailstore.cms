
import api from './api'

export async function getListService(query) {
    return await api.post('api/services/getAll', query)
  }

export async function createServiceByAdmin(item) {
  await api.post('api/services/create', item)
}

export async function updateService(item) {
  const updatedItem = { ...item, categoryId: item.categoryId };
  return await api.post('api/services/update', updatedItem);
}


export async function getAllCategories(query) {
  return await api.post('api/services/categories', query)
}

export async function getCategoryForDropDown() {
  return await api.get('api/services/getCategoryForDropdown')
}

export async function getServiceForDropDown() {
  return await api.get('api/services/getServiceForDropdown')
}