import { Contract, BigNumber, utils } from "ethers";
import { HEX_DAYPAYOUT_DEC } from "./Constants";
import { HexMockToken_Abi } from "./abis";
import { HexMockToken_Addr, HexOneProtocol_Addr } from "./address";
import { isEmpty } from "common/utilities";

export default (function() {
    
    let contract = null;
    let decimals = 8;

    return {

        setProvider: (provider) => {
            if (provider) {
                contract = new Contract(HexMockToken_Addr.contract, HexMockToken_Abi, provider.getSigner());
            }
        },

        getDecimals: async () => {
            if (!contract) return decimals;
    
            try {
                decimals = await contract.decimals();
            } catch (e) {
                console.error(e);
            }
    
            return +decimals;
        },

        getBalance: async (address) => {
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
        },

        getDayPayoutTotal: async () => {
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
        },

        getShareRate: async () => {
            let shareRate = BigNumber.from(0);
            if (!contract) return shareRate;
    
            try {
                const globalInfo = await contract.globals();
                shareRate = BigNumber.from(globalInfo["shareRate"]);
            } catch (e) {
                console.error(e);
            }
    
            return shareRate;
        },

        getCurrentDay: async () => {
            let currentDay = BigNumber.from(1);
            if (!contract) return currentDay;
    
            try {
                currentDay = await contract.currentDay();
            } catch (e) {
                console.error(e);
            }
    
            return currentDay;
        },

        allowance: async (address) => {
            let amount = BigNumber.from(0);
            if (!contract) return amount;
    
            try {
                amount = await contract.allowance(address, HexOneProtocol_Addr.contract);
            } catch (e) {
                console.error(e);
            }
    
            return amount;
        },

        approve: async (amount) => {
            if (!contract) return { status: "failed" };
    
            try {
                const tx = await contract.approve(HexOneProtocol_Addr.contract, amount);
                await tx.wait();
                // const [transferEvent] = tr.events;
            } catch (e) {
                if (e.error?.message) {
                    return { status: "failed", error: "Approve failed! " + e.error?.message };
                } else if (e.message) {
                    return { status: "failed", error: "Approve failed! " + e.message };
                } else {
                    return { status: "failed", error: "Approve failed!" };
                }
            }
    
            return { status: "success" };
        },

        mint: async () => {
            if (!contract) return { status: "failed" };
    
            try {
                const tx = await contract.mint();
                await tx.wait();
                // const [transferEvent] = tr.events;
            } catch (e) {
                if (e.error?.message) {
                    return { status: "failed", error: "Mint failed! " + e.error?.message };
                } else if (e.message) {
                    return { status: "failed", error: "Mint failed! " + e.message };
                } else {
                    return { status: "failed", error: "Mint failed!" };
                }
            }
    
            return { status: "success" };
        }
    }

})();