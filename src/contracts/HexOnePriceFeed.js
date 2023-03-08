import { Contract, BigNumber } from "ethers";
import { HexOnePriceFeedTest_Abi } from "./abis";
import { HexOnePriceFeedTest_Addr } from "./address";

const HexOnePriceFeed = () => {
    let provider = null;
    let contract = null;

    const SetProvider = (newProvider) => {
        provider = newProvider;
        contract = new Contract(HexOnePriceFeedTest_Addr.contract, HexOnePriceFeedTest_Abi, provider);
    }

    const GetHexTokenPrice = async (hexPrice) => {
        let feed = BigNumber.from(0);
        if (!contract) return feed;

        try {
            feed = await contract.getHexTokenPrice(hexPrice);
        } catch (e) {
            console.error(e);
        }

        return feed;
    }

    return {
        setProvider: (provider) => {
            SetProvider(provider);
        },

        getHexTokenPrice: async (hexPrice) => {
            return await GetHexTokenPrice(hexPrice);
        },
    }
};

export default HexOnePriceFeed()