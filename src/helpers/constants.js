export const ErrorCode = {
  NotFound: 1,
  InternalServerError: 2
}

export const OrderStatus = {
  Open: 'Open',
  Processing: 'Processing',
  Payment: 'Payment',
  Done: 'Done'
}

export const AccountStatus = {
  Free: 'Free',
  Busy: 'Busy'
}

export const Role = {
  Staff: 'Staff',
  Manager: 'Manager',
  Cashier: 'Cashier',
  Guest: 'Guest'
}

export const PromotionType = {
  Percent: 'percent',
  Amount: 'amount'
}

export const SettingKey = {
  Promotion: 'promotion',
  CreditPoint: 'credit_point'
}

export const CreditPointType = {
  Availabe: 'available',
  LifeSpan: 'life_span'
}
