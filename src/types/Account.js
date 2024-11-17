// Account.js
import { uuidv7 } from "uuidv7"
class Account {
  constructor({ id, fullName, phone, email, tenant, role, note, creditPoint, address } = {}) {
    this.id = id == null ? uuidv7() : id
    this.fullName = fullName == null ? '' : fullName
    this.phone = phone == null ? '' : phone
    this.email = email == null ? '' : email
    this.tenant = tenant == null ? '' : tenant
    this.role = role == null ? '' : role
    this.note = note == null ? '' : note
    this.address = address == null ? '' : address
    this.creditPoint = creditPoint == null ? 0 : parseFloat(creditPoint)
  }

  updatePhone(newPhone) {
    this.phone = newPhone
  }
}

export default Account
