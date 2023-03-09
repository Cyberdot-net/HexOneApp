import { Contract } from "ethers";
import { HexOneVault_Abi } from "./abis";
import { HexOneVault_Addr } from "./address";

const HexOneVault = () => {
    let provider = null;
    let contract = null;

    const SetProvider = (newProvider) => {
        provider = newProvider;
        contract = new Contract(HexOneVault_Addr.contract, HexOneVault_Abi, provider.getSigner());
    }

    const GetUserInfos = async (address) => {
        let list = [];
        if (!contract) return list;

        try {
            list = await contract.getUserInfos(address);
            console.log(list);
        } catch (e) {
            console.error(e);
        }

        return list;
    }

    return {
        setProvider: (provider) => {
            SetProvider(provider);
        },

        getHistory: async (address) => {
            return await GetUserInfos(address);
        },
    }
};

export default HexOneVault();