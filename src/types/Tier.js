import { uuidv7 } from "uuidv7";

class Tier {
    constructor({ id, requiredVisit, requiredTotalSpent, color, name, creditPointSetting } = {}) {
        this.id = id || null;
        this.requiredVisit = requiredVisit || 0;
        this.name = name || "";
        this.requiredTotalSpent = requiredTotalSpent || 0;
        this.color = color || "b5b5c9";
        this.creditPointSetting = creditPointSetting || {}
    }
}

export default Tier
