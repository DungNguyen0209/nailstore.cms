import { uuidv7 } from 'uuidv7'

class Promotion {
    constructor(id, name, description, tenant, type, value, updatedTime, createdTime, createdBy, updatedBy, isDeleted, createdAt, expiredAt, Services) {
        this.id = id || uuidv7();
        this.name = name || '';
        this.description = description || '';
        this.tenant = tenant || '';
        this.type = type || 'percent';
        this.value = value || 0.0000;
        this.updatedTime = updatedTime || new Date();
        this.createdTime = createdTime || new Date();
        this.createdBy = createdBy || uuidv7();
        this.updatedBy = updatedBy || uuidv7();
        this.isDeleted = isDeleted || false;
        this.createdAt = createdAt || new Date();
        this.expiredAt = expiredAt || new Date();
        this.Services = Services || [];

    }
}

export default Promotion;