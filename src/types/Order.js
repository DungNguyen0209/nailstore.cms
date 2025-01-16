import Bill from './Bill';

class Order {
    constructor({
      id,
      note,
      owner,
      status,
      createdBy,
      bill,
      createdTime
    }) {
      this.id = id;
      this.note = note;
      this.status = status;
      this.owner = owner == null ? null : {
        id: owner.id,
        fullName: owner.fullName,
        email: owner.email,
        phone: owner.phone,
        address: owner.address,
        role: owner.role,
        tenant: owner.tenant,
        tier: owner.tier,
        creditPoints: owner.creditPoints,
      }
      this.createdBy = createdBy;
      this.createdTime = new Date(createdTime).toLocaleString();
      this.Bill = bill == null ? null : new Bill({
        id: bill.id,
        orderId: bill.orderId,
        price: bill.price,
        updatedTime: bill.updatedTime,
        createdTime: bill.createdTime,
        createdBy: bill.createdBy,
        updatedBy: bill.updatedBy,
        isDeleted: bill.isDeleted
      });
    }
  
    // Example method to format the created time
    getFormattedCreatedTime() {
      return this.createdTime.toLocaleString();
    }
  }
  
  export default Order;