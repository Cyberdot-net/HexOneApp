import { Contract, BigNumber, utils } from "ethers";
import { HexOnePriceFeedTest_Abi } from "./abis";
import { HexOnePriceFeedTest_Addr } from "./address";

const PriceFeedContract = () => {
    let provider = null;
    let contract = null;

    const SetProvider = (newProvider) => {
        provider = newProvider;
        contract = new Contract(HexOnePriceFeedTest_Addr.contract, HexOnePriceFeedTest_Abi, provider);
    }

    const GetPriceFeed = async () => {
        let feed = BigNumber.from(0);
        if (!contract) return feed;

        try {
            // feed = await contract.getHexPrice();
            feed = utils.parseUnits("0.1");
        } catch (e) {
            console.error(e);
        }

        return feed;
    }

    return {
        setProvider: (provider) => {
            SetProvider(provider);
        },

        getPriceFeed: async () => {
            return await GetPriceFeed();
        },
    }
};

export default PriceFeedContract()