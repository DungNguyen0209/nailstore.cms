import api from './api'

export async function createOrder({
    isNewAccount,
    ownerId,
    account,
    createdBy,
    description
  }) {
    const payload = {
      isNewAccount : isNewAccount,
      ownerId : ownerId ?? null,
      account: {
        full_name: account.fullName,
        tenant: account.tenant,
        email: account.email,
        phone: account.phone,
        role: account.role,
        note: account.note,
        createdTime: account.createdTime,
        userId: account.userId,
        createdBy: account.createdBy,
        updatedBy: account.updatedBy
      },
      createdBy : createdBy,
      description : description
    };
  
    return await api.post('api/orders/createOrder', payload);
}

export async function getOrders({pageSize, pageNumber}) {
  return await api.post('api/orders', 
    {
      pageSize: pageSize,
      pageNumber: pageNumber
    })
}