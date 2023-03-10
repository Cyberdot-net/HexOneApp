import React, { useState } from 'react';

import { MessageContext } from "./Contexts";

const MessageProvider = ({ children }) => {
  const [ msg, setMsg ] = useState(false);
  const [ error, setError ] = useState(false);

  function showMessage(msg, type) {
    setMsg(msg);
    setError(type === "error" ? true : false);
  }

  function hideMessage() {
    setMsg("");
  }

  return (
    <MessageContext.Provider
      value={{
        msg,
        error,
        showMessage,
        hideMessage
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export default MessageProvider;
