import api from './api'
import Account from '@/types/Account'

export async function getAccountByFilter({ pageSize, pageNumber, role, keyWord }) {
  return await api.post('api/accounts/getAccount', {
    pageSize: pageSize,
    pageNumber: pageNumber,
    type: role,
    keyWord: keyWord
  })
}

export async function getStaffByFilter({ pageSize, pageNumber, role, keyWord }) {
  return await api.post('api/accounts/staff', {
    pageSize: pageSize,
    pageNumber: pageNumber,
    type: role,
    keyWord: keyWord
  })
}

export async function updateAccount(account = new Account()) {
  return await api.put('api/accounts/update', {
    id: account.id,
    fullName: account.fullName,
    phone: account.phone,
    email: account.email,
    tenant: account.tenant,
    role: account.role,
    note: account.note,
    address: account.address,
    creditPoint: account.creditPoint
  })
}

export async function deleteAccount(id) {
  return await api.delete(`api/accounts/deleteById`, {
    params: { id: id }
  })
}