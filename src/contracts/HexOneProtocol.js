import { Contract } from "ethers";
import { HexOneProtocol_Abi } from "./abis";
import { HexOneProtocol_Addr } from "./address";

const HexOneProtocol = () => {
    let provider = null;
    let contract = null;

    const SetProvider = (newProvider) => {
        provider = newProvider;
        contract = new Contract(HexOneProtocol_Addr.contract, HexOneProtocol_Abi, provider);
    }

    const DepositCollateral = async (amount, duration, commit) => {
        if (!contract) return false;

        try {
            // const tx = await contract.depositCollateral(HexOneProtocol_Addr.contract, amount, duration, commit);
            // const tr = await tx.wait();
            // const event = tr.events.find(event => event.event === 'Transfer');
            // const [transferEvent] = tr.events;
        } catch (e) {
            console.error(e);
            return false;
        }

        return true;
    }

    return {
        setProvider: (provider) => {
            SetProvider(provider);
        },

        depositCollateral: async (amount, duration, commit) => {
            return await DepositCollateral(amount, duration, commit);
        },
    }
};

export default HexOneProtocol();