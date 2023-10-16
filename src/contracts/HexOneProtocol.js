import { Contract } from "ethers";
import { HexOneProtocol_Abi } from "./abis";
import { HexOneProtocol_Addr, HexMockToken_Addr } from "./address";

export default (function () {

    let contract = null;

    return {

        connected: () => {
            return contract !== null;
        },

        setProvider: (provider) => {
            if (provider) {
                contract = new Contract(HexOneProtocol_Addr.contract, HexOneProtocol_Abi, provider.getSigner());
            }
        },

        getMinDuration: async () => {
            let value = 0;
            if (!contract) return value;

            try {
                value = await contract.MIN_DURATION();
                value = +value;
            } catch (e) {
                console.error(e);
            }

            return value;
        },

        getMaxDuration: async () => {
            let value = 0;
            if (!contract) return value;

            try {
                value = await contract.MAX_DURATION();
                value = +value;
            } catch (e) {
                console.error(e);
            }

            return value;
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

        depositCollateral: async (amount, duration) => {
            if (!contract) return { status: "failed" };

            try {
                const tx = await contract.depositCollateral(HexMockToken_Addr.contract, amount, duration);
                await tx.wait();
                // const [transferEvent] = tr.events;
            } catch (e) {
                console.error(e);
                if (e.error?.message) {
                    return { status: "failed", error: "Borrow failed! " + e.error?.message };
                } else if (e.message) {
                    return { status: "failed", error: "Borrow failed! " + (e.data?.message ? e.data.message : e.message) };
                } else {
                    return { status: "failed", error: "Borrow failed!" };
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

        borrowHexOne: async (depositId, amount) => {
            if (!contract) return { status: "failed" };

            try {
                const tx = await contract.borrowHexOne(HexMockToken_Addr.contract, depositId, amount);
                await tx.wait();
                // const [transferEvent] = tr.events;
            } catch (e) {
                console.error(e);
                if (e.error?.code) {
                    return { status: "failed", error: "Borrow failed! " + e.error?.message };
                } else if (e.code === 4001) {
                    return { status: "failed", error: "Borrow failed! User denied transaction." };
                } else {
                    return { status: "failed" };
                }
            }

            return { status: "success" };
        },

        getVaultAddress: async (token) => {
            if (!contract) return { status: "failed" };

            try {
                const res = await contract.getVaultAddress(token);
                return res;
                // const [transferEvent] = tr.events;
            } catch (e) {
                console.error(e);
                return { status: "failed" };
            }
        }
    }

})();