// service.js
import { uuidv7 } from "uuidv7";
class Service {
    constructor({
        id,
        name,
        description,
        tenant,
        price,
        type,
        updatedTime,
        createdTime,
        categoryName,
        categoryId,
        createdBy,
        updatedBy,
        isDeleted
    } = {}) {
        this.id = id == null ? uuidv7() : id;
        this.name = name == null ? '' : name;
        this.description = description == null ? '' : description;
        this.tenant = tenant == null ? '' : tenant;
        this.price = price == null ? 0 : parseFloat(price);
        this.type = type;
        this.updatedTime = updatedTime == null ? new Date : new Date(updatedTime);
        this.createdTime = createdTime == null ? new Date : new Date(createdTime);
        this.createdBy = createdBy == null ? '' : createdBy;
        this.updatedBy = updatedBy == null ? '' : updatedBy;
        this.isDeleted = isDeleted == null ? false : isDeleted;
        this.categoryId = categoryId == null ? '' : categoryId;
        this.categoryName = categoryName == null ? '' : categoryName;
    }

    // Update method
    update(updatedBy, updates = {}) {
        Object.assign(this, updates);
        this.updatedBy = updatedBy;
        this.updatedTime = new Date();
        this.validate();
    }

    // Soft delete method
    delete(updatedBy) {
        this.isDeleted = true;
        this.updatedBy = updatedBy;
        this.updatedTime = new Date();
    }

    // Format price to 4 decimal places
    getFormattedPrice() {
        return this.price.toFixed(4);
    }

    // Convert to plain object
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            tenant: this.tenant,
            price: this.price,
            type: this.type,
            updatedTime: this.updatedTime.toISOString(),
            createdTime: this.createdTime.toISOString(),
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
            isDeleted: this.isDeleted
        };
    }
}

// Create service factory function
export function createService(serviceData) {
    const service = new Service(serviceData);
    return service;
}