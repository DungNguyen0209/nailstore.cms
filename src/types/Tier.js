import { uuidv7 } from "uuidv7";

class Tier {
    constructor({ id, requiredVisit, requiredTotalSpent, color, creditPointSetting } = {}) {
        this.id = id || uuidv7();
        this.requiredVisit = requiredVisit || 0;
        this.requiredTotalSpent = requiredTotalSpent || 0;
        this.color = color;
        this.creditPointSetting = creditPointSetting || {}
    }
}

export default Tier
