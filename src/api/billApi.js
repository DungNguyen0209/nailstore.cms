import api from "./api";

export async function getBillOfAccount(id) {
    return await api.get('api/getBillByAccount', {
      params: { id: id }
    })
  }
  