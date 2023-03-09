import React from "react";

export default function Loading(props) {

  return (
    <div className="loading">
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
          {props.msg ? props.msg : "Loading ..."}
          {/* Loading... <span>Wait a moment.</span> */}
        </p>
      </div>
    </div>
  );
}
