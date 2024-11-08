// Account.js

class Account {
    constructor({
      id,
      fullName,
      phone,
      email,
      tenant,
    }) {
      this.id = id;
      this.fullName = fullName;
      this.phone = phone;
      this.email = email;
      this.tenant = tenant;
    }
  
    updatePhone(newPhone) {
      this.phone = newPhone;
    }
  }
  
  
  export default Account;