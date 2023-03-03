import React, { useState } from 'react';

export const ModalContext = React.createContext({});

const ModalProvider = ({ children }) => {
  const [open, setOpen] = useState(false);

  function showModal(show) {
    setOpen(show);
  }

  return (
    <ModalContext.Provider
      value={{
        open,
        showModal
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
