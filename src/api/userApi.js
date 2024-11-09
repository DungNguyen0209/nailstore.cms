import api from './api';

export async function geUserByPhone(Phone) {
    return await api.get('api/accounts/getByPhone', {
        params: { phone: Phone }
    });
}

export async function getStaffForDropDown() {
    return await api.get('api/accounts/getStaffForDropdown')
  }