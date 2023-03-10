import React, { useContext } from "react";

import { LoadingContext } from "providers/Contexts";

export default function Loading() {

  const { show, msg } = useContext(LoadingContext);

  return (
    show && <div className="loading">
      <div className="backdrop fade show"></div>
      <div className="walletInfo">
        <img
          alt="loading"
          src={require("assets/img/loading.gif")}
          width="70"
          height="auto"
          className="mr-3"
        />
        <p className="connectWalletText">
          {msg || "Loading ..."}
        </p>
      </div>
    </div>
  );
}
