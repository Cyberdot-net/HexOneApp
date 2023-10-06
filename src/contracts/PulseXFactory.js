import { Contract, BigNumber } from "ethers";
import { PulseXFactory_Abi } from "./abis";
import { PulseXFactory_Addr } from "./address";

export default (function () {

    let contract = null;

    return {

        connected: () => {
            return contract !== null;
        },

        setProvider: (provider) => {
            if (provider) {
                contract = new Contract(PulseXFactory_Addr.contract, PulseXFactory_Abi, provider.getSigner());
            }
        },

        getPair: async (pair0, pair1) => {
            const pair = await contract.getPair(pair0, pair1)
            return pair;
        }
    }

})();