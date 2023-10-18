import { Contract } from "ethers";
import { PulseXPair_Abi } from "./abis";

export default (function () {

    let contract = null;

    return {

        connected: () => {
            return contract !== null;
        },

        setProvider: (provider, addr) => {
            if (provider) {
                contract = new Contract(addr, PulseXPair_Abi, provider.getSigner());
            }
        },

        token0: async () => {
            const res = await contract.token0()
            return res;
        },

        token1: async () => {
            const res = await contract.token1()
            return res;
        },

        getBalance: async (addr) => {
            const res = await contract.balanceOf(addr)
            return res;
        },

        getDecimals: async (addr) => {
            const res = await contract.decimals()
            return res;
        }
    }

})();