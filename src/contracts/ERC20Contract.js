import { Contract, BigNumber, utils } from "ethers";
import { ERC20_Abi } from "./abis";

export default (function () {

    let contract = null;
    let decimals = 8;

    return {

        connected: () => {
            return contract !== null;
        },

        setProvider: (provider, token) => {
            if (provider) {
                contract = new Contract(token, ERC20_Abi, provider.getSigner());
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

        totalSupply: async () => {
            let supply = BigNumber.from(0);
            if (!contract || !decimals) return supply;

            try {
                supply = await contract.totalSupply();
                // balance = utils.parseUnits("25148613.25", decimals);
            } catch (e) {
                console.error(e);
            }

            return supply;
        },

        getSymbol: async () => {
            let symbol = "";
            if (!contract) return symbol;

            try {
                symbol = await contract.symbol();
            } catch (e) {
                console.error(e);
            }

            return symbol;
        },

        allowance: async (owner, spender) => {
            let amount = BigNumber.from(0);
            if (!contract) return amount;

            try {
                amount = await contract.allowance(owner, spender);
            } catch (e) {
                console.error(e);
            }

            return amount;
        },

        approve: async (spender, amount) => {
            if (!contract) return { status: "failed" };

            try {
                const tx = await contract.approve(spender, amount);
                await tx.wait();
                // const [transferEvent] = tr.events;
            } catch (e) {
                if (e.error?.message) {
                    return { status: "failed", error: "Approve failed! " + e.error?.message };
                } else if (e.message) {
                    return { status: "failed", error: "Approve failed! " + (e.data?.message ? e.data.message : e.message) };
                } else {
                    return { status: "failed", error: "Approve failed!" };
                }
            }

            return { status: "success" };
        },
    }

})();