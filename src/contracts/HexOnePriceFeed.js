import { Contract, BigNumber } from "ethers";
import { HexOnePriceFeedTest_Abi } from "./abis";
import { HexOnePriceFeedTest_Addr } from "./address";

export default (function() {
    let contract = null;

    return {
        setProvider: (provider) => {
            if (provider) {
                contract = new Contract(HexOnePriceFeedTest_Addr.contract, HexOnePriceFeedTest_Abi, provider);
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
    }
})();