import { Contract, BigNumber, utils } from "ethers";
import { PRICEFEED_ADDRESS } from "./Address";
import PPRICEFEED_ABI from "./abis/pricefeed.abi.json";

const PriceFeedContract = () => {
    let provider = null;
    let contract = null;

    const SetProvider = (newProvider) => {
        provider = newProvider;
        contract = new Contract(PRICEFEED_ADDRESS, PPRICEFEED_ABI, provider);
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