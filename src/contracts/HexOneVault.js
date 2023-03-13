import { Contract, BigNumber } from "ethers";
import { HexOneVault_Abi } from "./abis";
import { HexOneVault_Addr } from "./address";

const HexOneVault = () => {
    let provider = null;
    let contract = null;

    const SetProvider = (newProvider) => {
        provider = newProvider;
        if (provider) contract = new Contract(HexOneVault_Addr.contract, HexOneVault_Abi, provider.getSigner());
    }

    const GetBorrowableAmount = async (address, depositId) => {
        let amount = BigNumber.from(0);
        if (!contract) return amount;

        try {
            let rs = await contract.getBorrowableAmounts(address);
            rs = rs.find(r => r["depositId"].eq(depositId));
            if (rs) {
                amount = rs["borrowableAmount"];
            }
        } catch (e) {
            console.error(e);
        }

        return amount;
    }

    const GetLiquidableDeposit = async(depositId) => {
        let amount = BigNumber.from(0);
        if (!contract) return amount;

        try {
            let rs = await contract.getLiquidableDeposits();
            rs = rs.find(r => r["depositId"].eq(depositId));
            if (rs) {
                amount = rs["liquidateAmount"];
            }
        } catch (e) {
            console.error(e);
        }

        return amount;
    }

    const GetUserInfos = async (address) => {
        let list = [];
        if (!contract) return list;

        try {
            list = await contract.getUserInfos(address);
        } catch (e) {
            console.error(e);
        }

        return list;
    }

    return {
        setProvider: (provider) => {
            SetProvider(provider);
        },

        getBorrowableAmount: async (address, depositId) => {
            return await GetBorrowableAmount(address, depositId);
        },

        getLiquidableDeposit: async (depositId) => {
            return await GetLiquidableDeposit(depositId);
        },

        getHistory: async (address) => {
            return await GetUserInfos(address);
        },
    }
};

export default HexOneVault();