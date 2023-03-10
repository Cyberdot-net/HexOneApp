import React, { useState } from 'react';

import { ConnectWalletContext } from "./Contexts";

const ConnectWalletProvider = ({ children }) => {
  const [open, setOpen] = useState(false);

  function showModal(show) {
    setOpen(show);
  }

  return (
    <ConnectWalletContext.Provider
      value={{
        open,
        showModal
      }}
    >
      {children}
    </ConnectWalletContext.Provider>
  );
};

export default ConnectWalletProvider;
