import { utils } from "ethers";

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
}

export const isEmpty = (value) => {
  if (!value || (typeof value === "object" && value.isZero())) {
    return true;
  }

  return false;
}

export const formatDecimal = (num, decimal = 18) => {
  if (isNaN(num) || !+num) return "";
  return formatFloat(+utils.formatUnits(num, decimal), 5);
}

export const formatZeroDecimal = (num, decimal = 18) => {
  if (isNaN(num) || !+num) return "0";
  return formatFloat(+utils.formatUnits(num, decimal), 5);
}

export const formatFloat = (num, decimal = 2) => {
  if (!num || isNaN(num)) return "0";
  const result = new Intl.NumberFormat('en-US', { maximumFractionDigits: decimal }).format(num);
  return result === "-0" ? "0" : result;
}
