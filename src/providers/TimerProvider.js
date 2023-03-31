import React, { useEffect, useState } from 'react';

import { TimerContext } from "./Contexts";

const TimerProvider = ({ children }) => {
  const [ timer, setTimer ] = useState(null);

  useEffect(() => {

    const timerId = setInterval(() => {
      setTimer(new Date().getTime());
    }, 1000 * 60); // 1 minute

    return () => {  
      clearInterval(timerId);
    };
    
  }, []);

  return (
    <TimerContext.Provider
      value={{
        timer
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export default TimerProvider;
