import api from './api'

export async function getBillOfAccount(id) {
  return await api.get('api/billByAccount', {
    params: { id: id }
  })
}
