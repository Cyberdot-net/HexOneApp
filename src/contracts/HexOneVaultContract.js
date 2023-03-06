import { Contract, BigNumber, utils } from "ethers";
import { VAULT_ADDRESS, HEXONE_VAULT_DEC } from "./Address";
import HEXONEVAULT_ABI from "./abis/hexonevault.abi.json";

const HexOneVaultContract = () => {
    let provider = null;
    let contract = null;

    const SetProvider = (newProvider) => {
        provider = newProvider;
        contract = new Contract(VAULT_ADDRESS, HEXONEVAULT_ABI, provider);
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