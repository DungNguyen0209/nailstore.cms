import { uuidv7 } from 'uuidv7'
class Bill {
  constructor({
    id,
    orderId,
    price,
    updatedTime,
    createdTime,
    creditPoint,
    creditPointPrice,
    discount,
    createdBy,
    updatedBy,
    checkInTime,
    ownerId,
    ownrName,
    ownerPhone,
    ownerEmail,
    isDeleted,
    serviceWorker
  } = {}) {
    this.id = id == null ? uuidv7() : id
    this.orderId = orderId == null ? '' : orderId
    this.price = price == null ? '' : parseFloat(price)
    this.updatedTime = updatedTime == null ? new Date() : new Date(updatedTime)
    this.createdTime = createdTime == null ? new Date() : new Date(createdTime)
    this.createdBy = createdBy == null ? '' : createdBy
    this.updatedBy = updatedBy == null ? '' : updatedBy
    this.isDeleted = isDeleted == null ? false : isDeleted
    this.creditPoint = creditPoint == null ? 0 : creditPoint
    this.creditPointPrice = creditPointPrice == null ? 0 : creditPointPrice
    this.discount = discount == null ? 0 : parseFloat(discount)
    this.serviceWorker = serviceWorker == null ? {} : serviceWorker
    this.checkInTime = checkInTime == null ? new Date() : new Date(checkInTime)
    this.ownerId = ownerId == null ? '' : ownerId
    this.ownrName = ownrName == null ? '' : ownrName
    this.ownerPhone = ownerPhone == null ? '' : ownerPhone
    this.ownerEmail = ownerEmail == null ? '' : ownerEmail
  }

  // Example method to format the created time
  getFormattedCreatedTime() {
    return this.createdTime.toLocaleString()
  }

  // Example method to format the updated time
  getFormattedUpdatedTime() {
    return this.updatedTime.toLocaleString()
  }

  // Example method to update the price
  updatePrice(newPrice) {
    this.price = parseFloat(newPrice)
  }

  // Example method to mark the bill as deleted
  markAsDeleted() {
    this.isDeleted = true
  }
}

export default Bill
