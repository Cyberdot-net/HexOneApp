
export const roundNumber = (num, dec = 2) => {
  if (isNaN(num) || !num) return "";
  
  return parseFloat(num.toFixed(dec));  
}

export const getShortAddress = (address) => {
  if (address.length < 11) {
    return address;
  } else {
    return `${address?.slice(0, 6)}...${address?.slice(-4)}`;
  }
};