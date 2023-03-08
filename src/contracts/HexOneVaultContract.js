import { Contract, BigNumber, utils } from "ethers";
import { HEXONE_VAULT_DEC } from "./Constants";
import { HexOneVault_Abi } from "./abis";
import { HexOneVault_Addr } from "./address";

const HexOneVaultContract = () => {
    let provider = null;
    let contract = null;

    const SetProvider = (newProvider) => {
        provider = newProvider;
        contract = new Contract(HexOneVault_Addr.contract, HexOneVault_Abi, provider);
    }

    const GetShareBalance  = async (address) => {
        let balance = BigNumber.from(0);
        if (!contract) return balance;

        try {
            balance = await contract.balanceOf(address);
            // balance = utils.parseUnits("15", HEXONE_VAULT_DEC);
            balance = balance.mul(utils.parseUnits("1", 18 - HEXONE_VAULT_DEC));
        } catch (e) {
            console.error(e);
        }

        return balance;
    }

    return {
        setProvider: (provider) => {
            SetProvider(provider);
        },

        getShareBalance: async (address) => {
            return await GetShareBalance(address);
        },
    }
};

export default HexOneVaultContract();