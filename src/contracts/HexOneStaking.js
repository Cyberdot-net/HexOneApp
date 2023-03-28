import { Contract } from "ethers";
import { HexOneStaking_Abi } from "./abis";
import { HexOneStakingMaster_Addr } from "./address";

export default (function() {

    let contract = null;

    return {

        setProvider: (provider) => {
            if (provider) {
                contract = new Contract(HexOneStakingMaster_Addr.contract, HexOneStaking_Abi, provider.getSigner());
            }
        },

        getStakingList: async (address) => {
            let list = [];
            if (!contract) return list;
    
            try {
                list = await contract.getUserStakingStatus(address);
                console.log(list);
            } catch (e) {
                console.error(e);
            }
    
            return list;
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
                console.error(e);
                if (e.error?.code) {
                    return { status: "failed", error: "Stake failed! " + e.error?.message };
                } else if (e.code === 4001) {
                    return { status: "failed", error: "Stake failed! User denied transaction." };
                } else {
                    return { status: "failed" };
                }
            }
    
            return { status: "success" };
        },

        unstakeToken: async (address, token, amount) => {  
            if (!contract) return { status: "failed" };
    
            try {
                const tx = await contract.unstake(address, token, amount);
                await tx.wait();
                // const [transferEvent] = tr.events;
            } catch (e) {
                console.error(e);
                if (e.error?.code) {
                    return { status: "failed", error: "Unstake failed! " + e.error?.message };
                } else if (e.code === 4001) {
                    return { status: "failed", error: "Unstake failed! User denied transaction." };
                } else {
                    return { status: "failed" };
                }
            }
    
            return { status: "success" };
        },

        claimRewards: async (address, token) => {  
            if (!contract) return { status: "failed" };
    
            try {
                const tx = await contract.claimRewards(address, token);
                await tx.wait();
                // const [transferEvent] = tr.events;
            } catch (e) {
                console.error(e);
                if (e.error?.code) {
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