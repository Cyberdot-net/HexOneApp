import { Contract, BigNumber, utils } from "ethers";
import { HEX_ADDRESS, HEX_DEC, HEX_DAYPAYOUT_DEC } from "./Address";
import HEX_ABI from "./abis/hex.abi.json";

const HexContract = () => {
    let provider = null;
    let contract = null;

    const SetProvider = (newProvider) => {
        provider = newProvider;
        contract = new Contract(HEX_ADDRESS, HEX_ABI, provider);
    }

    const GetBalance = async (address) => {
        let balance = BigNumber.from(0);
        if (!contract) return balance;

        try {
            // balance = await contract.balanceOf(address);
            balance = utils.parseUnits("25148613.25", HEX_DEC);
            balance = balance.mul(utils.parseUnits("1", 18 - HEX_DEC));
        } catch (e) {
            console.error(e);
        }

        return balance;
    }

    const GetDayPayoutTotal = async () => {
        let dayPayoutTotal = BigNumber.from(0);
        if (!contract) return dayPayoutTotal;

        try {
            const currentDay = await contract.currentDay();
            const dailyData = await contract.dailyData(currentDay.sub(1));
            dayPayoutTotal = dailyData['dayPayoutTotal'].mul(utils.parseUnits("1", 18 - HEX_DAYPAYOUT_DEC));
        } catch (e) {
            console.error(e);
        }

        return dayPayoutTotal;
    }

    return {
        setProvider: (provider) => {
            SetProvider(provider);
        },

        getBalance: async (address) => {
            return await GetBalance(address);
        },

        getDayPayoutTotal: async () => {
            return await GetDayPayoutTotal();
        },
    }
};

export default HexContract();