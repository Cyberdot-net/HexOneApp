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
            } catch (e) {
                console.error(e);
            }

            return list;
        },

        getAirdropList: async (address) => {
            let list = [];
            if (!contract) return list;
    
            try {
                list = await contract.getAirdropClaimHistory(address);
                // list = [...list].sort((a, b) => (+a.sacrificeId) - (+b.sacrificeId));
            } catch (e) {
                console.error(e);
            }

            return list;
        },

        getCurrentAirdropInfo: async (address) => {
            let currentInfo = {};
            if (!contract) return currentInfo;
    
            try {
                currentInfo = await contract.getCurrentAirdropInfo(address);
            } catch (e) {
                console.error(e);
            }

            return currentInfo;
        },

        getAirdropDailyHistory: async (address) => {
            let list = [];
            if (!contract) return list;
    
            try {
                list = await contract.getAirdropSupplyAmount(address);
            } catch (e) {
                console.error(e);
            }

            return list;
        },
        
        sacrificeToken: async (type, amount) => {
            if (!contract) return { status: "failed" };
    
            try {
                const tx = await contract.sacrificeToken(Erc20_Tokens_Addr[type].contract, amount);
                await tx.wait();
                // const [transferEvent] = tr.events;
            } catch (e) {
                if (e.error?.message) {
                    return { status: "failed", error: "Sacrifice failed! " + e.error?.message };
                } else if (e.message) {
                    return { status: "failed", error: "Sacrifice failed! " + e.message };
                } else {
                    return { status: "failed", error: "Sacrifice failed!" };
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
                if (e.error?.message) {
                    return { status: "failed", error: "Claim failed! " + e.error?.message };
                } else if (e.message) {
                    return { status: "failed", error: "Claim failed! " + e.message };
                } else {
                    return { status: "failed", error: "Claim failed!"};
                }
            }
    
            return { status: "success" };
        },

        requestAirdrop: async () => {
            if (!contract) return { status: "failed" };
    
            try {
                const tx = await contract.requestAirdrop();
                await tx.wait();
                // const [transferEvent] = tr.events;
            } catch (e) {
                if (e.error?.message) {
                    return { status: "failed", error: "Request Airdrop failed! " + e.error?.message };
                } else if (e.message) {
                    return { status: "failed", error: "Request Airdrop failed! " + e.message };
                } else {
                    return { status: "failed", error: "Request Airdrop failed!" };
                }
            }
    
            return { status: "success" };
        },

        claimAirdrop: async () => {
            if (!contract) return { status: "failed" };
    
            try {
                const tx = await contract.claimAirdrop();
                await tx.wait();
                // const [transferEvent] = tr.events;
            } catch (e) {
                if (e.error?.message) {
                    return { status: "failed", error: "Claim Airdrop failed! " + e.error?.message };
                } else if (e.message) {
                    return { status: "failed", error: "Claim Airdrop failed! " + e.message };
                } else {
                    return { status: "failed", error: "Claim Airdrop failed!" };
                }
            }
    
            return { status: "success" };
        },
        
    }
    
})();