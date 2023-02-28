import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import "assets/css/nucleo-icons.css";
import "assets/scss/index.scss";

import App from "App";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <App></App>
  </BrowserRouter>
);
