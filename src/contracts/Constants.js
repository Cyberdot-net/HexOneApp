
export const HEX_DAYPAYOUT_DEC = 15;
export const HEX_SHARERATE_DEC = 1;
export const HEXONE_VAULT_DEC = 8;

export const STAKEDAYS_MIN = 1;
export const STAKEDAYS_MAX = 1200;

export const ITEMS_PER_PAGE = 5;

export const networks = [
    { name: "Ethereum", chainId: 1 },
    // { name: "Goerli", chainId: 5 },
    { name: "Fuji", chainId: 43113 },
    { name: "PulseX", chainId: 943 },
];

export const ERC20 = [
    { name: "HEX", symbol: "HEX", multipler: 5.555, id: "HEX" },
    { name: "USDC", symbol: "USDC", multipler: 3, id: "USDC" },
    { name: "DAI", symbol: "DAI", multipler: 3, id: "DAI" },
    { name: "WPLS", symbol: "WPLS", multipler: 2, id: "WPLS" },
    { name: "WPLSX", symbol: "WPLSX", multipler: 1, id: "WPLSX" },
];

export const BASE_POINTS_1 = 5555555;
export const TOTAL_AIRDROP_SUPPLY = 50;

export const getBasePoints = (day) => {
    return Math.round(BASE_POINTS_1 / Math.pow(1.0476158, day - 1));
}

export const getDailyPool = (day) => {
    return TOTAL_AIRDROP_SUPPLY * Math.pow(0.5, day - 1);
}
