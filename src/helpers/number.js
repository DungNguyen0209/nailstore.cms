export function isNumber(text) {
    const regex = /^[0-9]+$/;
    return regex.test(text);
  }