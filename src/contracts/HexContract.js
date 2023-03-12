import { Contract, BigNumber, utils } from "ethers";
import { HEX_DAYPAYOUT_DEC, HEX_SHARERATE_DEC } from "./Constants";
import { HexMockToken_Abi } from "./abis";
import { HexMockToken_Addr, HexOneProtocol_Addr } from "./address";
import { isEmpty } from "common/utilities";

const HexContract = () => {
    let provider = null;
    let contract = null;
    let decimals = 8;

    const SetProvider = (newProvider) => {
        provider = newProvider;
        contract = new Contract(HexMockToken_Addr.contract, HexMockToken_Abi, provider.getSigner());
    }

    const GetDecimals = async () => {
        if (!contract) return decimals;

        try {
            decimals = await contract.decimals();
        } catch (e) {
            console.error(e);
        }

        return +decimals;
    }

    const GetBalance = async (address) => {
        let balance = BigNumber.from(0);
        if (!contract) return balance;

        try {
            balance = await contract.balanceOf(address);
            // balance = utils.parseUnits("25148613.25", decimals);
            balance = balance.mul(utils.parseUnits("1", 18 - decimals));
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
            const dailyData = await contract.dailyData(isEmpty(currentDay) ? currentDay : currentDay.sub(1));
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
            const globalInfo = await contract.globals();
            // shareRate = BigNumber.from(globalInfo["shareRate"]).div(utils.parseUnits("1", HEX_SHARERATE_DEC));
            shareRate = BigNumber.from(globalInfo["shareRate"]);
            console.log("shareRate", utils.formatUnits(shareRate, HEX_SHARERATE_DEC));
        } catch (e) {
            console.error(e);
        }

        return shareRate;
    }

    const Approve = async (amount) => {
        if (!contract) return { status: "failed" };

        try {
            const tx = await contract.approve(HexOneProtocol_Addr.contract, amount);
            await tx.wait();
            // const [transferEvent] = tr.events;
        } catch (e) {
            console.error(e);
            if (e.code === 4001) {
                return { status: "failed", error: "Borrow failed! User denied transaction." };
            } else {
                return { status: "failed" };
            }
        }

        return { status: "success" };
    }

    const Mint = async () => {
        if (!contract) return { status: "failed" };

        try {
            const tx = await contract.mint();
            await tx.wait();
            // const [transferEvent] = tr.events;
        } catch (e) {
            console.error(e);
            if (e.code === 4001) {
                return { status: "failed", error: "Mint failed! User denied transaction." };
            } else {
                return { status: "failed", error: `Mint failed! ${e.message}`};
            }
        }

        return { status: "success" };
    }

    return {
        setProvider: (provider) => {
            SetProvider(provider);
        },

        getDecimals: async () => {
            return await GetDecimals();
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

        approve: async (amount) => {
            return await Approve(amount);
        },

        mint: async () => {
            return await Mint();
        }
    }
};

export default HexContract();