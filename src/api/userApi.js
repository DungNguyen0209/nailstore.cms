import api from './api'

export async function geUserByPhone(Phone) {
  return await api.get('api/accounts/getByPhone', {
    params: { phone: Phone }
  })
}

export async function getStaffForDropDown(fromDate, toDate) {
  return await api.get('api/accounts/getStaffForDropdown', 
    {params : {
      fromDate : fromDate,
      toDate : toDate
    }})
}

export async function updatePassword({accountId, password}) {
  return await api.put('api/users/updatePasswordByAccountId',{
    accountId : accountId,
    newPassword : password
  } )
}

export async function createNewUser(user) {
  return await api.post('api/users', user)
}