
import { OrderStatus } from './constants';

export const getOrderSeverity = (status) => {
    switch (status) {
        case OrderStatus.Open:
            return 'success';
        case OrderStatus.Processing:
            return 'warn';
        case OrderStatus.Payment:
            return 'danger';
        case OrderStatus.Done:
            return 'info';
        default:
            return null;
    }
};