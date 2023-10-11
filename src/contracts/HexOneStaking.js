import { Contract, BigNumber } from "ethers";
import { HexOneStaking_Abi } from "./abis";
import { HexOneStakingMaster_Addr } from "./address";

export default (function () {

    let contract = null;

    return {

        connected: () => {
            return contract !== null;
        },

        setProvider: (provider) => {
            if (provider) {
                contract = new Contract(HexOneStakingMaster_Addr.contract, HexOneStaking_Abi, provider.getSigner());
            }
        },

        getCurrentDay: async () => {
            let currentDay = BigNumber.from(0);
            if (!contract) return currentDay;

            try {
                currentDay = await contract.currentStakingDay();
            } catch (e) {
                console.error(e);
            }

            return currentDay;
        },

        getStakingList: async (address) => {
            let list = [];
            if (!contract) return list;

            try {
                list = await contract.getUserStakingStatus(address);
            } catch (e) {
                console.error(e);
            }

            return list;
        },

        getStakingEnable: async () => {
            let status = false;
            if (!contract) return status;

            try {
                status = await contract.stakingEnable();
            } catch (e) {
                console.error(e);
            }

            return status;
        },

        claimable: async (address, token) => {
            let result = false;
            if (!contract) return result;

            try {
                result = await contract.claimableRewardsAmount(address, token);
            } catch (e) {
                console.error(e);
            }

            return result;
        },

        stakeToken: async (token, amount) => {
            if (!contract) return { status: "failed" };

            try {
                const tx = await contract.stakeToken(token, amount);
                await tx.wait();
                // const [transferEvent] = tr.events;
            } catch (e) {
                if (e.error?.message) {
                    return { status: "failed", error: "Stake failed! " + e.error?.message };
                } else if (e.message) {
                    return { status: "failed", error: "Stake failed! " + (e.data?.message ? e.data.message : e.message) };
                } else {
                    return { status: "failed", error: "Stake failed!" };
                }
            }

            return { status: "success" };
        },

        unstakeToken: async (token, amount) => {
            if (!contract) return { status: "failed" };

            try {
                const tx = await contract.unstake(token, amount);
                await tx.wait();
                // const [transferEvent] = tr.events;
            } catch (e) {
                if (e.error?.message) {
                    return { status: "failed", error: "Unstake failed! " + e.error?.message };
                } else if (e.message) {
                    return { status: "failed", error: "Unstake failed! " + (e.data?.message ? e.data.message : e.message) };
                } else {
                    return { status: "failed", error: "Unstake failed!" };
                }
            }

            return { status: "success" };
        },

        claimRewards: async (token) => {
            if (!contract) return { status: "failed" };

            try {
                const tx = await contract.claimRewards(token);
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

        rewardsPool: async () => {
            if (!contract) return { status: "failed" };

            const res = contract.rewardsPool()

            return res
        }
    }

})();