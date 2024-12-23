import { uuidv7 } from 'uuidv7'
import api from './api'

export async function createOrder({ isNewAccount, ownerId, account, createdBy, description }) {
  const payload = {
    isNewAccount: isNewAccount,
    ownerId: ownerId ?? null,
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
    createdBy: createdBy,
    description: description
  }

  return await api.post('api/orders/createOrder', payload)
}

export async function getOrders({ pageSize, pageNumber, sortDirection, fromDate, toDate, status }) {
  return await api.post('api/orders', {
    pageSize: pageSize,
    pageNumber: pageNumber,
    fromDate: fromDate,
    toDate: toDate,
    sortDirection: sortDirection,
    status: status
  })
}

export async function getOrderDetail(id) {
  return await api.get(`api/orders/getOrderDetail`, {
    params: { id: id }
  })
}

export async function getPaymentDetail(id) {
  return await api.get(`api/orders/paymentDetail`, {
    params: { id: id }
  })
}

export async function updateOrderInfo(order, serviceWorker) {
  return await api.post(`api/orders/updateOrderInformation`, {
    workerService: serviceWorker,
    order: order
  })
}

export async function UpdateOrderStatus(orderId, status) {
  return await api.put(`api/orders/updateOrderStatus`, null, {
    params: {
      id: orderId,
      status: status
    }
  })
}

export async function CheckoutOrder(orderId, totalPrice, creditPoint, creditPointPrice, note, orderInfo) {
  return await api.post(`api/orders/checkoutOrder`, {
    orderId: orderId,
    totalPrice: parseFloat(totalPrice),
    creditPoint: creditPoint,
    creditPointPrice: parseFloat(creditPointPrice),
    promotion : null,
    note: note,
    workerService: orderInfo
  })
}

export async function autoAssignOrderForStaff(id) {
  return await api.post(`api/orders/autoAssignOrder`, null, {
    params: { id: id }
  })
}

export async function getKpiOfStaff(staffId, startDate, endDate) {
  return await api.get(`api/orders/kpi`, {
    params: {
      staffId: staffId ?? null,
      fromDate: startDate,
      toDate: endDate
    }
  })

}