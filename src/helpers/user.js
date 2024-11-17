import { Role } from "./constants";
export const getRoleSeverity = (status) => {
    switch (status) {
        case Role.Staff:
            return 'success';
        case Role.Cashier:
            return 'warn';
        case Role.Manager:
            return 'danger';
        default:
            return null;
    }
};