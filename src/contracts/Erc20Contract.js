import { Contract, BigNumber, utils } from "ethers";
import { ERC20_Abi } from "./abis";
import { Erc20_Tokens_Addr, HexOneBootstrap_Addr } from "./address";

export default (function() {
    
    let provider = null;
    let contract = null;
    let decimals = 0;
    let tokenType = "HEX";

    return {

        setProvider: (newProvider) => {
            provider = newProvider;
        },

        setTokenType: (type) => {
            tokenType = type;
            decimals = 0;
            if (provider) {
                contract = new Contract(Erc20_Tokens_Addr[tokenType].contract, ERC20_Abi, provider.getSigner());
            }
        },

        getDecimals: async () => {
            if (!contract) return decimals;
    
            try {
                decimals = await contract.decimals();
            } catch (e) {
                console.error(e);
            }
    
            return +decimals;
        },

        getBalance: async (address) => {
            let balance = BigNumber.from(0);
            if (!contract || !decimals) return balance;
    
            try {
                balance = await contract.balanceOf(address);
                // balance = utils.parseUnits("25148613.25", decimals);
                balance = balance.mul(utils.parseUnits("1", 18 - decimals));
            } catch (e) {
                console.error(e);
            }
    
            return balance;
        },

        allowance: async (address) => {
            let amount = BigNumber.from(0);
            if (!contract) return amount;
    
            try {
                amount = await contract.allowance(address, HexOneBootstrap_Addr.contract);
            } catch (e) {
                console.error(e);
            }
    
            return amount;
        },

        approve: async (amount) => {
            if (!contract) return { status: "failed" };
    
            try {
                const tx = await contract.approve(HexOneBootstrap_Addr.contract, amount);
                await tx.wait();
                // const [transferEvent] = tr.events;
            } catch (e) {
                console.error(e);
                if (e.code === 4001) {
                    return { status: "failed", error: "Approve failed! User denied transaction." };
                } else {
                    return { status: "failed" };
                }
            }
    
            return { status: "success" };
        },
    }

})();