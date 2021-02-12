import React from "react";

import Web3Modal from "web3modal";
import Portis from "@portis/web3";

let network = "rinkeby";

const providerOptions = {
  portis: {
    package: Portis, // required
    options: {
      id: process.env.REACT_APP_PORTIS_ID, // required
    },
  },
};

const web3Modal = new Web3Modal({
  network,
  cacheProvider: true, // optional
  providerOptions, // required
  theme: {
    background: "#36235e",
    main: "white",
    secondary: "#f5f5f5",
    border: "#d63771",
    hover: "rgba(241, 36, 255, 0.1)",
  },
});

export const Web3ModalContext = React.createContext(web3Modal);
