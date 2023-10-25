import { Contract, BigNumber } from "ethers";
import { HexOneBootstrap_Abi } from "./abis";
import { HexOneBootstrap_Addr } from "./address";
import { Erc20_Tokens_Addr } from "./address";

export default (function () {

    let contract = null;

    return {

        connected: () => {
            return contract !== null;
        },

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

        getCurrentSacrificeDay: async () => {
            let currentDay = BigNumber.from(0);
            if (!contract) return currentDay;

            try {
                currentDay = await contract.getCurrentSacrificeDay();
            } catch (e) {
                console.error(e);
            }

            return currentDay;
        },

        getCurrentAirdropDay: async () => {
            let currentDay = BigNumber.from(0);
            if (!contract) return currentDay;

            try {
                currentDay = await contract.getCurrentAirdropDay();
            } catch (e) {
                return -1;
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
                list = [];
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
                list = [];
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
                currentInfo = {};
            }

            return currentInfo;
        },

        getAirdropDailyHistory: async (day) => {
            let list = [];
            if (!contract) return list;

            try {
                list = await contract.getAirdropSupplyAmount(day);
            } catch (e) {
                console.error(e);
                list = [];
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
                    return { status: "failed", error: "Sacrifice failed! " + (e.data?.message ? e.data.message : e.message) };
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
                    return { status: "failed", error: "Claim failed! " + (e.data?.message ? e.data.message : e.message) };
                } else {
                    return { status: "failed", error: "Claim failed!" };
                }
            }

            return { status: "success" };
        },

        checkAirdropInfo: async (address) => {
            let requested = 0;
            if (!contract) return requested;

            try {
                const info = await contract.requestAirdropInfo(address);
                if (info.claimed) {
                    requested = 2;
                } else if (!info.airdropId.isZero()) {
                    requested = 1;
                }
            } catch (e) {
                console.error(e);
            }

            return requested;
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
                    return { status: "failed", error: "Request Airdrop failed! " + (e.data?.message ? e.data.message : e.message) };
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
                    return { status: "failed", error: "Claim Airdrop failed! " + (e.data?.message ? e.data.message : e.message) };
                } else {
                    return { status: "failed", error: "Claim Airdrop failed!" };
                }
            }

            return { status: "success" };
        },

        sacrificeStartTime: async () => {
            if (!contract) return { status: "failed" };

            const res = await contract.sacrificeStartTime()

            return res
        },

        sacrificeEndTime: async () => {
            if (!contract) return { status: "failed" };

            const res = await contract.sacrificeEndTime()

            return res
        },

        airdropStartTime: async () => {
            if (!contract) return { status: "failed" };

            const res = await contract.airdropStartTime()

            return res
        },

        airdropEndTime: async () => {
            if (!contract) return { status: "failed" };

            const res = await contract.airdropEndTime()

            return res
        },

        airdropHEXITAmount: async () => {
            if (!contract) return { status: "failed" };

            const res = await contract.airdropHEXITAmount()

            return res
        },

        HEXITAmountForSacrifice: async () => {
            if (!contract) return { status: "failed" };

            const res = await contract.HEXITAmountForSacrifice()

            return res
        },

        stakingContract: async () => {
            if (!contract) return { status: "failed" };

            const res = await contract.stakingContract()

            return res
        },

        sacrificeParticipants: async () => {
            if (!contract) return { status: "failed" };

            const res = await contract.getSacrificeParticipants()

            return res
        },

        userRewardsForSacrifice: async (address) => {
            if (!contract) return { status: "failed" };

            const res = await contract.userRewardsForSacrifice(address)

            return res
        },

        totalSacrificeWeight: async () => {

            if (!contract) return { status: "failed" };

            const res = await contract.totalSacrificeWeight(0)

            return res
        }
    }

})();