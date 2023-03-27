import { Contract, BigNumber } from "ethers";
import { HexOneBootstrap_Abi } from "./abis";
import { HexOneBootstrap_Addr } from "./address";
import { Erc20_Tokens_Addr } from "./address";

export default (function() {

    let contract = null;

    return {

        setProvider: (provider) => {
            if (provider) {
                contract = new Contract(HexOneBootstrap_Addr.contract, HexOneBootstrap_Abi, provider.getSigner());
            }
        },

        checkSacrificeDuration: async () => {
            let result = false;
            if (!contract) return result;
    
            try {
                result = await contract.afterSacrificeDuration();
            } catch (e) {
                console.error(e);
            }

            return result;
        },

        getCurrentDay: async () => {
            let currentDay = BigNumber.from(1);
            if (!contract) return currentDay;
    
            try {
                currentDay = await contract.getCurrentSacrificeDay();
            } catch (e) {
                console.error(e);
            }
    
            return currentDay;
        },
        
        getBasePoint: async (day) => {
            let result = BigNumber.from("0");
            if (!contract) return result;
    
            try {
                result = await contract.getAmountForSacrifice(day);
            } catch (e) {
                console.error(e);
            }

            return result;
        },

        getSacrificeList: async (address) => {
            let list = [];
            if (!contract) return list;
    
            try {
                list = await contract.getUserSacrificeInfo(address);
                list = [...list].sort((a, b) => (+a.sacrificeId) - (+b.sacrificeId));
                console.log(list);
            } catch (e) {
                console.error(e);
            }

            return list;
        },

        getAirdropList: async (address) => {
            let list = [];
            if (!contract) return list;
    
            try {
                list = await contract.requestAirdropInfo(address);
                // list = [...list].sort((a, b) => (+a.sacrificeId) - (+b.sacrificeId));
                console.log(list);
            } catch (e) {
                console.error(e);
            }

            return list;
        },

        sacrificeToken: async (type, amount) => {
            if (!contract) return { status: "failed" };
    
            try {
                console.log(Erc20_Tokens_Addr[type].contract);
                const tx = await contract.sacrificeToken(Erc20_Tokens_Addr[type].contract, amount);
                await tx.wait();
                // const [transferEvent] = tr.events;
            } catch (e) {
                console.error(e);
                if (e.code === 4001) {
                    return { status: "failed", error: "Sacrifice failed! User denied transaction." };
                } else if (e.code === -32603) {
                    return { status: "failed", error: "Sacrifice failed! Invalid duration." };
                } else {
                    return { status: "failed" };
                }
            }
    
            return { status: "success" };
        },        

        claimSacrifice: async (sacrificeId) => {
            if (!contract) return { status: "failed" };
    
            try {
                const tx = await contract.claimRewardsForSacrifice(sacrificeId);
                await tx.wait();
                // const [transferEvent] = tr.events;
            } catch (e) {
                console.error(e);
                if (e.error?.code === -32603) {
                    return { status: "failed", error: "Claim failed! " + e.error?.message };
                } else if (e.code === 4001) {
                    return { status: "failed", error: "Claim failed! User denied transaction." };
                } else {
                    return { status: "failed" };
                }
            }
    
            return { status: "success" };
        },

    }
    
})();