import { uuidv7 } from "uuidv7"

class User {
    constructor(
        {id, username, password, full_name, tenant, role, email, phone, note, createdBy, updatedBy} = {}) {
        this.id = id == null ? uuidv7() : id;
        this.username = username;
        this.password = password;
        this.full_name = full_name == null ? '' : full_name;
        this.tenant = tenant == null ? '' : tenant;
        this.role = role;
        this.email = email == null ? '' : email;
        this.phone = phone == null ? '' : phone;
        this.note = note;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }
}

export default User;