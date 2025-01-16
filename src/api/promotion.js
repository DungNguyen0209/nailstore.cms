import { uuidv7 } from 'uuidv7'
import api from './api'

export async function getPromotions({ pageSize, pageNumber, keyword, isDeleted, isValid  }) {
  const payload = {
    pageSize: pageSize,
    pageNumber: pageNumber,
    keyword: keyword,
    isDeleted: isDeleted,
    isValid: isValid
  }

  return await api.post('api/promotions/getPromotionByFilter', payload)
}