
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
];

export const ERC20 = [
    { name: "HEX", symbol: "HEX", multipler: 5, id: "HEX" },
    { name: "USDC", symbol: "USDC", multipler: 3, id: "USDC" },
    { name: "ETH", symbol: "ETH", multipler: 2, id: "ETH" },
    { name: "DAI", symbol: "DAI", multipler: 2, id: "DAI" },
    { name: "UNI", symbol: "UNI", multipler: 1, id: "UNI" },
];

export const TOKENS = [
    { name: "HEX1", token: "0x8025e948a7d494A845588099cb861a903EAdcF93" },
    { name: "HEXIT", token: "0xEb06b60E0b3A421a7100A3b09fd25DE119831694" },
    { name: "HEX1/HEXIT", token: "0x0E74FFc05EC55D0799956784959DA31b593138c1" },
    { name: "HEX1/HEX", token: "0xdF1906df64C5f3b13eFAA25729F5EA4b469db805" },
    { name: "HEX1/USDC", token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" }
]

export const BASE_POINTS_1 = 5555555;
export const TOTAL_AIRDROP_SUPPLY = 50;

export const getBasePoints = (day) => {
    return Math.round(BASE_POINTS_1 / Math.pow(1.0476158, day - 1));
}

export const getDailyPool = (day) => {
    return TOTAL_AIRDROP_SUPPLY * Math.pow(0.5, day - 1);
}
