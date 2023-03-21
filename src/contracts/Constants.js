
export const HEX_DAYPAYOUT_DEC = 15;
export const HEX_SHARERATE_DEC = 1;
export const HEXONE_VAULT_DEC = 8;

export const STAKEDAYS_MIN = 1;
export const STAKEDAYS_MAX = 1200;

export const ITEMS_PER_PAGE = 5;

export const networks = [
    { name: 'Ethereum', chainId: 1 },
    { name: 'Goerli', chainId: 5 },
];

export const ERC20 = [
    { name: 'HEX', multipler: 5, id: "HEX" },
    { name: 'USDC', multipler: 3, id: "USDC" },
    { name: 'ETH', multipler: 2, id: "ETH" },
    { name: 'DAI', multipler: 2, id: "DAI" },
    { name: 'UNI', multipler: 1, id: "UNI" },
];

export const BASE_POINTS_1 = 5555555;

export const getBasePoints = (day) => {
    return Math.round(BASE_POINTS_1 / Math.pow(1.0476158, day - 1));
}
