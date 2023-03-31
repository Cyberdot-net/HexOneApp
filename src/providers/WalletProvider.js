import React, { useState } from 'react';

import { WalletContext } from "./Contexts";

const WalletProvider = ({ children }) => {
  const [ provider, setWalletProvider ] = useState(null);
  const [ address, setWalletAddress ] = useState("");
  const [ open, setOpen ] = useState(false);

  function showModal(show) {
    setOpen(show);
  }

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
        open,
        showModal,
        setProvider,
        setAddress
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
