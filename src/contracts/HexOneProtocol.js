import { Contract } from "ethers";
import { HexOneProtocol_Abi } from "./abis";
import { HexOneProtocol_Addr, HexMockToken_Addr } from "./address";

export default (function() {

    let contract = null;

    return {

        setProvider: (provider) => {
            if (provider) {
                contract = new Contract(HexOneProtocol_Addr.contract, HexOneProtocol_Abi, provider.getSigner());
            }
        },

        getFees: async () => {
            let fee = 0;
            if (!contract) return fee;
    
            try {
                const fees = await contract.fees(HexMockToken_Addr.contract);
                if (fees['enabled']) {
                    fee = +fees['feeRate'] / 10;
                }
            } catch (e) {
                console.error(e);
            }
    
            return fee;
        },

        depositCollateral: async (amount, duration, commit) => {
            if (!contract) return { status: "failed" };
    
            try {
                const tx = await contract.depositCollateral(HexMockToken_Addr.contract, amount, duration, commit);
                await tx.wait();
                // const [transferEvent] = tr.events;
            } catch (e) {
                console.error(e);
                if (e.code === 4001) {
                    return { status: "failed", error: "Borrow failed! User denied transaction." };
                } else if (e.code === -32603) {
                    return { status: "failed", error: "Borrow failed! Invalid duration." };
                } else {
                    return { status: "failed" };
                }
            }
    
            return { status: "success" };
        },

        claimCollateral: async (depositId) => {
            if (!contract) return { status: "failed" };
    
            try {
                const tx = await contract.claimCollateral(HexMockToken_Addr.contract, depositId);
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

        borrowHexOne: async (depositId, amount) => {
            if (!contract) return { status: "failed" };
    
            try {
                // const tx = await contract.borrowHexOne(HexMockToken_Addr.contract, depositId, amount);
                // await tx.wait();
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