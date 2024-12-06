import api from './api'

export async function getBillOfAccount(id) {
  return await api.get('api/bills/billByAccount', {
    params: { id: id }
  })
}

export async function updateBill(payload) {
  return await api.put('api/bills/update', payload)
}