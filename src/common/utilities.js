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
  if (!+num) return "";
  return utils.commify(utils.formatUnits(num, decimal));
}

export const formatZeroDecimal = (num, decimal = 18) => {
  if (!+num) return "0";
  return utils.commify(utils.formatUnits(num, decimal));
}

export const formatterFloat = (num, decimal = 2) => {
  if (!num) return "0";
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimal }).format(num);
}
