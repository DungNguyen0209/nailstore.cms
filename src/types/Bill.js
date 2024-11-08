class Bill {
    constructor({
      id,
      orderId,
      price,
      updatedTime,
      createdTime,
      createdBy,
      updatedBy,
      isDeleted
    }) {
      this.id = id == null ? uuidv7() : id;
      this.orderId = orderId == null ? '' : orderId;
      this.price = price == null ? '' : parseFloat(price) ;
      this.updatedTime = updatedTime == null ? new Date : new Date(updatedTime);
      this.createdTime = createdTime == null ? new Date :new Date(createdTime);
      this.createdBy = createdBy == null ? '' : createdBy;
      this.updatedBy = updatedBy == null ? '' : updatedBy;
      this.isDeleted = isDeleted == null ? false : isDeleted;
    }
  
    // Example method to format the created time
    getFormattedCreatedTime() {
      return this.createdTime.toLocaleString();
    }
  
    // Example method to format the updated time
    getFormattedUpdatedTime() {
      return this.updatedTime.toLocaleString();
    }
  
    // Example method to update the price
    updatePrice(newPrice) {
      this.price = parseFloat(newPrice);
    }
  
    // Example method to mark the bill as deleted
    markAsDeleted() {
      this.isDeleted = true;
    }
  }

  export default Bill;