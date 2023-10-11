import { Contract } from "ethers";
import { HexOneEscrow_Abi } from "./abis";
import { HexOneEscrow_Addr } from "./address";

export default (function () {

    let contract = null;

    return {

        connected: () => {
            return contract !== null;
        },

        setProvider: (provider) => {
            if (provider) {
                contract = new Contract(HexOneEscrow_Addr.contract, HexOneEscrow_Abi, provider.getSigner());
            }
        },

        getOverview: async (address) => {
            let list = [];
            if (!contract) return list;

            try {
                list = await contract.getOverview(address);
            } catch (e) {
                console.error(e);
                list = [];
            }

            return list;
        },

        collateralDeposited: async () => {
            let result = true;
            if (!contract) return result;

            try {
                result = await contract.collateralDeposited();
            } catch (e) {
                console.error(e);
            }

            return result;
        },

        reDepositCollateral: async () => {
            if (!contract) return { status: "failed" };

            try {
                const tx = await contract.reDepositCollateral();
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
        balanceOfHex: async () => {
            if (!contract) return { status: "failed" }

            const res = await contract.balanceOfHex()

            return res
        }
    }

})();