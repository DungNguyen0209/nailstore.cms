import Bill from './Bill';

class Order {
    constructor({
      id,
      note,
      ownerPhone,
      ownerId,
      ownerName,
      ownerEmail,
      status,
      createdBy,
      bill,
      createdTime
    }) {
      this.id = id;
      this.note = note;
      this.ownerPhone = ownerPhone;
      this.ownerId = ownerId;
      this.ownerName = ownerName;
      this.ownerEmail = ownerEmail;
      this.status = status;
      this.createdBy = createdBy;
      this.createdTime = new Date(createdTime).toLocaleString();
      this.Bill =bill == null ? null : new Bill({
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