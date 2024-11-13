// Account.js
import { uuidv7 } from "uuidv7";
class BaseMasterData {
    constructor({
      id,
      label,
      value
    } = {}) {
        this.id = id == null ? uuidv7() : id;;
        this.label = label == null ? '' : label;
        this.value = value == null ? '' : value;
    }
  }
  
export default BaseMasterData;