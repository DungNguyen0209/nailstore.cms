import api from './api'

export async function getListService(query) {
  return await api.post('api/services/getAll', query)
}

export async function createServiceByAdmin(item) {
  await api.post('api/services/create', item)
}

export async function createCategoryByAdmin(item) {
  await api.post('api/services/createCategory', item)
}

export async function updateService(item) {
  const updatedItem = { ...item, categoryId: item.categoryId }
  return await api.post('api/services/update', updatedItem)
}

export async function updateCategory(item) {
  return await api.post('api/services/updateCategory', item)
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

export async function deleteServiceById(id) {
  return await api.delete('api/services/deleteService', {
    params: { id: id }
  })
}

export async function deleteCategoryById(id) {
  return await api.delete('api/services/deleteCategory', {
    params: { id: id }
  })
}
