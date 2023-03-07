import { Contract, BigNumber, utils } from "ethers";
import { HEX_ADDRESS, HEX_DEC, HEX_DAYPAYOUT_DEC, HEX_SHARERATE_DEC } from "./Address";
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
            balance = await contract.balanceOf(address);
            // balance = utils.parseUnits("25148613.25", HEX_DEC);
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

    const GetShareRate = async () => {
        let shareRate = BigNumber.from(0);
        if (!contract) return shareRate;

        try {
            const globalInfo = await contract.globalInfo();
            shareRate = globalInfo[2].div(utils.parseUnits("1", HEX_SHARERATE_DEC));
            // shareRate = BigNumber.from(Math.round(+globalInfo[2] / 10));
        } catch (e) {
            console.error(e);
        }

        return shareRate;
    }

    const GetTotalTShare = async (address) => {
        let totalTShare = BigNumber.from(0);
        if (!contract) return totalTShare;

        try {
            const stakeCount = await contract.stakeCount(address);
            let totalHex = BigNumber.from(0);
            for (let i = 0; i < +stakeCount; i++) {
                const stakeList = await contract.stakeLists(address, i);
                totalHex = totalHex.add(stakeList['stakedHearts']);
                // totalHex = totalHex.add(stakeList['stakeShares']);
            }
            totalTShare = totalHex.div(await GetShareRate()).mul(utils.parseUnits("1", 18 - HEX_DEC));
            // totalTShare = totalHex;
        } catch (e) {
            console.error(e);
        }

        return totalTShare;
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

        getShareRate: async () => {
            return await GetShareRate();
        },

        getTotalTShare: async (address) => {
            return await GetTotalTShare(address);
        },
    }
};

export default HexContract();