// Account.js
import { uuidv7 } from "uuidv7"
class Account {
  constructor({ id, fullName, phone, email, tenant, role, note, creditPoints, address } = {}) {
    this.id = id == null ? uuidv7() : id
    this.fullName = fullName == null ? '' : fullName
    this.phone = phone == null ? '' : phone
    this.email = email == null ? '' : email
    this.tenant = tenant == null ? '' : tenant
    this.role = role == null ? '' : role
    this.note = note == null ? '' : note
    this.address = address == null ? '' : address
    this.creditPoints = creditPoints == null ? 0 : creditPoints
  }

  updatePhone(newPhone) {
    this.phone = newPhone
  }
}

export default Account
