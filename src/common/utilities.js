
export const roundNumber = (num, dec = 2) => {
  if (isNaN(num) || !num) return "";
  
  return parseFloat(num.toFixed(dec));  
}