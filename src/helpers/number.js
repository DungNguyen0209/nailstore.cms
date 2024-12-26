export function isNumber(text) {
    const regex = /^[0-9]+$/;
    return regex.test(text);
  }

export function truncateToFourDecimals(value) {
  const factor = Math.pow(10, 4);
  return Math.floor(value * factor) / factor;
}
