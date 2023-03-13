import { Contract, BigNumber } from "ethers";
import { HexOneVault_Abi } from "./abis";
import { HexOneVault_Addr } from "./address";

export default (function() {
    
    let contract = null;

    return {

        setProvider: (provider) => {
            if (provider) {
                contract = new Contract(HexOneVault_Addr.contract, HexOneVault_Abi, provider.getSigner());
            }
        },

        getBorrowableAmount: async (address, depositId) => {
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
        },

        getLiquidableDeposit: async (depositId) => {
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
        },

        getHistory: async (address) => {
            let list = [];
            if (!contract) return list;
    
            try {
                list = await contract.getUserInfos(address);
            } catch (e) {
                console.error(e);
            }
    
            return list;
        },
    }

})();