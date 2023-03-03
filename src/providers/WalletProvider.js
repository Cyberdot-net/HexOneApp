import React, { useState } from 'react';

export const WalletContext = React.createContext({});

const WalletProvider = ({ children }) => {
  const [provider, setWalletProvider] = useState(null);
  const [address, setWalletAddress] = useState("");

  // useEffect(() => {
  //   async function getWalletAddress() {
  //     if (typeof window.ethereum !== 'undefined') {
  //       // Enable Ethereum
  //       await window.ethereum.enable();

  //       // Get wallet address
  //       const walletProvider = new ethers.providers.Web3Provider(window.ethereum);
  //       const walletAddress = await walletProvider.getSigner().getAddress();

  //       setWalletProvider(walletProvider);
  //       setWalletAddress(walletAddress);
  //     }
  //   }

  //   getWalletAddress();
  // }, []);

  async function setProvider(provider) {
    setWalletProvider(provider);
    if (provider) {
      const address = await provider.getSigner().getAddress();
      setWalletAddress(address);
    } else {
      setWalletAddress("");
    }
  }

  async function setAddress(address) {
    setWalletAddress(address);
  }

  return (
    <WalletContext.Provider
      value={{
        provider,
        address,
        setProvider,
        setAddress
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
