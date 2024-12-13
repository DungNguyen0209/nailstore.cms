import api from './api'

export async function getTierSetting() {
  return await api.get('api/tiers/getAll')
}

export async function addCreditPoint(accountId, value){
  return await api.post('api/creditPoints/add',{
    accountId: accountId,
    credit: value
  })
}
