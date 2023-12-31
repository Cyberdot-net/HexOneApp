import { Contract, BigNumber } from "ethers";
import { HexOnePriceFeed_Abi } from "./abis";
import { HexOnePriceFeed_Addr, Erc20_Tokens_Addr } from "./address";

export default (function () {

    let contract = null;

    return {

        connected: () => {
            return contract !== null;
        },

        setProvider: (provider) => {
            if (provider) {
                contract = new Contract(HexOnePriceFeed_Addr.contract, HexOnePriceFeed_Abi, provider);
            }
        },

        getHexTokenPrice: async (hexPrice) => {
            let feed = BigNumber.from(0);
            if (!contract) return feed;

            try {
                feed = await contract.getHexTokenPrice(hexPrice);
            } catch (e) {
                console.error(e);
            }

            return feed;
        },

        getBaseTokenPrice: async (tokenType, hexPrice) => {
            let feed = BigNumber.from(0);
            if (!contract) return feed;

            try {
                feed = await contract.getBaseTokenPrice(Erc20_Tokens_Addr[tokenType].contract, hexPrice);
            } catch (e) {
                console.error(e);
            }
            return feed;
        }
    }

})();