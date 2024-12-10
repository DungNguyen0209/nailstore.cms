import api from './api'

export async function createTier({ id, requiredVisit, requiredTotalSpent, color, name, creditPointSetting }) {
    return await api.post('api/tiers/create', {
        id: id,
        requiredVisit: parseInt(requiredVisit),
        requiredTotalSpent: parseFloat(requiredTotalSpent),
        color: color,
        name: name,
        creditPointSetting: {
            requiredPoints: creditPointSetting.requiredPoints,
            limitPoints: creditPointSetting.limitPoints,
            price: parseFloat(creditPointSetting.price)
        }
    })
}

export async function updateTier({ id, requiredVisit, requiredTotalSpent, color, name, creditPointSetting }) {
    return await api.put('api/tiers/update', {
        id: id,
        requiredVisit: parseInt(requiredVisit),
        requiredTotalSpent: parseFloat(requiredTotalSpent),
        color: color,
        name: name,
        creditPointSetting: {
            requiredPoints: creditPointSetting.requiredPoints,
            limitPoints: creditPointSetting.limitPoints,
            price: parseFloat(creditPointSetting.price)
        }
    })
}