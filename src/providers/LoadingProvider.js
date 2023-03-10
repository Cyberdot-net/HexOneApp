import React, { useState } from 'react';

import { LoadingContext } from "./Contexts";

const LoadingProvider = ({ children }) => {
  const [ show, setShow ] = useState(false);
  const [ msg, setMsg ] = useState("");

  function showLoading(msg = null) {
    setMsg(msg || "Loading...");
    setShow(true);
  }

  function hideLoading() {
    setMsg("");
    setShow(false);
  }

  return (
    <LoadingContext.Provider
      value={{
        show,
        msg,
        showLoading,
        hideLoading
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingProvider;
