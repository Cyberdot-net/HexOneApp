import { Contract } from "ethers";
import { HexOneEscrow_Abi } from "./abis";
import { HexOneEscrow_Addr } from "./address";

export default (function() {

    let contract = null;

    return {

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
                console.log(list);
            } catch (e) {
                console.error(e);
            }

            return list;
        },
    }
    
})();