
export const HEX_DAYPAYOUT_DEC = 15;
export const HEX_SHARERATE_DEC = 1;
export const HEXONE_VAULT_DEC = 8;

export const ITEMS_PER_PAGE = 5;

export const networks = [
    { name: "Ethereum", chainId: 1 },
    // { name: "Goerli", chainId: 5 },
    { name: "Pulse", chainId: 369 },
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

export const SHARE_RATE = [
    { name: "HEX1", shareRate: 0.1, reward: 'HEXIT' },
    { name: "HEXIT", shareRate: 1, reward: 'HEX' },
    { name: "HEX1/HEXIT", shareRate: 0.2, reward: 'HEXIT' },
    { name: "HEX1/HEX", shareRate: 0.2, reward: 'HEXIT' },
    { name: "HEX1/USDC", shareRate: 0.5, reward: 'HEXIT' }
];

export const BASE_POINTS_1 = 5555555;
export const TOTAL_AIRDROP_SUPPLY = 50;

export const getBasePoints = (day) => {
    return Math.round(BASE_POINTS_1 / Math.pow(1.0476158, day - 1));
}

export const getDailyPool = (day) => {
    return TOTAL_AIRDROP_SUPPLY * Math.pow(0.5, day - 1);
}
